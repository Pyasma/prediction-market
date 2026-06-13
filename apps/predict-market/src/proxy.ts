import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
)

export default async function proxy(request: NextRequest) {
    const token = request.headers.get("authorization") ?? undefined

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 403 })
        }

        const address = user?.user_metadata?.custom_claims?.address

        const response = NextResponse.next()
        response.headers.set("address", address ?? "")
        return response

    } catch(e) {
        console.log(e)
        return NextResponse.json({ message: "Invalid credentials" }, { status: 403 })
    } 
}

export const config = {
    matcher: "/api/:path*"  
}