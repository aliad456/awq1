/* ============================================================================
   state.js — כל מצב המשחק באובייקט אחד.

   למה זה חשוב: כדי לשמור למסד נתונים צריך דבר אחד לשמור. עכשיו יש.

     await supabase.from("saves").upsert({ user_id, state: G });

   וטעינה:

     const { data } = await supabase.from("saves").select("state").single();
     setG({ ...INITIAL_STATE, ...data.state });

   ה-spread חשוב: אם נוסיף שדה חדש בעתיד, שמירות ישנות עדיין ייטענו
   ויקבלו את ערך ברירת המחדל שלו במקום undefined.

   מה לא נמצא כאן: מצב תצוגה בלבד — באיזה מסך אתה, איזו חלונית פתוחה.
   אלה דברים שאין טעם לשמור.
   ========================================================================== */

import { START_AGE, MAX_ATTEMPTS } from "./config";

/* השדות שנשמרים. הסדר כאן הוא גם הסדר בקובץ השמירה. */
export const INITIAL_STATE = {
  /* העדפות */
  themeMode: "auto",

  /* קבוע בין קריירות — זה מה שהשחקן צובר לאורך זמן */
  legacy: 0,
  hall: [],
  credits: 120,
  noAds: false,

  /* הקריירה הנוכחית */
  selected: "warrior",
  cityId: null,
  base: null,
  age: START_AGE,
  level: 1,
  attempts: MAX_ATTEMPTS,
  cleared: [],
  wins: 0,
  gold: 0,

  /* ציוד */
  equipped: { weapon: null, armor: null, charm: null },
  bag: [],
  stock: [],
  injuries: [],

  /* זמני — קיים רק תוך כדי קרב או חלונית */
  fight: null,
  pending: 0,
  alloc: null,
  reward: null,
  enc: null,
  encRes: null,
};

/* מה ששורד סיום קריירה. שאר השדות חוזרים לברירת המחדל. */
export const KEEP_ON_RESET = ["themeMode", "legacy", "hall", "credits", "noAds", "selected"];

export function resetCareer(G) {
  const next = { ...INITIAL_STATE };
  KEEP_ON_RESET.forEach((k) => { next[k] = G[k]; });
  return next;
}
