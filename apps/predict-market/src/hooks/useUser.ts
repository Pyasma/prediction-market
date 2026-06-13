import { useEffect, useState } from "react"
import { useSupabase } from "@/src/lib/supabase-client"
import { JwtPayload } from "@supabase/supabase-js"

export const useUser = () => {
    const [claims, setClaims] = useState<JwtPayload | null>(null)
    const supabase = useSupabase()

    useEffect(()=> {
        supabase.auth.getClaims().then(({data}) => {
        setClaims(data?.claims ?? null)
        })
        const {
        data: {subscription},
        } = supabase.auth.onAuthStateChange(() => {
        supabase.auth.getClaims().then(({data}) => {
            setClaims(data?.claims ?? null)
        })
        }) 

        return () => subscription.unsubscribe()
    },[])
    
    return { claims }
}