import prisma from "@/db/prisma";
import { SplitSchema } from "@/lib/types/types";
import { LogEvent } from "@/utils/sentry";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    const body = await request.json()
    const { data, success } = SplitSchema.safeParse(body)
    const userID = request.headers.get("userdb")
    
    if (!userID) {
        return NextResponse.json({ success: false, message: "User not Authorized!" });
    }

    if (!success) {
            LogEvent("Wrong Data Submitted!", 'Order', {}, 'warning');
            return NextResponse.json({ success: false, message: "Wrong Data Submitted!" });
    }

    await prisma.$transaction( async tx => {
        const userresponse = await tx.$queryRaw<{id: string, address:string, usd_balance: number}[]>`SELECT * FROM "User" WHERE ${userID}`
        const userRes = userresponse[0] 

        if (!userRes) {
            throw new Error("User not Found")
        }

        if (userRes.usd_balance < data.amount) {
            return NextResponse.json({success: false, message: "Sorry you are not allowed to do this"})
        }

        await tx.user.update({
            where:{
                id: userID
            },
            data: {
                usd_balance: {
                    decrement: data.amount
                }
            }
        })

        await tx.position.upsert({
            where:{
                userID_marketID_type:{
                    userID,
                    marketID: data.markedID,
                    type: "yes"
                }
            },
            create: {
                marketID: data.markedID,
                userID,
                type: "yes",
                qty: data.amount
            },
            update: {
                qty: {
                    increment: data.amount
                }
            }

        })
        await tx.user.update({
            where:{
                id: userID
            },
            data: {
                usd_balance: {
                    decrement: data.amount
                }
            }
        })

        await tx.position.upsert({
            where:{
                userID_marketID_type:{
                    userID,
                    marketID: data.markedID,
                    type: "no"
                }
            },
            create: {
                marketID: data.markedID,
                userID,
                type: "no",
                qty: data.amount
            },
            update: {
                qty: {
                    increment: data.amount
                }
            }

        })
    })
    return NextResponse.json({})
}