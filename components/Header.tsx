import { Croissant, Headset, Music, PersonStanding } from "lucide-react";

export default function Header() {
    const iconClass = 
    "h-10 w-10 text-black border border-black p-2 rounded-md hover:scale-98 transition-transform cursor-pointer hover:bg-black hover:text-white";

    return(
        <header className="flex w-full items-center justify-between bg-white border-b px-4 py-4 shadow-sm">
            <div className="flex items-center gap-4">
            <Music className={iconClass}/>
            <PersonStanding className={iconClass}/>
            <Croissant className={iconClass} />
            <Headset className={iconClass} />
            </div>
            {/* <AuthStatus /> */}
        </header>
    )
}