import prisma from "../db/prisma";
import { useUser } from "../hooks/useUser";
import { CreateOrderSchema } from "../lib/types/types";
import { LogEvent } from "../utils/sentry";


export async function buyShares(_prevstate: {success: boolean, message: string}, formData: FormData): Promise<{success: boolean, message: string}> {
    const { success, data } = CreateOrderSchema.safeParse(FormData)
    const user = useUser()
    const market  = await prisma.market.findFirst()
    if (!market || !market.resolution) {
        LogEvent("Market Doesn't Exist or Closed Already", "shares", {}, "warning")
    } 
    if (user) f
    // 1. Validate market
    // market exists?
    // market still open?
    // user allowed?

    // 2. Check user balance
    // enough USDC?

    // 3. Create order
    // buy YES 100 shares at $0.62

    // 4. Match against order book
    // find sellers willing to sell at that price

    // 5. Execute trades
    // transfer shares
    // transfer money

    // 6. Update positions
    // user now owns YES shares

    // 7. Persist trades/history
    // audit log / transaction history

    // 8. Handle blockchain settlement
    // on-chain or off-chain depending on architecture
}