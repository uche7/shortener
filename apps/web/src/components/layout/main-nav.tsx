"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Create" },
  { href: "/decode", label: "Decode" },
  { href: "/links", label: "Links" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "rounded-md px-2 py-1.5 text-sm transition-colors hover:text-foreground sm:px-3",
            pathname === href
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
