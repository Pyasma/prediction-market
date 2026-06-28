import { Button } from "@/components/ui/button"
import { SearchBar } from "./SearchBar"
import Image from "next/image"
import { ChevronUp, ChevronDown, Gift, Bell } from "lucide-react";
import {   
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
 } from "../ui/carousel";
import { carouselItems } from "@/lib/data/carousel-items"
import Link from "next/link"



export function Headers() {
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between">
                <div className="m-3">
                    Polymarket
                </div>
                <div className="max-[1000px]:hidden flex-1 flex justify-center">
                        <SearchBar/>
                </div>

                <div className="flex gap-5 m-3 align-center text-center items-center">    

                    <div className="flex flex-col">
                        <p>Portfolio</p>
                        <p>Usd balance</p>
                    </div>
                    <div className="flex flex-col">
                        <p>Cash</p>
                        <p>Usd balance</p>
                    </div>
                    <Button className="bg-[#0091f9] text-white rounded-sm hover:bg-[#0a558b]">
                        Deposit
                    </Button>
                    <Gift className="h-8 w-8"/>
                    <Bell className="h-8 w-8"/>
                    <div className="h-8 w-px bg-border" />
                    <div className="group flex gap-3 items-center">
                        <div className="border border-border rounded-full w-8 h-8 bg-[radial-gradient(circle_at_25%_30%,rgba(120,255,255,0.8),transparent_40%),radial-gradient(circle_at_65%_75%,rgba(0,200,0,0.6),transparent_35%),linear-gradient(to_bottom_right,#3ddad7,#2ac7c4)]"></div>

                        <ChevronDown className="h-4 w-4 group-hover:hidden" />
                        <ChevronUp className="h-4 w-4 hidden group-hover:block" />
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center px-12 mt-10 border-b-2 border-border">
                <Carousel
                    opts={{ align: "start", slidesToScroll: 8, containScroll: "trimSnaps" }}
                    className="w-full max-w-[1500px]"
                >
                    <CarouselContent>
                        {carouselItems.map((item) => (
                        <CarouselItem key={item.href} className="basis-auto pl-0">
                            <Link
                                href={"/"}
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-lg font-medium transition-colors relative ${item.active ? "text-yellow-400 animate-pulse drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" : "text-muted-foreground"}`}>

                                {item.icon && <item.icon className="h-4 w-4" />}
                
                                {item.label}
                            </Link>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-1" />
                    <CarouselNext className="right-1" />
                </Carousel>
            </div>
        </div>
    )
}