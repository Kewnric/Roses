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

## What's filled in

- `audio/`: the real recordings, cleaned: 56 voice-note clips across 8 cards, and the letter.
- `content/settings.js`: for Kim, from Kenric, together since 2025-08-24.
- `content/letter.js`: the letter as it was read in the recording.
- `content/letter-timing.js`: each word's time, matched to the recording by `tools/align-letter.py`.
- Click counters: count on each device only, until Firebase is set up (below).

The raw WAV recordings stay on your computer (`Audio Voiceover/`, ignored by git). They're big
and the repo is public. Only the cleaned MP3s are published.

## Re-doing the recordings

Both tools run with [uv](https://docs.astral.sh/uv/) (it fetches Python and the libraries) and need
[ffmpeg](https://ffmpeg.org/). On Windows: `winget install Gyan.FFmpeg astral-sh.uv`.

**Voice notes.** Put the recordings in one folder per card (folder name = card id, any file names):
```
raw-audio/
  miss-me/      clip1.wav, clip2.wav, …
  cant-sleep/   …
```
```bash
uv run --with numpy python tools/clean-audio.py notes raw-audio audio
```
Each one becomes `audio/<card>/01.mp3`, `02.mp3`, … with background noise removed (RNNoise),
silence trimmed, long pauses shortened and volume evened out. Then set each card's clip count in
`content/voice-notes.js`.

**The letter.** Clean the recording, then match the words to it:
```bash
uv run --with numpy python tools/clean-audio.py letter "path/to/letter.wav" audio/letter.mp3
uv run --python 3.12 --with faster-whisper python tools/align-letter.py
```
`align-letter.py` transcribes the recording with Whisper, writes `content/letter-timing.js`, and lists
any words you said differently from `content/letter.js`. Fix the text to match what you said and run it again.

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
tools/align-letter.py matches the letter text to the recording (word timing)
content/              ← the stuff that's yours: settings, voice notes, letter, timing
audio/                recordings
images/               photos for photo stickers (optional)
fonts/                Fraunces, Caveat, Quicksand (SIL Open Font License)
```
