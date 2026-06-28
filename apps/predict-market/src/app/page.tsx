'use client'

import { SearchBar } from "@/components/custom/SearchBar"
import { Stocks } from "@/components/custom/Stocks-Blocks"
import { useUser } from "@/hooks/useUser"
import { useSupabase } from "@/lib/supabase-client"



const Home = () => {
  const supabase = useSupabase()
  const { claims } = useUser(supabase)
  return (
    // <div className="break-all overflow-hidden">
    //   {!claims && <Button onClick={() => {
    //     supabase.auth.signInWithWeb3({
    //       chain: 'solana',
    //       statement: 'I accept the Terms of services'
    //     })
    //   }} className="bg-white text-black">
    //     Sign-in with Solana
    //   </Button>}
    //   {claims && 
    //   <Button
    //     onClick={() => {supabase.auth.signOut()}}>
    //     Logout
    //   </Button>}
    //   <p className="break-all">{JSON.stringify(claims)}</p>
    //   <Button onClick={async () => {
    //     console.log("temp")
    //   }}>Buy</Button>
    <div>
      <div className="hidden max-[1000px]:flex justify-center px-4 py-2">
        <SearchBar placeholder="Search" />
      </div>
      <Stocks />
    </div>

    // </div>
    
  )
}

export default Home

