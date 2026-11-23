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
  // This is the "firebaseConfig" from the Firebase project (see README). It isn't a secret:
  // it's meant to sit in a website, and the database rules decide what visitors can do.
  firebase: {
    apiKey: "AIzaSyAvqXTCu3H4SvELiCL-sv8NPIavfVVWF84",
    authDomain: "roses-a8df3.firebaseapp.com",
    databaseURL: "https://roses-a8df3-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "roses-a8df3",
    storageBucket: "roses-a8df3.firebasestorage.app",
    messagingSenderId: "419592939368",
    appId: "1:419592939368:web:99b808ab51263e47cc58dd",
  },
};
