import z from "zod"

export const CreateOrderSchema = z.object({
    marketID: z.string(),
    side: z.enum(["yes","no"]),
    type: z.enum(["buy","sell"]),
    price: z.int(),
    qty: z.int()
})

export type OrderBook = {[key: string] : {
    availableamount: number,
    orders: { userId:  string, qty: number, filledQty: number}[]
}}
