/* ─────────────────────────────────────────────────────────────
   SETTINGS — the basics. Edit the text between the quotes.
   ───────────────────────────────────────────────────────────── */
window.SETTINGS = {
  // What you call her. Shows on the envelope and the home page.
  herName: "Kim",

  // How you sign off.
  yourName: "Kenric",

  // The day you became official, as "YYYY-MM-DD".
  // The site counts your monthsary number and the days you've been together from this date.
  // Leave it as null to hide the numbers.
  togetherSince: "2025-08-24",

  // Small line on the envelope before she opens it.
  envelopeNote: "tap to open",

  // The site's look outside the letter. Pick one of:
  // blush, roses, sunset, night, garden, ocean, golden, lavender, snow, party
  theme: "blush",

  // Shared click counters for the voice notes (free Firebase Realtime Database, no sign-in
  // for visitors). Leave as null and the counters only count on each device.
  // To turn it on, paste the "firebaseConfig" from your Firebase project here (see README).
  firebase: null,
  // firebase: {
  //   apiKey: "…",
  //   authDomain: "…",
  //   databaseURL: "https://…-default-rtdb.asia-southeast1.firebasedatabase.app",
  //   projectId: "…",
  //   appId: "…",
  // },
};
