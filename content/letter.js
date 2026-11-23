/* ─────────────────────────────────────────────────────────────
   THE LETTER — write it here, then record yourself reading it.

   Formatting:
     • A blank line starts a new paragraph. A single line break stays a line break.
     • *like this*  → those words get highlighted in the theme's accent color.

   Stickers:  {sticker:heart}
     The sticker pops up when you SAY THE WORD RIGHT BEFORE IT,
     like an emoji after a word.  e.g.  "Happy monthsary! {sticker:cake}"
     You can use a sticker name (heart, hearts, rose, star, moon, sun, sparkles,
     cake, kiss, flower, cloud, letter, bow, bear, balloon, butterfly, ring,
     music, bandaid, coffee), any emoji ({sticker:🥹}), or a photo
     ({sticker:images/us.jpg}).

   Themes:  {theme:night}
     The whole page changes look when you reach THE WORD RIGHT AFTER IT.
     Put it at the start of a paragraph to change the mood for that part.
     Themes: blush, roses, sunset, night, garden, ocean, golden, lavender, snow, party

   If the words change, the timing file (letter-timing.js) gets regenerated
   from the recording so the read-along stays in sync.
   ───────────────────────────────────────────────────────────── */
window.LETTER = {
  // Your recording of you reading this letter.
  audio: "audio/letter.mp3",

  // The look when the letter opens.
  startTheme: "blush",

  // Shown at the top of the paper. Leave "" to hide it.
  date: "November 23, 2026",

  text: `
Hi my love, {sticker:heart}

Happy monthsary! {sticker:cake} I wanted to make you something you could open anytime, so here it is: a little letter, read to you by me.

{theme:sunset}
Do you remember the first time we talked? {sticker:sparkles} I didn't know it yet, but that was the start of my favorite thing in the whole world. Every day since then, you've made ordinary days feel *golden*.

{theme:night}
On the nights we stay up way too late {sticker:moon} just talking about everything and nothing, I always think the same thing: I'm so lucky it's you. {sticker:star}

{theme:garden}
Thank you for being patient with me, for laughing at my jokes even when they're bad, {sticker:flower} and for being my safe place. I'm still learning how to love you better, and I promise I'll never stop trying.

{theme:roses}
So here's to us, to every month we've had and every month still coming. {sticker:rose} I love you, today and every day after. {sticker:kiss}

Yours, always,
Me {sticker:hearts}
`,
};
