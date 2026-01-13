import Link from "next/link";
import Image from "next/image";
import icon from "@/app/icon.png";

export default function NavBar() {
    return(
        <div className="hidden bg-black text-white shadow-sm w-full lg:block md:w-64">
                <Link
                  href="/"
                  className="font-bold tracking-[0.25em] text-2xl uppercase py-5 px-8 mb-3 inline-block"
                >
                  <Image
                    src={icon}
                    alt="La CLEF Logo"
                    width={96}
                    height={96}
                    className="mx-auto mt-2 h-24 w-24 logo-white"
                    priority
                  />
                </Link>
        </div>
    )
}
