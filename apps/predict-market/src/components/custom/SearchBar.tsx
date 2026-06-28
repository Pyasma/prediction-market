import { Search } from "lucide-react"


export function SearchBar({ className, placeholder="Search polymarkets..." }: { className?: string, placeholder?: string }) {
    return (
        <div className="flex border bg-[#1e2327] text-lg items-center px-3 py-2 w-full max-w-[600px] lg:max-w-[800px] rounded-sm">
            <Search className="h-5 w-5 mr-4 text-gray-500"/>
            <input
                type="text"
            placeholder={placeholder}
                className="outline-none appearance-none text-[16px]"
            />
        </div>
    )
}
