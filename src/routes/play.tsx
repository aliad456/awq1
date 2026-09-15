import { createFileRoute } from "@tanstack/react-router";

import SiteLayout from "@/components/site/SiteLayout";
import AuthGate from "@/components/site/AuthGate";
import WarriorQuest from "@/components/WarriorQuest";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "כניסה למשחק — A Warrior Quest" },
      {
        name: "description",
        content:
          "בחר לוחם, קוסם או קשת, צא לקרב בין אטלנטיס, למוריה ופומפיי ובנה קריירה של ניצחונות.",
      },
      { property: "og:title", content: "כניסה למשחק — A Warrior Quest" },
      {
        property: "og:description",
        content: "בחר דמות, בחר עיר וצא לקרב ב-A Warrior Quest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="sr-only">כניסה למשחק A Warrior Quest</h1>
        <div className="parchment rounded-2xl p-2 sm:p-4">
          <AuthGate>
            <WarriorQuest />
          </AuthGate>
        </div>
      </div>
    </SiteLayout>
  );
}
