#!/usr/bin/env python3
"""Clean voice recordings for the site.

For every recording it:
  1. removes background noise (hum, fan, room hiss) with RNNoise, a small neural network
     trained on speech, run through ffmpeg
  2. trims the silence at the start and end, and shortens long pauses in the middle
  3. evens out the volume so every clip plays equally loud
  4. saves a small MP3 that loads fast on phones (WAV in, MP3 out)

Usage
  Voice notes (one folder per card, any audio format inside):
      python3 tools/clean-audio.py notes raw-audio/voice-notes audio
      → raw-audio/voice-notes/miss-me/*.wav  becomes  audio/miss-me/01.mp3, 02.mp3, …

  The letter (keeps natural pauses, since it's read along word by word):
      python3 tools/clean-audio.py letter raw-audio/letter.wav audio/letter.mp3

Options
  --no-denoise            skip noise removal
  --strength 0.0–1.0      how hard to remove noise (default 0.9; lower keeps more "room")
  --max-pause SECONDS     pauses longer than this get shortened (notes 0.7, letter 1.6)
  --keep-pause SECONDS    …down to this length (notes 0.4, letter 1.0)

Needs: ffmpeg, python3 with numpy.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request

import numpy as np

SR = 48000  # RNNoise works at 48 kHz
HOP = 0.01  # analysis frame: 10 ms
AUDIO_EXT = {'.wav', '.m4a', '.mp3', '.aac', '.ogg', '.oga', '.opus', '.flac', '.aiff', '.aif', '.caf', '.webm', '.mp4', '.3gp', '.amr', '.wma'}
MODEL_URL = 'https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn'
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache', 'sh.rnnn')


def model():
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        print('Downloading the RNNoise speech model…', file=sys.stderr)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    return MODEL_PATH


def decode(path, denoise, strength):
    """Audio file → mono float32 at 48 kHz, with low rumble filtered and (optionally) noise removed."""
    chain = ['highpass=f=70']
    if denoise:
        # ffmpeg filter-graph escaping: the model path must not contain ':' unescaped.
        mp = model().replace('\\', '/').replace(':', '\\:')
        chain.append(f'arnndn=m={mp}:mix={strength}')
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-af', ','.join(chain), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def frame_db(x):
    n = int(SR * HOP)
    m = len(x) // n
    if m == 0:
        return np.array([-120.0]), n
    fr = x[: m * n].reshape(m, n).astype(np.float64)
    rms = np.sqrt((fr ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-9), n


def runs(mask):
    """[(start, end)] of consecutive True frames (end exclusive)."""
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        elif not v and start is not None:
            out.append((start, i)); start = None
    if start is not None:
        out.append((start, len(mask)))
    return out


def voiced_mask(db):
    loud = np.percentile(db, 95)
    floor = np.percentile(db, 10)
    thr = max(floor + 8, loud - 35)
    mask = db > thr
    # Remove blips shorter than 50 ms (clicks), then bridge gaps shorter than 150 ms (between syllables).
    for s, e in runs(mask):
        if e - s < 5:
            mask[s:e] = False
    for s, e in runs(~mask):
        if 0 < s and e < len(mask) and e - s < 15:
            mask[s:e] = True
    return mask, thr


def crossfade_join(pieces, fade):
    out = pieces[0]
    for p in pieces[1:]:
        f = min(fade, len(out), len(p))
        if f <= 0:
            out = np.concatenate([out, p]); continue
        t = np.linspace(0, np.pi / 2, f, dtype=np.float32)
        mixed = out[-f:] * np.cos(t) + p[:f] * np.sin(t)  # equal-power crossfade
        out = np.concatenate([out[:-f], mixed, p[f:]])
    return out


def clean(x, max_pause, keep_pause):
    db, hop = frame_db(x)
    mask, _ = voiced_mask(db)
    speech = runs(mask)
    if not speech:
        return None, {}
    lead, tail = int(0.12 * SR), int(0.25 * SR)
    start = max(0, speech[0][0] * hop - lead)
    end = min(len(x), speech[-1][1] * hop + tail)

    # Keep everything except the middle of pauses longer than max_pause.
    keep_half = int(keep_pause * SR / 2)
    pieces, cursor, shortened = [], start, 0
    for (s1, e1), (s2, _) in zip(speech, speech[1:]):
        gap_start, gap_end = e1 * hop, s2 * hop
        if (gap_end - gap_start) / SR > max_pause:
            pieces.append(x[cursor:gap_start + keep_half])
            cursor = gap_end - keep_half
            shortened += 1
    pieces.append(x[cursor:end])
    y = crossfade_join([p for p in pieces if len(p)], int(0.02 * SR))

    # Even out loudness: bring speech to about -18 dBFS RMS (the limiter catches peaks later).
    db2, hop2 = frame_db(y)
    m2, _ = voiced_mask(db2)
    v = np.concatenate([y[a * hop2:b * hop2] for a, b in runs(m2)]) if m2.any() else y
    rms_db = 20 * np.log10(np.sqrt(np.mean(v.astype(np.float64) ** 2)) + 1e-9)
    gain_db = float(np.clip(-18 - rms_db, -12, 24))
    y = (y * (10 ** (gain_db / 20))).astype(np.float32)

    # Soft edges so nothing clicks.
    fi, fo = min(len(y), int(0.01 * SR)), min(len(y), int(0.04 * SR))
    y[:fi] *= np.linspace(0, 1, fi, dtype=np.float32)
    y[len(y) - fo:] *= np.linspace(1, 0, fo, dtype=np.float32)
    return y, {'pauses_shortened': shortened, 'gain_db': round(gain_db, 1)}


def encode(y, out_path, bitrate='96k'):
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
           '-af', 'alimiter=limit=0.89:level=false', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', bitrate, out_path]
    subprocess.run(cmd, input=y.astype(np.float32).tobytes(), check=True)


def process(src, dst, args, max_pause, keep_pause):
    x = decode(src, not args.no_denoise, args.strength)
    before = len(x) / SR
    y, info = clean(x, max_pause, keep_pause)
    if y is None:
        print(f'  ! {src}: sounds silent, skipped', file=sys.stderr)
        return None
    encode(y, dst)
    after = len(y) / SR
    print(f'  {os.path.basename(src):<32} {before:6.1f}s → {after:6.1f}s   {dst}   (volume {info["gain_db"]:+.1f} dB, {info["pauses_shortened"]} long pause(s) shortened)')
    return dst


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'note'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('mode', choices=['notes', 'letter'])
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--no-denoise', action='store_true')
    ap.add_argument('--strength', type=float, default=0.9)
    ap.add_argument('--max-pause', type=float)
    ap.add_argument('--keep-pause', type=float)
    args = ap.parse_args()

    if args.mode == 'letter':
        mp, kp = args.max_pause or 1.6, args.keep_pause or 1.0
        process(args.src, args.dst, args, mp, kp)
        return

    mp, kp = args.max_pause or 0.7, args.keep_pause or 0.4
    result = {}
    folders = sorted([d for d in os.listdir(args.src) if os.path.isdir(os.path.join(args.src, d))], key=natural_key)
    loose = [f for f in os.listdir(args.src) if os.path.splitext(f)[1].lower() in AUDIO_EXT]
    if loose:
        print(f'  ! {len(loose)} file(s) sit directly in {args.src}. Put each card\'s clips in its own folder.', file=sys.stderr)
    for d in folders:
        files = sorted([f for f in os.listdir(os.path.join(args.src, d)) if os.path.splitext(f)[1].lower() in AUDIO_EXT], key=natural_key)
        if not files:
            continue
        card = slug(d)
        out_dir = os.path.join(args.dst, card)
        print(f'{d}  →  {out_dir}/')
        made = []
        for f in files:
            dst = os.path.join(out_dir, f'{len(made) + 1:02d}.mp3')
            if process(os.path.join(args.src, d, f), dst, args, mp, kp):
                made.append(dst.replace(os.sep, '/'))
        # Remove old numbered clips that are no longer used.
        if os.path.isdir(out_dir):
            for old in os.listdir(out_dir):
                p = os.path.join(out_dir, old).replace(os.sep, '/')
                if re.fullmatch(r'\d+\.mp3', old) and p not in made:
                    os.remove(p)
        result[card] = made
    print('\nclips per card:')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
