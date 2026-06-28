import prisma from "@/db/prisma";
import { LogEvent } from "@/utils/sentry";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {
    const userID = request.headers.get("userdb")
    if (!userID) {
        LogEvent("user doesn't exist", "auth", {}, "warning")
        return;
    }
    const user = await prisma.user.findFirst({
        where: {
            id: userID
        }
    })

    NextResponse.json({
        balance: user?.usd_balance
    })
}