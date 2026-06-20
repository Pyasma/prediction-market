import { useEffect, useState } from "react"
import { JwtPayload, SupabaseClient } from "@supabase/supabase-js"

export const useUser = (supabase?: SupabaseClient | null) => {

    const [claims, setClaims] = useState<JwtPayload | null>(null)

    useEffect(()=> {
        if (!supabase?.auth) {
          return
        }

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
    },[supabase])
    
    return { claims }
}
