"use client";


import Link from "next/link";
import Image from "next/image";
import icon from "@/app/icon.png";
import type { NavLink } from "@/lib/apps";
import { usePathname } from "next/navigation";


export default function NavBar({ links }: { links: NavLink[]}) {
  const pathname = usePathname();

  const navLinkClass =
  "font-bold text-white hover:text-black text-md tracking-widest px-8 py-4 transition-colors hover:bg-[linear-gradient(100deg,_white,_grey)]";

  const navLinkActiveClass = 
  "bg-[linear-gradient(100deg,_#000000_20%,_grey_60%,_#cccccc_100%)]"


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

        {/* SECTION NAV LINKS */}
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const isBaseRoute = links.some(
                (other) =>
                  other.href !== link.href &&
                  other.href.startsWith(`${link.href}/`)
              );
              const isActive = isBaseRoute
                ? pathname === link.href
                : pathname?.startsWith(link.href);
              const Icon = link.Icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navLinkClass} ${
                    isActive ? navLinkActiveClass : "text-black-800"
                  } inline-flex items-center gap-2`}
                  aria-current={isActive ? "page" :undefined}
                >
                  {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                  {link.label}
                </Link>
              );
            })}
          </nav>
  </div>
    )
}
