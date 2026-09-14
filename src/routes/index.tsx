import { createFileRoute } from "@tanstack/react-router";
import WarriorQuest from "@/components/WarriorQuest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A Warrior Quest — משחק תפקידים של קרבות וקריירה" },
      {
        name: "description",
        content:
          "בחר לוחם, קוסם או קשת, צא למסע בין אטלנטיס, למוריה ופומפיי ובנה קריירה של קרבות, ציוד ומורשת.",
      },
      { property: "og:title", content: "A Warrior Quest" },
      {
        property: "og:description",
        content:
          "בחר דמות, בחר עיר ובנה קריירה של קרבות, שלל ומורשת ב-A Warrior Quest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WarriorQuest,
});
