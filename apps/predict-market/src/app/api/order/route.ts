import prisma from "@/db/prisma";
import { CreateOrderSchema, OrderBook } from "@/lib/types/types";
import { LogEvent } from "@/utils/sentry";
import { NextRequest, NextResponse } from "next/server";
import { uuid } from "uuidv4";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { success, data } = CreateOrderSchema.safeParse(body);
    const userIDHeader = request.headers.get("userdb")
    if (!userIDHeader) {
        LogEvent("User not Authorized!", 'Order', {}, 'warning');
        return NextResponse.json({ success: false, message: "User not Authoized!" });
    }
    const userID: string = userIDHeader

    const originalOrderId = uuid()

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
       
// If you want to buy Yes Stock         

        if (data.side == "yes" && data.type == "buy"){
            const usd = data.qty * data.price

            if (user.usd_balance < usd) {
                NextResponse.json({success: false, message:"User usd Balance not enough"},{status: 403})
                return;
            }
            let leftqty = data.qty;
            const prices = Object.keys(yes_ord).sort((a: string,b: string) => Number(a) - Number(b))

            for (const price of prices) {
                if (Number(price) > data.price) {
                    continue;
                }
                const { orders } = yes_ord[price]!;
                
                for (const order of orders) {
                    if (leftqty <= 0) {
                        break;
                    }
                    
                    const matchedQty = order.qty >= leftqty ? leftqty : order.qty
                    const reverseOrder = order.reverseOrder;


//  ================================ Match against a normal sell-Yes order  ================================

// The seller's Yes position decreases and their USD increases

                    if (!reverseOrder){
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
                                    decrement: matchedQty
                                }
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: order.userId,
                            },
                            data: {
                                usd_balance: {
                                    increment: matchedQty * Number(price)
                                }
                            }
                        })    
                    }
// ============================== Unreachable: reverse orders only exist in the No book  ===================================
// (Leftover buy-Yes becomes sell-No, not a Yes-book order — this branch is dead code)

                    else {
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID:userID,
                                    marketID:data.marketID,
                                    type:"no"
                                }
                            },
                            data: {
                                qty: {
                                    increment: matchedQty
                                }  
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: userID,
                            },
                            data: {
                                usd_balance: {
                                    decrement: matchedQty * Number(price)
                                } 
                            }
                        })
                    }
// Give the buyer the matched Yes shares (create their position if first time)
                    await prisma.position.upsert({
                        where: {
                            userID_marketID_type: {
                                userID: userID,
                                marketID: data.marketID,
                                type: "yes"
                            }
                        },
                        update: {
                            qty: {
                                increment: matchedQty
                            }
                        },
                        create: {
                            userID: userID,
                            marketID: data.marketID,
                            type: "yes",
                            qty: matchedQty
                        }
                    })
// Deduct USD from buyer for the matched shares
                    await prisma.user.update({
                        where: {
                            id: userID
                        },
                        data: {
                            usd_balance: {
                                decrement: Number(price)* matchedQty
                            }
                        }
                    })
                    
                    
// leftQty being updated removing the matchedQty                     
                    leftqty -= matchedQty
                    order.filledQty += matchedQty;
                    yes_ord[price]!.availableQty -= matchedQty
                }
            }
            if (leftqty > 0) {
                const oppositePrice = 100-data.price
                if (!no_ord[oppositePrice]) {
                    no_ord[oppositePrice] = {availableQty: 0, orders: []}
                }
                no_ord[oppositePrice]!.availableQty += leftqty
                no_ord[oppositePrice]!.orders.push({qty: leftqty,userId: userID, filledQty:0, originalOrderId, reverseOrder: true})
            }

        }

// if you have Yes Stocks and want to sell them

        if (data.side == "yes" && data.type == "sell"){

            const buyPrice = 100-data.price // No Price

// to sell we need to know if user exist or not 
            const userPosition = await prisma.position.findFirst({
                where: {
                    userID: userID,
                    marketID: data.marketID,
                    type: "yes"
                }
            })
            if (!userPosition || userPosition?.qty < data.qty) {
                return
            }
            let leftqty = data.qty

            const prices = Object.keys(no_ord).sort((a: string, b: string) => (Number(a)- Number(b)))


            for (const price of prices) {
                if (Number(price) > buyPrice) {
                    continue
                }
                const { orders } = no_ord[price]!

                for (const order of orders) {
                    if (leftqty <= 0) {
                        return;
                    }
                                        
                    const matchedQty = order.qty >= leftqty ? leftqty : order.qty
                    const reverseOrder = order.reverseOrder;


//  ================================ Match against a normal sell-No order  ================================

// The No seller's position decreases and their USD increases

                    if (!reverseOrder){
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID: order.userId,
                                    marketID:data.marketID,
                                    type:"no"
                                }
                            },
                            data: {
                                qty: {
                                    decrement: matchedQty
                                }
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: order.userId,
                            },
                            data: {
                                usd_balance: {
                                    increment: matchedQty * Number(price)
                                }
                            }
                        })    
                    }
// ============================== Match against a reverse order (unmet buy-Yes)  ===================================
// The Yes seller takes on the matched Yes position from the original unmet buy-Yes order

                    else {
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID:userID,
                                    marketID:data.marketID,
                                    type:"yes"
                                }
                            },
                            data: {
                                qty: {
                                    increment: matchedQty
                                }  
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: userID,
                            },
                            data: {
                                usd_balance: {
                                    decrement: (100 - Number(price)) * matchedQty
                                } 
                            }
                        })
                    }
// Decrement the seller's Yes position (giving up shares)
                    await prisma.position.update({
                        where: {
                            userID_marketID_type: {
                                userID: userID,
                                marketID: data.marketID,
                                type: "yes"
                            }
                        },
                        data: {
                            qty: {
                                decrement: matchedQty
                            }
                        }
                    })
// BUG?: seller should GAIN USD when selling — direction and amount need review
// Current: seller loses `Number(price) * matchedQty`
// Expected: seller gains `data.price * matchedQty` (their ask price)
                    await prisma.user.update({
                        where: {
                            id: userID
                        },
                        data: {
                            usd_balance: {
                                decrement: Number(price)* matchedQty
                            }
                        }
                    })
                    
                    
// leftQty being updated removing the matchedQty                     
                    leftqty -= matchedQty
                    order.filledQty += matchedQty;
                    no_ord[price]!.availableQty -= matchedQty
                }
            }
            if (leftqty > 0) {
                const oppositePrice = 100-data.price
                if (!yes_ord[oppositePrice]) {
                    yes_ord[oppositePrice] = {availableQty: 0, orders: []}
                }
                yes_ord[oppositePrice]!.availableQty += leftqty
                yes_ord[oppositePrice]!.orders.push({qty: leftqty,userId: userID, filledQty:0, originalOrderId, reverseOrder: false})
            }

        }

        if (data.side == "no" && data.type == "buy") {
            const usd = data.qty * data.price

            if (user.usd_balance < usd) {
                NextResponse.json({success: false, message:"User usd Balance not enough"},{status: 403})
                return;
            }
            let leftqty = data.qty;
            const prices = Object.keys(no_ord).sort((a: string,b: string) => Number(a) - Number(b))

            for (const price of prices) {
                if (Number(price) > data.price) {
                    continue;
                }
                const { orders } = no_ord[price]!;
                
                for (const order of orders) {
                    if (leftqty <= 0) {
                        break;
                    }
                    
                    const matchedQty = order.qty >= leftqty ? leftqty : order.qty
                    const reverseOrder = order.reverseOrder;


//  ================================ Match against a normal sell-No order  ================================

// The No seller's position decreases and their USD increases

                    if (!reverseOrder){
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID: order.userId,
                                    marketID:data.marketID,
                                    type:"no"
                                }
                            },
                            data: {
                                qty: {
                                    decrement: matchedQty
                                }
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: order.userId,
                            },
                            data: {
                                usd_balance: {
                                    increment: matchedQty * Number(price)
                                }
                            }
                        })    
                    }
// ============================== Unreachable: reverse orders only exist in the No book  ===================================
// (Leftover buy-No becomes sell-Yes, not a No-book order)

                    else {
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID:userID,
                                    marketID:data.marketID,
                                    type:"yes"
                                }
                            },
                            data: {
                                qty: {
                                    increment: matchedQty
                                }  
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: userID,
                            },
                            data: {
                                usd_balance: {
                                    decrement: matchedQty * Number(price)
                                } 
                            }
                        })
                    }
// Give the buyer the matched No shares (create their position if first time)
                    await prisma.position.upsert({
                        where: {
                            userID_marketID_type: {
                                userID: userID,
                                marketID: data.marketID,
                                type: "no"
                            }
                        },
                        update: {
                            qty: {
                                increment: matchedQty
                            }
                        },
                        create: {
                            userID: userID,
                            marketID: data.marketID,
                            type: "no",
                            qty: matchedQty
                        }
                    })
// Deduct USD from buyer for the matched shares
                    await prisma.user.update({
                        where: {
                            id: userID
                        },
                        data: {
                            usd_balance: {
                                decrement: Number(price)* matchedQty
                            }
                        }
                    })
                    
                    
// leftQty being updated removing the matchedQty                     
                    leftqty -= matchedQty
                    order.filledQty += matchedQty;
                    no_ord[price]!.availableQty -= matchedQty
                }
            }
            if (leftqty > 0) {
                const oppositePrice = 100-data.price
                if (!yes_ord[oppositePrice]) {
                    yes_ord[oppositePrice] = {availableQty: 0, orders: []}
                }
                yes_ord[oppositePrice]!.availableQty += leftqty
                yes_ord[oppositePrice]!.orders.push({qty: leftqty, userId: userID, filledQty:0, originalOrderId, reverseOrder: true})
            }

        }

        if (data.side == "no" && data.type == "sell") {

            const buyPrice = 100-data.price // No Price

// to sell we need to know if user exist or not 
            const userPosition = await prisma.position.findFirst({
                where: {
                    userID: userID,
                    marketID: data.marketID,
                    type: "no"
                }
            })
            if (!userPosition || userPosition?.qty < data.qty) {
                return
            }
            let leftqty = data.qty

            const prices = Object.keys(yes_ord).sort((a: string, b: string) => (Number(a)- Number(b)))


            for (const price of prices) {
                if (Number(price) > buyPrice) {
                    continue
                }
                const { orders } = yes_ord[price]!

                for (const order of orders) {
                    if (leftqty <= 0) {
                        return;
                    }
                                        
                    const matchedQty = order.qty >= leftqty ? leftqty : order.qty
                    const reverseOrder = order.reverseOrder;


//  ================================ Match against a normal sell-Yes order  ================================

// The Yes seller's position decreases and their USD increases

                    if (!reverseOrder){
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
                                    decrement: matchedQty
                                }
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: order.userId,
                            },
                            data: {
                                usd_balance: {
                                    increment: matchedQty * Number(price)
                                }
                            }
                        })    
                    }
// ============================== Match against a reverse order (unmet buy-Yes converted to sell-No)  ===================================
// The No seller takes on the matched No position from the original order

                    else {
                        await prisma.position.update({
                            where: {
                                userID_marketID_type: {
                                    userID:userID,
                                    marketID:data.marketID,
                                    type:"no"
                                }
                            },
                            data: {
                                qty: {
                                    increment: matchedQty
                                }  
                            }
                        })
                        await prisma.user.update({
                            where: {
                                id: userID,
                            },
                            data: {
                                usd_balance: {
                                    decrement: (100 - Number(price)) * matchedQty
                                } 
                            }
                        })
                    }
// Decrement the seller's No position (giving up shares)
                    await prisma.position.update({
                        where: {
                            userID_marketID_type: {
                                userID: userID,
                                marketID: data.marketID,
                                type: "no"
                            }
                        },
                        data: {
                            qty: {
                                decrement: matchedQty
                            }
                        }
                    })
// BUG?: seller should GAIN USD when selling — direction and amount need review
// Current: seller loses `Number(price) * matchedQty`
// Expected: seller gains `data.price * matchedQty` (their ask price)
                    await prisma.user.update({
                        where: {
                            id: userID
                        },
                        data: {
                            usd_balance: {
                                decrement: Number(price)* matchedQty
                            }
                        }
                    })
                    
                    
// leftQty being updated removing the matchedQty                     
                    leftqty -= matchedQty
                    order.filledQty += matchedQty;
                    yes_ord[price]!.availableQty -= matchedQty
                }
            }
            if (leftqty > 0) {
                const oppositePrice = 100-data.price
                if (!no_ord[oppositePrice]) {
                    no_ord[oppositePrice] = {availableQty: 0, orders: []}
                }
                no_ord[oppositePrice]!.availableQty += leftqty
                no_ord[oppositePrice]!.orders.push({qty: leftqty,userId: userID, filledQty:0, originalOrderId, reverseOrder: false})
            }


        }

        await tx.market.update({
            data: {
                yes_ord: JSON.stringify(yes_ord),
                no_ord: JSON.stringify(no_ord)
            },
            where: {
                id: data.marketID
            }
        })

    });
    return NextResponse.json({success: true, message: "Order Route Hit"})
}