import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {

    const userID = request.headers.get("userdb")
    const market = await prisma.market.findFirst({
        where: {
            id: userID as string,
        }
    })

    return NextResponse.json({market})
}