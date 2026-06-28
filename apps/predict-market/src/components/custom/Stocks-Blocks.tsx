import { Bookmark, Gift, TrendingUp } from "lucide-react"
import { Button } from "../ui/button"
import { ProbabilityRing } from "./percentage-ring"
import { useState } from "react"


export function Stocks() {
    const [clicked, setState] = useState(0) 

    return (
        <div className="m-5 flex flex-col rounded-xl border bg-[#1e2327] text-lg gap-5 px-5 py-2.5 w-full max-w-[600px] lg:max-w-[800px]">
            <div className="flex gap-4">
                <span>image</span>
                <h4>World Cup Winner</h4>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex justify-between">
                    <span>France</span>
                    <div className="flex gap-1">
                        <Button className="rounded-md">Yes</Button>
                        <Button className="rounded-md">No</Button>
                    </div>
                </div>

                <div className="flex justify-between">
                    <span>Argentina</span>
                    <div className="flex gap-1">
                        <Button className="rounded-md">Yes</Button>
                        <Button className="rounded-md">No</Button>
                    </div>
                </div>
                <div className="flex justify-between text-[#7b8996] text-sm">
                    <span>$3B Vol.</span>
                    <div className="flex gap-1 h-14 w-14">
                        <TrendingUp />
                        <Gift/>
                        <Bookmark className="cursor-pointer" fill={clicked ? "currentColor" : "none"} onClick={() => setState(clicked ? 0: 1)}/>
                    </div>
                </div>

            </div>
        </div>
    )
}