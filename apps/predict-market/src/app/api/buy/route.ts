import prisma from "@/db/prisma";
import { CreateOrderSchema, OrderBook } from "@/lib/types/types";
import { LogEvent } from "@/utils/sentry";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    console.log("Buy route hit!")
    const body = await request.json();
    const { success, data } = CreateOrderSchema.safeParse(body);
    const userID = request.headers.get("x-userdb")

    if (!success) {
        LogEvent("Wrong Data Submitted!", 'Order', {}, 'warning');
        return NextResponse.json({ success: false, message: "Wrong Data Submitted!" });
    }

    await prisma.$transaction(async tx => {
        const response = await tx.$queryRaw<{ yes_ord: string, no_ord:  string, id: string, totalqty: number}[]>`SELECT * FROM "Market" WHERE id = ${parseInt(data.marketID)} FOR UPDATE`;
        const userresponse = await tx.$queryRaw<{id: string, address:string, usd_balance: number}[]>`SELECT * FROM "User" WHERE ${userID}`
        const market = response[0]
        const user = userresponse[0]
        if (!market) {
            LogEvent("market not present", 'market', {}, 'warning');
            return
        }

        if (!user) {
            LogEvent("user not present", 'user', {},  'warning')
            return
        }

        const yes_ord: OrderBook = JSON.parse(market.yes_ord)
        const no_ord: OrderBook = JSON.parse(market.no_ord)

        if (data.side == "yes"){
            const usd = data.qty * data.price

            if (user.usd_balance < usd) {
                NextResponse.json({success: false, message:"User usd Balance not enough"},{status: 403})
                return;
            }
            let leftqty = data.qty;
            const prices = Object.keys(yes_ord).sort((a: string,b: string) => Number(a) - Number(b))
            await Promise.all(prices.map( async price => {
                if (Number(price) > data.price) {
                    return;
                }
                const {availableamount, orders} = yes_ord[price]!;
                await Promise.all(orders.map(async order => {
                    if (order.qty >= leftqty){ 
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID: order.userId,
                                    marketID:data.marketID,
                                    type:"yes"
                                }
                            },
                            data: {
                                qty: {
                                    decrement: leftqty
                                }
                            }
                        })
                        order.qty -= leftqty
                        leftqty = 0

                    }
                }))
                await Promise.all(orders.map(async order => {
                    if (order.qty >= leftqty){ 
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID: order.userId,
                                    marketID:data.marketID,
                                    type:"yes"
                                }
                            },
                            data: {
                                qty: {
                                    increment: order.qty * Number(price)
                                }
                            }
                        })
                        order.qty -= leftqty
                        leftqty = 0

                    }
                }))
            }))
        }
    });
    return NextResponse.json({success: true, message: "it worked!!!"})
}