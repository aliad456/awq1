import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Brain, Shield, Hammer } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "על המשחק — A Warrior Quest" },
      {
        name: "description",
        content:
          "A Warrior Quest הוא משחק תפקידים ימי-ביניימי שעבר שדרוג עמוק בעזרת בינה מלאכותית: איזון קרבות, אירועים דינמיים ועיצוב ערים חדש.",
      },
      { property: "og:title", content: "על המשחק — A Warrior Quest" },
      {
        property: "og:description",
        content:
          "הסיפור, הערים, הדמויות והשדרוגים שנעשו למשחק בעזרת בינה מלאכותית.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const UPGRADES = [
  {
    icon: Brain,
    title: "שודרג בעזרת AI",
    text: "מנוע הקרב, איזון הנזק וקצב ההתקדמות עברו כוונון מחדש בעזרת בינה מלאכותית — פחות קרבות מתסכלים, יותר החלטות משמעותיות.",
  },
  {
    icon: Sparkles,
    title: "אירועים דינמיים",
    text: "כל מסע מגריל אירועים, שלל ויריבים אחרים, כך ששתי הרפתקאות לעולם אינן זהות.",
  },
  {
    icon: Shield,
    title: "שלוש דרכי לחימה",
    text: "לוחם, קוסם וקשת — לכל אחד עץ יכולות, סגנון קרב וציוד משלו.",
  },
  {
    icon: Hammer,
    title: "עיצוב חדש לערים",
    text: "אטלנטיס, למוריה ופומפיי קיבלו מראה, אווירה ואתגרים ייחודיים.",
  },
];

const CITIES = [
  {
    img: "/images/city-atlantis.webp",
    name: "אטלנטיס",
    text: "עיר המים האבודה — סוחרים ערמומיים, קסם עתיק ואויבים מן המעמקים.",
  },
  {
    img: "/images/city-lemuria.webp",
    name: "למוריה",
    text: "ממלכת היערות והמקדשים — מקום הלימוד של הקוסמים והקשתים.",
  },
  {
    img: "/images/city-pompeii.webp",
    name: "פומפיי",
    text: "עיר האש והזירה — כאן נבחנים הלוחמים הקשוחים ביותר.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-display text-4xl font-bold ember-text">על המשחק</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-foreground/85">
          A Warrior Quest הוא משחק תפקידים בסגנון ימי-ביניים עתיק: אתה בוחר גיבור,
          יוצא לערים אבודות, נלחם, אוסף שלל ובונה קריירה שנמדדת במוניטין ובמורשת.
          המשחק נבנה כחוויה קצרה ומהירה — אבל עם עומק שמתגלה אחרי כמה סבבים.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {UPGRADES.map((u) => (
            <div key={u.title} className="parchment rounded-xl p-6">
              <u.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-display text-xl font-semibold">{u.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {u.text}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl font-bold">הערים</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {CITIES.map((c) => (
            <article key={c.name} className="parchment overflow-hidden rounded-xl">
              <img
                src={c.img}
                alt={`נוף העיר ${c.name}`}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/play">⚔️ התחל לשחק</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/credits">🪙 רכישת קרדיטים</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
