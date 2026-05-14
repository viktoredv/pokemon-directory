"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Browse", icon: Home },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-md pb-safe"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around px-4 pt-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={20}
                  className={cn(
                    "transition-transform",
                    active && "scale-110",
                  )}
                  fill={active && label === "Favorites" ? "currentColor" : "none"}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
