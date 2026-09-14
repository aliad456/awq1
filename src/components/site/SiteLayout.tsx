import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FallingEmojis } from "@/components/site/FallingEmojis";
import { AuthButton } from "@/components/site/AuthButton";

const NAV = [
  { to: "/", label: "ראשי" },
  { to: "/about", label: "על המשחק" },
  { to: "/play", label: "למשחק" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: "url(/images/bg-main.webp)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(120%_80%_at_50%_0%,oklch(0.3_0.06_60/35%),transparent_70%)]"
      />
      <FallingEmojis />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/images/logo-mark.webp"
              alt="סמל A Warrior Quest"
              className="h-8 w-8 rounded-full object-cover"
              loading="eager"
            />
            <span className="text-[15px] font-semibold tracking-tight">
              A Warrior Quest
            </span>
          </Link>

          {/* Desktop: inline nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-foreground" }}
                className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AuthButton />

            {/* Mobile only: the same nav as a side drawer */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="פתיחת תפריט">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-sidebar">
                <SheetHeader className="text-right">
                  <SheetTitle className="text-base font-semibold">תפריט</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pb-6">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-secondary text-foreground" }}
                      className="rounded-lg px-3 py-2.5 text-base text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-border/50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-xs text-muted-foreground">
          <img
            src="/images/logo.webp"
            alt="לוגו A Warrior Quest"
            className="h-10 w-auto opacity-70"
            loading="lazy"
          />
          <p>© {new Date().getFullYear()} A Warrior Quest</p>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
