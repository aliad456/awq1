import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "רכישת קרדיטים — A Warrior Quest" },
      {
        name: "description",
        content:
          "חבילות קרדיטים ל-A Warrior Quest: מסעות נוספים, ציוד נדיר ותיבות שלל לגיבור שלך.",
      },
      { property: "og:title", content: "רכישת קרדיטים — A Warrior Quest" },
      {
        property: "og:description",
        content: "בחר חבילת קרדיטים והמשך את המסע בממלכה.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreditsPage,
});

const PACKS = [
  {
    name: "כיס הנווד",
    emoji: "🪙",
    credits: 100,
    price: "₪19",
    perks: ["100 קרדיטים", "מסע נוסף אחד ביום", "תיבת שלל רגילה"],
  },
  {
    name: "אוצר האביר",
    emoji: "🛡️",
    credits: 550,
    price: "₪79",
    highlight: true,
    perks: ["550 קרדיטים", "בונוס 10% ניסיון", "שתי תיבות שלל נדירות"],
  },
  {
    name: "מטמון המלך",
    emoji: "👑",
    credits: 1500,
    price: "₪179",
    perks: ["1500 קרדיטים", "ציוד אגדי מובטח", "גישה מוקדמת לערים חדשות"],
  },
];

function CreditsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold ember-text">רכישת קרדיטים</h1>
        <p className="mt-3 max-w-2xl text-foreground/85">
          קרדיטים מאפשרים מסעות נוספים, שדרוגי ציוד ותיבות שלל. בחר את החבילה
          שמתאימה לקצב המסע שלך.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PACKS.map((pack) => (
            <div
              key={pack.name}
              className={`parchment flex flex-col rounded-xl p-6 ${
                pack.highlight ? "ring-2 ring-primary/70" : ""
              }`}
            >
              {pack.highlight && (
                <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  הכי פופולרי
                </span>
              )}
              <div className="text-3xl" aria-hidden="true">
                {pack.emoji}
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold">{pack.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pack.credits} קרדיטים
              </p>
              <p className="mt-4 font-display text-3xl font-bold text-primary">
                {pack.price}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {pack.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                variant={pack.highlight ? "default" : "outline"}
                onClick={() =>
                  toast("התשלומים עדיין לא פעילים", {
                    description: "אפשר לחבר מערכת תשלומים אמיתית בשלב הבא.",
                  })
                }
              >
                רכישה
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          שים לב: החבילות והמחירים הם הצעה לדוגמה שיצרתי — עדכן אותם למחירים
          האמיתיים שלך, והתשלום עצמו עדיין לא מחובר.
        </p>
      </div>
    </SiteLayout>
  );
}
