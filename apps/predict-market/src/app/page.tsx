'use client'

import { Button } from "@/components/ui/button"
import { useUser } from "../hooks/useUser"
import { useSupabase } from "../lib/supabase-client"

const  Home = () => {
  const supabase = useSupabase()
  const { claims } = useUser()
  return (
    <div>
      {!claims && <Button onClick={() => {
        supabase.auth.signInWithWeb3({
          chain: 'solana',
          statement: 'I accept the Terms of services'
        })
      }} className="bg-white text-black">
        Sign-in with Solana
      </Button>}
      {claims && 
      <Button
        onClick={() => {supabase.auth.signOut()}}>
        Logout
      </Button>}
      {JSON.stringify(claims)}
      <Button onClick={async () => {
        console.log("temp")
      }}>Buy</Button>
    </div>
  )
}

export default Home


