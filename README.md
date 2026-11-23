# Roses ♡

A little monthsary website: an envelope to open, a wall of voice-note buttons, and a letter that plays in my voice and follows along word by word.

Made for a 12.1" 2560×1600 tablet (both orientations) and phones.

## What's inside

| Page | What it does |
| --- | --- |
| **Envelope** | Opens with a wax-seal animation when she taps it. |
| **Home** | "Happy *N*th Monthsary" plus the number of days together, worked out from your start date. |
| **Voice notes** | Cards like "Click me when you miss me", each holding several short clips. Tap a card and a random clip plays; tap again and it switches to another one instantly. Every clip plays once before any repeats, and the same clip never plays twice in a row. The round button stops it. Each card shows how many times it's been tapped. |
| **Letter** | Plays the letter recording. Words already read fade out, the current word is highlighted, stickers pop up at chosen words, and the whole page changes theme as the letter goes on. Has play/pause, stop, a seek bar, and tap-any-word-to-jump. |

## Right now everything is a placeholder

- `audio/`: a robot voice standing in for the real recordings (3 clips per card).
- `content/letter.js`: a sample letter showing how stickers and themes are written.
- `content/voice-notes.js`: sample card labels.
- Click counters: count on each device only, until Firebase is set up (below).
- `content/settings.js`: her name, your name, and the start date (`null` for now).

To swap in the real thing, send:

1. The voice-note recordings (several short clips per card is perfect) and the label for each card.
2. The real letter text, plus where you want stickers and theme changes.
3. A recording of you reading the letter. The word timing in `content/letter-timing.js` gets regenerated from it so the read-along matches your voice.
4. Her name, how you sign off, and your start date.

## Sending your recordings

This session runs in the cloud, so it can't see your computer. Upload the files to GitHub instead:

1. Make a folder called `raw-audio` on your computer, with **one folder per card** inside it
   (the folder names are the card ids: `miss-me`, `cant-sleep`, `sad`, `hug`, `stressed`,
   `motivation`, `mad-at-me`, `i-love-you`, or new ones), plus the letter recording:
   ```
   raw-audio/
     miss-me/      clip1.wav, clip2.wav, …
     cant-sleep/   …
     letter.wav
   ```
2. Open https://github.com/Kewnric/Roses, then **Add file → Upload files**.
3. Drag the whole `raw-audio` folder in (Chrome and Edge keep the folders), then **Commit changes**.

The website upload takes files up to **25 MB** each, 100 files at a time. WAV is about 10 MB per
minute, so short clips are fine. A long letter recording may be too big: export it as .m4a/.mp3
or split it. The repo is public, so anything uploaded can be seen by others and stays in its history.

WAV is fine as input. `tools/clean-audio.py` turns each file into a small MP3 and cleans it:

- removes background noise with RNNoise (a small neural network trained on speech)
- trims silence at the start/end and shortens long pauses
- evens out the volume so every clip is equally loud

```bash
python3 tools/clean-audio.py notes raw-audio audio            # every card folder
python3 tools/clean-audio.py letter raw-audio/letter.wav audio/letter.mp3
```

## Shared click counters (Firebase, free, no sign-in for visitors)

GitHub Pages only serves files, so the shared count needs a tiny online database.
Firebase's Realtime Database is free at this size. Visitors don't sign in: the page just adds +1.

1. Go to https://console.firebase.google.com, then **Create a project** (any name; Google Analytics off).
2. In the left menu: **Build → Realtime Database → Create Database**. Pick the location closest to
   you, choose **Start in locked mode**, then **Enable**.
3. Open the **Rules** tab, replace everything with this, and click **Publish**:
   ```json
   {
     "rules": {
       "clicks": {
         ".read": true,
         "$card": {
           ".write": true,
           ".validate": "newData.isNumber() && newData.val() >= (data.exists() ? data.val() : 0) && newData.val() <= (data.exists() ? data.val() : 0) + 100 && $card.matches(/^[a-z0-9-]{1,40}$/)"
         }
       }
     }
   }
   ```
   (Anyone can read the counts. Writes can only raise a count, by at most 100 at a time, and nothing outside `clicks` can be touched.)
4. Click the gear icon, then **Project settings → Your apps**, then the **`</>`** (Web) icon. Give it a
   nickname, leave Hosting unticked, and click **Register app**.
5. Copy the `firebaseConfig = { … }` block it shows into `firebase:` in `content/settings.js`.
   This isn't a password: it's meant to sit in a website.

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
js/                   site code (themes, stickers, shuffle, click counter, voice notes, letter player)
tools/clean-audio.py  cleans and converts recordings (noise, silences, volume → MP3)
content/              ← the stuff that's yours: settings, voice notes, letter, timing
audio/                recordings
images/               photos for photo stickers (optional)
fonts/                Fraunces, Caveat, Quicksand (SIL Open Font License)
```
