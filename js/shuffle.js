/* Shuffle bag: random order with no repeats until every clip has played.

   How it works:
   • Every clip goes in a "bag" in a truly random order (Fisher–Yates shuffle, using the
     browser's cryptographic randomness, so no clip is favored).
   • Each click takes the next clip out of the bag. Nothing repeats until the bag is empty.
   • When the bag empties it's refilled in a fresh random order, and the first clip of the
     new round is never the clip that just played (no back-to-back repeat at the seam).
     Every allowed order stays equally likely.
   • The bag is remembered on the device, so closing the page doesn't reset the round.
   • Clips added to the list later join the current round at a random spot; clips removed
     are dropped. A clip that fails to load is skipped. */
(function () {
  const R = (window.Roses = window.Roses || {});

  /** Unbiased random integer in [0, n). Rejection sampling avoids modulo bias. */
  function randInt(n) {
    if (n <= 1) return 0;
    const c = window.crypto;
    if (c && c.getRandomValues) {
      const buf = new Uint32Array(1);
      const limit = Math.floor(0x100000000 / n) * n;
      let x;
      do { c.getRandomValues(buf); x = buf[0]; } while (x >= limit);
      return x % n;
    }
    return Math.floor(Math.random() * n);
  }

  /** Fisher–Yates: every permutation equally likely. */
  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } },
    set(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} },
  };

  class ShuffleBag {
    constructor(key, items) {
      this.key = 'roses-bag:' + key;
      this.items = [...new Set(items)];
      const s = store.get(this.key) || {};
      this.queue = Array.isArray(s.queue) ? s.queue : []; // still to play this round, in order
      this.played = Array.isArray(s.played) ? s.played : []; // already played this round
      this.last = typeof s.last === 'string' ? s.last : null; // most recent clip (survives rounds)
    }

    /** Make the saved state agree with the current clip list. */
    sync() {
      const valid = new Set(this.items);
      this.played = [...new Set(this.played.filter((p) => valid.has(p)))];
      const done = new Set(this.played);
      this.queue = [...new Set(this.queue.filter((p) => valid.has(p) && !done.has(p)))];
      // No round in progress: leave it empty so refill() deals a fresh round (with the no-repeat rule).
      if (!this.queue.length && !this.played.length) return;
      const queued = new Set(this.queue);
      for (const p of this.items) {
        if (!done.has(p) && !queued.has(p)) this.queue.splice(randInt(this.queue.length + 1), 0, p); // new clip: random spot
      }
    }

    refill() {
      this.played = [];
      this.queue = shuffle(this.items);
      // No back-to-back repeat across rounds. Swapping the first item with a uniformly
      // chosen other position keeps every allowed order exactly equally likely.
      if (this.queue.length > 1 && this.queue[0] === this.last) {
        const j = 1 + randInt(this.queue.length - 1);
        const t = this.queue[0]; this.queue[0] = this.queue[j]; this.queue[j] = t;
      }
    }

    /** The clip that will play next (doesn't use it up). */
    peek() {
      if (!this.items.length) return null;
      this.sync();
      if (!this.queue.length) { this.refill(); this.save(); }
      // Safety net: never hand back the clip that just played if anything else is available.
      if (this.queue.length > 1 && this.queue[0] === this.last) {
        const j = 1 + randInt(this.queue.length - 1);
        const t = this.queue[0]; this.queue[0] = this.queue[j]; this.queue[j] = t;
        this.save();
      }
      return this.queue[0];
    }

    /** Take the next clip out of the bag. */
    next() {
      const p = this.peek();
      if (p == null) return null;
      this.queue.shift();
      this.played.push(p);
      this.last = p;
      this.save();
      return p;
    }

    /** Stop using a clip (e.g. its file is missing). */
    drop(p) {
      this.items = this.items.filter((x) => x !== p);
      this.sync();
      this.save();
    }

    /** How many clips are left in this round, and how many there are in total. */
    progress() { this.sync(); return { left: this.queue.length, total: this.items.length }; }

    save() { store.set(this.key, { queue: this.queue, played: this.played, last: this.last }); }
  }

  R.shuffle = { ShuffleBag, shuffle, randInt };
})();
