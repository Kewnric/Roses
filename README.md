# Roses ♡

A little monthsary website: an envelope to open, a wall of voice-note buttons, and a letter that plays in my voice and follows along word by word.

Made for a 12.1" 2560×1600 tablet (both orientations) and phones.

## What's inside

| Page | What it does |
| --- | --- |
| **Envelope** | Opens with a wax-seal animation when she taps it. |
| **Home** | "Happy *N*th Monthsary" plus the number of days together, worked out from your start date. |
| **Voice notes** | One button per recording ("Click me when you miss me", …). Tap to play, tap again to stop. |
| **Letter** | Plays the letter recording. Words already read fade out, the current word is highlighted, stickers pop up at chosen words, and the whole page changes theme as the letter goes on. Has play/pause, stop, a seek bar, and tap-any-word-to-jump. |

## Right now everything is a placeholder

- `audio/*.mp3`: a robot voice standing in for the real recordings.
- `content/letter.js`: a sample letter showing how stickers and themes are written.
- `content/voice-notes.js`: sample button labels.
- `content/settings.js`: her name, your name, and the start date (`null` for now).

To swap in the real thing, send:

1. The voice-note recordings and the label for each button.
2. The real letter text, plus where you want stickers and theme changes.
3. A recording of you reading the letter. The word timing in `content/letter-timing.js` gets regenerated from it so the read-along matches your voice.
4. Her name, how you sign off, and your start date.

## Letter syntax (`content/letter.js`)

```
Happy monthsary! {sticker:cake}      ← pops when the word before it is said
{theme:night}                        ← page changes look at the next word
*I love you*                         ← highlighted in the theme color
```

- **Stickers:** heart, hearts, rose, star, moon, sun, sparkles, cake, kiss, flower, cloud, letter, bow, bear, balloon, butterfly, ring, music, bandaid, coffee. Any emoji (`{sticker:🥹}`) or a photo (`{sticker:images/us.jpg}`) also works.
- **Themes:** blush, roses, sunset, night, garden, ocean, golden, lavender, snow, party.

## Putting it online (GitHub Pages)

1. In the repo on GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**. Then pick the branch with the site and the `/ (root)` folder.
3. After a minute it's live at `https://<your-username>.github.io/Roses/`.

It also works by opening `index.html` straight from a folder, with no server needed.

## Files

```
index.html            the page
css/style.css         all the styling and layouts
js/                   site code (themes, stickers, voice notes, letter player)
content/              ← the stuff that's yours: settings, voice notes, letter, timing
audio/                recordings
images/               photos for photo stickers (optional)
fonts/                Fraunces, Caveat, Quicksand (SIL Open Font License)
```
