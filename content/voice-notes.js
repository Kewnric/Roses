/* ─────────────────────────────────────────────────────────────
   VOICE NOTES — one button per recording.

   label   → the text on the button. Anything after the word "when"
             is written big (e.g. "Click me when | you miss me").
   file    → your recording inside the audio/ folder.
             .mp3, .m4a, .wav, .ogg and .aac all work. If you upload
             "miss-me.m4a" but wrote "miss-me.mp3" here, it still finds it.
   sticker → the little picture on the button. Use a sticker name
             (heart, hearts, rose, star, moon, sun, sparkles, cake, kiss,
             flower, cloud, letter, bow, bear, balloon, butterfly, ring,
             music, bandaid, coffee), any emoji like "🥺", or a photo
             path like "images/us.jpg".

   Add, remove or reorder buttons freely. Keep the commas between them.
   ───────────────────────────────────────────────────────────── */
window.VOICE_NOTES = [
  { label: "Click me when you miss me",            file: "audio/miss-me.mp3",     sticker: "heart" },
  { label: "Click me when you can't sleep",        file: "audio/cant-sleep.mp3",  sticker: "moon" },
  { label: "Click me when you're sad",             file: "audio/sad.mp3",         sticker: "cloud" },
  { label: "Click me when you need a hug",         file: "audio/hug.mp3",         sticker: "bear" },
  { label: "Click me when you're stressed",        file: "audio/stressed.mp3",    sticker: "flower" },
  { label: "Click me when you need a little push", file: "audio/motivation.mp3",  sticker: "star" },
  { label: "Click me when you're mad at me",       file: "audio/mad-at-me.mp3",   sticker: "bandaid" },
  { label: "Click me when you want an I love you", file: "audio/i-love-you.mp3",  sticker: "kiss" },
];
