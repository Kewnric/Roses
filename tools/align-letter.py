#!/usr/bin/env python3
"""Line the letter text up with the recording, so the read-along follows your voice.

It transcribes audio/letter.mp3 with Whisper (word timestamps), matches the spoken words to the
words in content/letter.js, and writes content/letter-timing.js. Words Whisper didn't catch get
a time between their neighbours. It also lists anything you said differently from the letter,
so you can fix the text (then run this again).

Usage
    uv run --python 3.12 --with faster-whisper python tools/align-letter.py
    (or: pip install faster-whisper, then python3 tools/align-letter.py)

Options
    --audio PATH       the cleaned letter recording   (default audio/letter.mp3)
    --letter PATH      the letter                      (default content/letter.js)
    --out PATH         timing file to write            (default content/letter-timing.js)
    --model NAME       Whisper model: base, small, medium   (default small)
    --language CODE    spoken language                 (default en)

Needs: ffmpeg, faster-whisper. The model downloads once (small ≈ 480 MB).
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARKER = re.compile(r'\{\s*(sticker|theme)\s*:\s*[^}]*?\s*\}', re.I)


def letter_words(path):
    """Words of the letter, split the same way js/letter-core.js does."""
    src = open(path, encoding='utf-8').read()
    m = re.search(r'text:\s*`(.*?)`', src, re.S)
    if not m:
        sys.exit(f'Could not find text: `…` in {path}')
    words = []
    for tok in MARKER.sub(' ', m.group(1)).split():
        t = tok.replace('*', '')
        if t:
            words.append(t)
    return words


def norm(w):
    return re.sub(r'[^\w]', '', w.lower().replace('’', "'").replace("'", ''))


def fingerprint(words):
    """Same hash as fingerprint() in js/letter-core.js."""
    s = ' '.join(re.sub(r'[^\w]', '', w.lower()).replace('_', '') for w in words)
    h = 5381
    for ch in s:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    digits, out = '0123456789abcdefghijklmnopqrstuvwxyz', ''
    while True:
        h, r = divmod(h, 36)
        out = digits[r] + out
        if not h:
            return out


def transcribe(audio, model_name, language):
    import numpy as np
    from faster_whisper import WhisperModel
    pcm = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    samples = np.frombuffer(pcm, dtype=np.float32)
    model = WhisperModel(model_name, device='cpu', compute_type='int8')
    segs, info = model.transcribe(samples, language=language, word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words if w.word.strip()]
    return heard, info.duration


def similar(a, b):
    return a == b or difflib.SequenceMatcher(None, a, b).ratio() >= 0.72


def align(letter, heard):
    """Global alignment (Needleman–Wunsch). Returns {letter index: heard index} for matched words."""
    L, H = [norm(w) for w in letter], [norm(w) for w, _, _ in heard]
    n, m = len(L), len(H)
    GAP = -1
    score = [[0] * (m + 1) for _ in range(n + 1)]
    move = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        score[i][0], move[i][0] = i * GAP, 1
    for j in range(1, m + 1):
        score[0][j], move[0][j] = j * GAP, 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = 2 if L[i - 1] == H[j - 1] else 1 if similar(L[i - 1], H[j - 1]) else -2
            best = max((score[i - 1][j - 1] + s, 0), (score[i - 1][j] + GAP, 1), (score[i][j - 1] + GAP, 2))
            score[i][j], move[i][j] = best
    pairs, i, j = {}, n, m
    while i > 0 or j > 0:
        mv = move[i][j]
        if i > 0 and j > 0 and mv == 0:
            if similar(L[i - 1], H[j - 1]):
                pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif i > 0 and (j == 0 or mv == 1):
            i -= 1
        else:
            j -= 1
    return pairs


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--audio', default=os.path.join(ROOT, 'audio', 'letter.mp3'))
    ap.add_argument('--letter', default=os.path.join(ROOT, 'content', 'letter.js'))
    ap.add_argument('--out', default=os.path.join(ROOT, 'content', 'letter-timing.js'))
    ap.add_argument('--model', default='small')
    ap.add_argument('--language', default='en')
    args = ap.parse_args()

    letter = letter_words(args.letter)
    print(f'Transcribing {os.path.relpath(args.audio, ROOT)} with Whisper ({args.model})...', file=sys.stderr)
    heard, duration = transcribe(args.audio, args.model, args.language)
    pairs = align(letter, heard)

    # Matched words take Whisper's start time.
    times = [None] * len(letter)
    for li, hi in pairs.items():
        times[li] = heard[hi][1]
    if not pairs:
        sys.exit('None of the spoken words matched the letter. Is it the right recording?')
    # Between two matched words, letter words Whisper spelled differently ("monthsary" heard as
    # "Montserie") take the times of the heard words in the same gap, in order.
    anchors = [(-1, -1)] + sorted(pairs.items()) + [(len(letter), len(heard))]
    for (l0, h0), (l1, h1) in zip(anchors, anchors[1:]):
        lgap, hgap = list(range(l0 + 1, l1)), list(range(h0 + 1, h1))
        if lgap and hgap:
            for k, li in enumerate(lgap):
                times[li] = heard[hgap[k * len(hgap) // len(lgap)]][1]
    # Anything still unknown is spread evenly between its neighbours.
    known = [i for i, t in enumerate(times) if t is not None]
    for i in range(len(times)):
        if times[i] is not None:
            continue
        before = max((k for k in known if k < i), default=None)
        after = min((k for k in known if k > i), default=None)
        t0 = times[before] if before is not None else 0.0
        t1 = times[after] if after is not None else duration
        k0 = before if before is not None else -1
        k1 = after if after is not None else len(times)
        times[i] = t0 + (t1 - t0) * (i - k0) / (k1 - k0)
    for i in range(1, len(times)):  # keep them in order
        times[i] = max(times[i], times[i - 1] + 0.01)
    times = [round(t, 3) for t in times]

    timing = {'source': f'whisper-{args.model}', 'fingerprint': fingerprint(letter), 'wordCount': len(letter),
              'duration': round(duration, 2), 'times': times}
    header = """/* ─────────────────────────────────────────────────────────────
   LETTER TIMING — when each word of the letter is spoken in the recording.

   times[i] = the second in audio/letter.mp3 where word number i starts
   (words are counted in order, stickers/themes markers don't count).

   Made by tools/align-letter.py from the real recording. If you change the
   letter's words, run it again. If the word count here doesn't match the
   letter, the site falls back to an automatic estimate.
   ───────────────────────────────────────────────────────────── */
"""
    with open(args.out, 'w', encoding='utf-8', newline='\n') as f:
        f.write(header + 'window.LETTER_TIMING = ' + json.dumps(timing, separators=(',', ':')) + ';\n')

    # Report what didn't match, so the text can be fixed to what was actually said.
    matched_heard = set(pairs.values())
    missed = [(i, w) for i, w in enumerate(letter) if i not in pairs]
    extra = [(j, w) for j, (w, _, _) in enumerate(heard) if j not in matched_heard]
    print(f'{len(pairs)}/{len(letter)} letter words matched the recording ({duration:.1f}s). Wrote {os.path.relpath(args.out, ROOT)}.')
    if missed:
        print('In the letter but not clearly heard (timing guessed):')
        for i, w in missed:
            ctx = ' '.join(letter[max(0, i - 3):i + 4])
            print(f'   {w!r:<14} ...{ctx}...')
    if extra:
        print('Heard but not in the letter (Whisper mishearing, or a changed word):')
        for j, w in extra:
            ctx = ' '.join(x for x, _, _ in heard[max(0, j - 3):j + 4])
            print(f'   {w!r:<14} at {heard[j][1]:6.2f}s  ...{ctx}...')


if __name__ == '__main__':
    main()
