// Demoty landing page.
// The opening scene is one scroll-driven timeline, like the app's own intro:
// the flower blooms away, the glass pill darkens and flies into the iPhone's Dynamic Island,
// and the red becomes the iPhone's screen. The iPhone then stays and walks through the app.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (x, a, b) => clamp((x - a) / (b - a));
  const smooth = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const lerp = (a, b, k) => a + (b - a) * k;

  // Artwork geometry. Logo: 881 px canvas, the pill with its rim. Phone: the iPhone 18 Pro frame.
  const PILL = { x: 231 / 881, y: 332 / 881, w: 418 / 881, h: 213 / 881 };
  const PATCH = { x: 225 / 881, y: 326 / 881, w: 430 / 881, h: 225 / 881 };
  const HOLE = { x: 72 / 1350, y: 69 / 2760, w: 1206 / 1350, h: 2622 / 2760, r: 133 / 1350 };
  const ISLAND = { x: 0.3831, y: 0.0164, w: 0.2338, h: 0.0412 };

  const nav = $(".nav");
  const scene = $(".scene");
  const red = $(".red");
  const heroText = $(".hero-text");
  const logo = $(".logo");
  const flower = $(".flower");
  const island = $(".island");
  const pillImg = $(".island img");
  const device = $(".device");
  const screens = $$(".device img");
  const chapters = $$(".chapters li");
  const hint = $(".hint");

  if (reduce) document.documentElement.classList.add("reduce");

  // Chapter timing, in viewport heights of scroll after the intro.
  const INTRO = 1.0;
  const FIRST = 1.25;
  const STEP = 0.95;

  /** The island swells as it takes the pill in, then settles. */
  const swell = (v) => {
    if (v <= 0) return 0;
    if (v < 0.4) return 0.3 * (1 - Math.pow(1 - v / 0.4, 3));
    if (v < 0.78) return lerp(0.3, -0.05, smooth((v - 0.4) / 0.38));
    return lerp(-0.05, 0, smooth(Math.min(1, (v - 0.78) / 0.22)));
  };

  const place = (el, x, y, w, h) => {
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    el.style.width = `${w}px`; el.style.height = `${h}px`;
  };

  function frame() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const desktop = vw >= 900;
    const q = reduce ? 99 : Math.max(0, -scene.getBoundingClientRect().top / vh);
    const p = clamp(q / INTRO);

    // The iPhone: centred for the intro, then aside for the chapters on wide screens.
    const ph = Math.min(desktop ? vh * 0.8 : vh * 0.6, 780);
    const pw = ph * 675 / 1380;
    const cx = vw / 2, cy = desktop ? vh / 2 + 18 : vh * 0.42;
    const aside = desktop ? smooth(seg(q, INTRO + 0.08, INTRO + 0.5)) * Math.min(vw * 0.2, 290) : 0;
    const px = cx - pw / 2, py = cy - ph / 2;
    place(device, px + aside, py, pw, ph);

    const sx = px + HOLE.x * pw, sy = py + HOLE.y * ph, sw = HOLE.w * pw, sh = HOLE.h * ph, sr = HOLE.r * pw;
    const isl = { x: sx + ISLAND.x * sw, y: sy + ISLAND.y * sh, w: ISLAND.w * sw, h: ISLAND.h * sh };

    // The logo where the opening shows it.
    const L = Math.min(desktop ? vw * 0.17 : vw * 0.42, vh * 0.25, 260);
    const lx = cx - L / 2, ly = (desktop ? vh * 0.3 : vh * 0.27) - L / 2;
    place(logo, lx, ly, L, L);
    heroText.style.top = `${ly + L + (desktop ? 28 : 20)}px`;

    if (!reduce) {
      // Words go first.
      const words = smooth(seg(p, 0, 0.26));
      heroText.style.opacity = 1 - words;
      heroText.style.transform = `translateY(${-36 * words}px)`;
      hint.style.opacity = 1 - smooth(seg(p, 0, 0.08));

      // The flower blooms away, turning as it goes.
      const bloom = smooth(seg(p, 0.04, 0.42));
      flower.style.transform = `scale(${1 + 1.9 * bloom}) rotate(${32 * bloom}deg)`;
      flower.style.opacity = 1 - bloom;
      flower.style.filter = `blur(${12 * bloom}px) drop-shadow(0 30px 40px rgba(100,0,6,${0.35 * (1 - bloom)}))`;

      // The pill: glass to black, then up into the island, stretching with its speed.
      const dark = smooth(seg(p, 0.08, 0.22));
      const fly = smooth(seg(p, 0.14, 0.7));
      const stretch = Math.sin(Math.PI * fly);
      const start = { x: lx + PATCH.x * L, y: ly + PATCH.y * L, w: PATCH.w * L, h: PATCH.h * L };
      const core = { x: lx + PILL.x * L, y: ly + PILL.y * L, w: PILL.w * L, h: PILL.h * L };
      const from = fly > 0 ? core : start;
      let w = lerp(from.w, isl.w, fly) * (1 - 0.14 * stretch);
      let h = lerp(from.h, isl.h, fly) * (1 + 0.5 * stretch);
      let mx = lerp(from.x + from.w / 2, isl.x + isl.w / 2, fly);
      let my = lerp(from.y + from.h / 2, isl.y + isl.h / 2, fly);
      const s = swell(seg(p, 0.68, 0.94));
      if (s !== 0) {
        w = isl.w * (1 + s); h = isl.h * (1 + s * 0.42);
        mx = isl.x + isl.w / 2; my = isl.y + h / 2 - (h - isl.h) * 0.15;
      }
      place(island, mx - w / 2, my - h / 2, w, h);
      island.style.setProperty("--dark", fly > 0 ? 1 : dark);
      pillImg.style.opacity = fly > 0 ? 0 : 1 - dark;
      island.style.opacity = 1 - seg(p, 0.94, 1);
      island.style.visibility = p >= 1 ? "hidden" : "visible";

      // The red shrinks into the iPhone's screen, then clears onto it.
      const into = smooth(seg(p, 0.24, 0.84));
      const t = lerp(0, sy, into), l = lerp(0, sx, into);
      const r = lerp(0, vw - (sx + sw), into), b = lerp(0, vh - (sy + sh), into);
      red.style.clipPath = `inset(${t}px ${r}px ${b}px ${l}px round ${lerp(0, sr, into)}px)`;
      red.style.opacity = 1 - smooth(seg(p, 0.84, 0.98));
      red.style.transform = `translateX(${aside}px)`;

      // The app, screen by screen, with its words.
      screens.forEach((img, i) => {
        if (i === 0) return;
        img.style.opacity = smooth(seg(q, FIRST + i * STEP - 0.12, FIRST + i * STEP + 0.12));
      });
      chapters.forEach((li, i) => {
        const at = FIRST + i * STEP;
        const inA = smooth(seg(q, at - 0.3, at));
        const outA = i === chapters.length - 1 ? 0 : smooth(seg(q, at + STEP - 0.3, at + STEP - 0.05));
        li.style.opacity = inA * (1 - outA);
        li.style.transform = `translateY(${(1 - inA) * 30 - outA * 30}px)`;
        if (desktop) {
          const left = Math.max(28, (vw - 1180) / 2);
          li.style.left = `${left}px`; li.style.right = "auto";
          li.style.top = "50%"; li.style.marginTop = "-120px";
          li.style.width = `${Math.min(500, cx + aside - pw / 2 - left - 40)}px`;
        } else {
          li.style.left = "20px"; li.style.right = "20px"; li.style.width = "auto";
          li.style.top = `${py + ph + 18}px`; li.style.marginTop = "0";
        }
      });

      // White on red only while the red still sits under the bar.
      nav.dataset.tone = t < 58 && p < 0.84 ? "light" : "glass";
    } else {
      nav.dataset.tone = "glass";
    }
  }

  let queued = false;
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; frame(); floatRow(); }); } };
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);

  // Floating frames drift sideways with the scroll.
  const track = $(".float-track");
  function floatRow() {
    if (!track || reduce) return;
    const r = track.getBoundingClientRect();
    const k = (window.innerHeight - r.top) / (window.innerHeight + r.height);
    const extra = track.scrollWidth - window.innerWidth;
    track.style.transform = `translateX(${-clamp(k) * Math.max(0, extra) * 0.9}px)`;
  }

  // Reveal sections as they arrive.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  // Try it: background, frame, blur, pattern.
  const canvas = $(".canvas");
  const bg = $(".canvas-bg");
  const phone = $(".canvas-phone");
  const pattern = $(".canvas-pattern");
  const frameName = $(".frame-name");
  let blur = 0;

  const pick = (group, el) => {
    $$("button", group).forEach((b) => { const on = b === el; b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
  };

  $(".swatches").addEventListener("click", (e) => {
    const b = e.target.closest(".swatch"); if (!b) return;
    pick(e.currentTarget, b);
    const next = document.createElement("div");
    next.className = "canvas-bg-next";
    next.style.setProperty("--img", `url(assets/bg-${b.dataset.bg}.jpg)`);
    next.style.filter = `blur(${blur}px)`;
    canvas.insertBefore(next, pattern);
    requestAnimationFrame(() => { next.style.opacity = 1; });
    setTimeout(() => {
      bg.style.setProperty("--img", `url(assets/bg-${b.dataset.bg}.jpg)`);
      next.remove();
    }, 520);
  });

  $(".dots").addEventListener("click", (e) => {
    const b = e.target.closest(".dot"); if (!b) return;
    pick(e.currentTarget, b);
    frameName.textContent = b.dataset.name;
    phone.classList.add("swap");
    const img = new Image();
    img.onload = () => {
      phone.src = img.src;
      phone.alt = `A travel app in iPhone ${b.dataset.name.replace(" · ", ", ")}`;
      requestAnimationFrame(() => phone.classList.remove("swap"));
    };
    img.src = `assets/${b.dataset.frame}.png`;
  });

  $("#blur").addEventListener("input", (e) => {
    blur = +e.target.value;
    bg.style.filter = `blur(${blur}px)`;
  });

  $(".seg").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    pick(e.currentTarget, b);
    pattern.dataset.p = b.dataset.pattern;
  });

  frame();
  floatRow();
})();
