import { createFileRoute, Link } from "@tanstack/react-router";

import SiteLayout from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Warrior Quest — משחק תפקידים של קרבות, ערים ומורשת" },
      {
        name: "description",
        content:
          "בחר לוחם, קוסם או קשת, צא למסע בין אטלנטיס, למוריה ופומפיי ובנה קריירה של קרבות, ציוד ומורשת.",
      },
      { property: "og:title", content: "A Warrior Quest" },
      {
        property: "og:description",
        content: "בחר דמות, בחר עיר ובנה קריירה של קרבות, שלל ומורשת.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const HEROES = [
  {
    img: "/images/warrior.webp",
    name: "לוחם",
    text: "שריון כבד, חרב רחבה ולב שלא נשבר. הבחירה הישירה לקרב פנים אל פנים.",
  },
  {
    img: "/images/mage.webp",
    name: "קוסם",
    text: "אש, קרח וסודות עתיקים. עוצמה אדירה — אם תשרוד מספיק זמן כדי להטיל.",
  },
  {
    img: "/images/archer.webp",
    name: "קשת",
    text: "מהיר, מדויק וקטלני מרחוק. שולט בשדה הקרב לפני שהאויב מתקרב.",
  },
];

const CITIES = [
  { img: "/images/city-atlantis.webp", name: "אטלנטיס", text: "עיר המים האבודה" },
  { img: "/images/city-lemuria.webp", name: "למוריה", text: "ממלכת היערות והמקדשים" },
  { img: "/images/city-pompeii.webp", name: "פומפיי", text: "עיר האש והזירה" },
];

function HomePage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <img
          src="/images/logo.webp"
          alt="לוגו A Warrior Quest"
          className="mx-auto h-40 w-auto drop-shadow-2xl sm:h-56"
          loading="eager"
        />
        <h1 className="mt-8 font-display text-4xl font-bold ember-text sm:text-6xl">
          A Warrior Quest
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground/85">
          בחר גיבור, צא לדרך בין שלוש ערים אבודות, נצח בקרבות ובנה מורשת שתיזכר
          בממלכה. משחק תפקידים קצר, קשוח ומכור — בדיוק כמו ימי הביניים.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="px-8 text-base">
            <Link to="/play">⚔️ כניסה למשחק</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 text-base">
            <Link to="/about">📜 על המשחק</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="font-display text-3xl font-bold">בחר את דרכך</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {HEROES.map((h) => (
            <article key={h.name} className="parchment overflow-hidden rounded-xl">
              <img
                src={h.img}
                alt={`דמות ${h.name}`}
                className="h-64 w-full object-cover object-top"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold">{h.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{h.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-3xl font-bold">ערי הממלכה</h2>
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
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="parchment mt-12 rounded-xl p-8 text-center">
          <h2 className="font-display text-2xl font-bold">מוכן לקרב הראשון?</h2>
          <p className="mt-2 text-muted-foreground">
            המסע מתחיל בלחיצה אחת — בלי הרשמה, בלי התקנה.
          </p>
          <Button asChild size="lg" className="mt-6 px-8 text-base">
            <Link to="/play">⚔️ התחל עכשיו</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
