/* ─────────────────────────────────────────────────────────────
   VOICE NOTES — one card per mood; each card holds several short clips.

   Tapping a card plays one of its clips at random. Every clip plays once before
   any repeats (then it reshuffles), and the same clip never plays twice in a row.
   Tapping again while one is playing switches to the next clip instantly.

   id      → short name for the card (also its folder in audio/ and its click counter).
             Don't rename it later or the card's counter starts over.
   label   → the text on the card. Anything after "when" is written big.
   sticker → heart, hearts, rose, star, moon, sun, sparkles, cake, kiss, flower,
             cloud, letter, bow, bear, balloon, butterfly, ring, music, bandaid,
             coffee, any emoji like "🥺", or a photo like "images/us.jpg".
   clips   → the recordings for this card (cleaned up by tools/clean-audio.py).

   Right now every clip is a PLACEHOLDER robot voice.
   ───────────────────────────────────────────────────────────── */
window.VOICE_NOTES = (() => {
  // clips("miss-me", 3) → audio/miss-me/01.mp3, 02.mp3, 03.mp3
  const clips = (id, n) => Array.from({ length: n }, (_, i) => `audio/${id}/${String(i + 1).padStart(2, '0')}.mp3`);
  return [
  { id: "miss-me",    label: "Click me when you miss me",            sticker: "heart",   clips: clips("miss-me", 3) },
  { id: "cant-sleep", label: "Click me when you can't sleep",        sticker: "moon",    clips: clips("cant-sleep", 3) },
  { id: "sad",        label: "Click me when you're sad",             sticker: "cloud",   clips: clips("sad", 3) },
  { id: "hug",        label: "Click me when you need a hug",         sticker: "bear",    clips: clips("hug", 3) },
  { id: "stressed",   label: "Click me when you're stressed",        sticker: "flower",  clips: clips("stressed", 3) },
  { id: "motivation", label: "Click me when you need a little push", sticker: "star",    clips: clips("motivation", 3) },
  { id: "mad-at-me",  label: "Click me when you're mad at me",       sticker: "bandaid", clips: clips("mad-at-me", 3) },
  { id: "i-love-you", label: "Click me when you want an I love you", sticker: "kiss",    clips: clips("i-love-you", 3) },
  ];
})();
