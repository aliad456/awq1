import { createFileRoute } from "@tanstack/react-router";

import AuthGate from "@/components/site/AuthGate";
import WarriorQuest from "@/components/WarriorQuest";

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

function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <h1 className="sr-only">A Warrior Quest — המשחק</h1>
      <AuthGate>
        <WarriorQuest />
      </AuthGate>
    </div>
  );
}
