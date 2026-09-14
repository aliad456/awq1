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
    text: "שריון כבד וחרב רחבה. עוצמה ישירה בקרב פנים אל פנים.",
  },
  {
    img: "/images/mage.webp",
    name: "קוסם",
    text: "אש, קרח וסודות עתיקים. נזק אדיר — אם תשרוד מספיק כדי להטיל.",
  },
  {
    img: "/images/archer.webp",
    name: "קשת",
    text: "מהיר ומדויק. שולט בשדה הקרב לפני שהאויב מתקרב.",
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
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-20 text-center sm:pt-28">
        <img
          src="/images/logo.webp"
          alt="לוגו A Warrior Quest"
          className="mx-auto h-32 w-auto sm:h-44"
          loading="eager"
        />
        <h1 className="mt-10 text-4xl font-extrabold tracking-tight sm:text-6xl">
          מסע אחד. <span className="ember-text">מורשת אחת.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          בחר גיבור, צא לשלוש ערים אבודות ובנה קריירה של קרבות, שלל ומוניטין.
          בלי הרשמה, בלי התקנה — פשוט תיכנס ותשחק.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8 text-base">
            <Link to="/play">כניסה למשחק</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="rounded-full px-8 text-base text-muted-foreground hover:text-foreground"
          >
            <Link to="/about">על המשחק</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">בחר את דרכך</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HEROES.map((h) => (
            <article
              key={h.name}
              className="parchment group overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={h.img}
                  alt={`דמות ${h.name}`}
                  className="h-72 w-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {h.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-2xl font-bold tracking-tight">ערי הממלכה</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {CITIES.map((c) => (
            <article
              key={c.name}
              className="parchment overflow-hidden rounded-2xl"
            >
              <img
                src={c.img}
                alt={`נוף העיר ${c.name}`}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="parchment mt-16 rounded-3xl px-8 py-14 text-center">
          <h2 className="text-2xl font-bold tracking-tight">מוכן לקרב הראשון?</h2>
          <p className="mt-2 text-muted-foreground">המסע מתחיל בלחיצה אחת.</p>
          <Button asChild size="lg" className="mt-8 rounded-full px-8 text-base">
            <Link to="/play">התחל עכשיו</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
