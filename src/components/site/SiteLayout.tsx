import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Swords } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FallingEmojis } from "@/components/site/FallingEmojis";

const NAV = [
  { to: "/", label: "דף ראשי", emoji: "🏰" },
  { to: "/about", label: "על המשחק", emoji: "📜" },
  { to: "/play", label: "כניסה למשחק", emoji: "⚔️" },
  { to: "/credits", label: "רכישת קרדיטים", emoji: "🪙" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/images/bg-main.webp)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/70 to-background"
      />
      <FallingEmojis />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo-mark.webp"
              alt="סמל A Warrior Quest"
              className="h-10 w-10 rounded-full border border-primary/40 object-cover"
              loading="eager"
            />
            <span className="font-display text-lg font-bold ember-text sm:text-xl">
              A Warrior Quest
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-primary" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="פתיחת תפריט הצד"
                className="border-primary/40"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-border bg-sidebar">
              <SheetHeader className="text-right">
                <SheetTitle className="font-display text-xl">תפריט המסע</SheetTitle>
                <SheetDescription>נווט בין אולמות הממלכה</SheetDescription>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4 pb-6">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{
                      className: "bg-secondary text-primary border-primary/50",
                    }}
                    className="flex items-center gap-3 rounded-md border border-transparent px-3 py-3 text-base font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto px-4 pb-6 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Swords className="h-4 w-4" aria-hidden="true" />
                  שלוש ערים. שלושה גיבורים. מורשת אחת.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-border/70 bg-background/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-muted-foreground">
          <img
            src="/images/logo.webp"
            alt="לוגו A Warrior Quest"
            className="h-12 w-auto opacity-90"
            loading="lazy"
          />
          <p>© {new Date().getFullYear()} A Warrior Quest — ממלכות אטלנטיס, למוריה ופומפיי.</p>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
