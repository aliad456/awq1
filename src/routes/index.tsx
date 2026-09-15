import { createFileRoute } from "@tanstack/react-router";

import SiteLayout from "@/components/site/SiteLayout";
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
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="sr-only">A Warrior Quest — המשחק</h1>
        <div className="parchment rounded-2xl p-2 sm:p-4">
          <AuthGate>
            <WarriorQuest />
          </AuthGate>
        </div>
      </div>
    </SiteLayout>
  );
}
