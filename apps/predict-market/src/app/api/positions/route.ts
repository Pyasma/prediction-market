import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const userID : string  = request.headers.get("userdb") as string
    const history = await prisma.orderHistory.findMany({
        where: {
            userId: userID
        }
    })

    NextResponse.json({
        history
    })
}