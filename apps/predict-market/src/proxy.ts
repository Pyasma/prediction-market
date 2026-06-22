import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import prisma from "./db/prisma";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!)


export default async function middleware(request: NextRequest) {
    
    const token = request.headers.get("authorization") ?? undefined
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 403 })
        }

        const address : string = user?.user_metadata?.custom_claims?.address
        const userdb =  await prisma.user.upsert({
            where: {
                address,
            },
            update: {
                address,
            }, 
            create: {
                address,
                usd_balance: 0
            }
        })

        const userPayload = {
            ...userdb,
            userinfo: user,
        }
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("address", address ?? "")
        requestHeaders.set("userdb", JSON.stringify(userPayload))
        requestHeaders.set("userinfo", JSON.stringify(user))

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
        response.headers.set("address", address ?? "")
        response.headers.set("x-userdb", JSON.stringify(userPayload))
        response.headers.set("x-userinfo", JSON.stringify(user))
        return response

    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: "Invalid credentials" }, { status: 403 })
    } 
}

export const config = {
    matcher: "/api/:path*"  
}
