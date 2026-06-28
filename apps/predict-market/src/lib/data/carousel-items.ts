import { TrendingUp, VolleyballIcon } from "lucide-react"
import type { ComponentType } from "react"

export type CarouselItem = {
  label: string
  href: string
  active?: boolean
  icon?: ComponentType<{ className?: string }>
}

export const carouselItems: CarouselItem[] = [
  { label: "Trending", href: "/trending", icon: TrendingUp },
  { label: "World Cup", href: "/world-cup", active: true, icon: VolleyballIcon },
  { label: "Breaking", href: "/breaking" },
  { label: "Politics", href: "/politics" },
  { label: "Sports", href: "/sports" },
  { label: "Crypto", href: "/crypto" },
  { label: "Esports", href: "/esports" },
  { label: "Iran", href: "/iran" },
  { label: "Finance", href: "/finance" },
  { label: "Geopolitics", href: "/geopolitics" },
  { label: "Tech", href: "/tech" },
  { label: "Culture", href: "/culture" },
  { label: "Economy", href: "/economy" },
  { label: "Weather", href: "/weather" },
  { label: "Mentions", href: "/mentions" },
  { label: "Elections", href: "/elections" },
  { label: "More", href: "/more" },
]
