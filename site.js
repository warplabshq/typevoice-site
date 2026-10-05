// www → apex. Pages' _redirects can't do host-level redirects; a Cloudflare Redirect Rule does
// it before this runs, and this is the fallback until that rule exists.
if (location.hostname === "www.typevoice.ai") location.replace("https://typevoice.ai" + location.pathname + location.search + location.hash);

// One place for everything a rebrand touches. Text nodes with data-brand="key" fill from here.
window.SITE = {
  name: "TypeVoice",
  tagline: "Local dictation for Mac",
  company: "Priyam Ventures",
  email: "mail@warplabs.co",     // support + privacy contact
  domain: "https://typevoice.ai",    // where this site is hosted
  downloadURL: "https://github.com/warplabshq/typevoice-releases/releases/latest/download/TypeVoice.dmg",
  released: true,           // false makes every Download button read "Available soon"
  // Dodo Payments products (live). Test-mode twins: pdt_0Nnye4FRV4gyNve43FkdY / pdt_0Nnye4HFHXLRKq4WkVJXG on test.checkout.dodopayments.com.
  checkoutURL: "https://checkout.dodopayments.com/buy/pdt_0NnyeIUl5lH6A5vMnNQl0",
  updated: "September 26, 2026",
  price: "$79",
  priceNote: "once, after 7 free days",
  refundDays: "14",
  macLimit: "2",            // activations limit on the personal key (a desk Mac and a laptop)
  teamSeats: "5",           // the team key: one key, teamSeats people, 2 Macs each (activations limit 10)
  teamPrice: "$299",
  teamCheckoutURL: "https://checkout.dodopayments.com/buy/pdt_0NnyeIYh7eg5s2udMzUGZ",
  jurisdiction: "India",
  address: "",              // postal address; shown after the company name once set
};
document.addEventListener("DOMContentLoaded", () => {
  for (const el of document.querySelectorAll("[data-brand]")) {
    const v = SITE[el.dataset.brand];
    if (v === undefined) continue;
    if (el.tagName === "A" && el.dataset.href !== undefined) el.href = v; else el.textContent = v;
  }
  for (const a of document.querySelectorAll("a[data-mail]")) { a.href = "mailto:" + SITE.email; a.textContent = SITE.email; }
  for (const el of document.querySelectorAll("[data-brand=\"address-line\"]")) el.textContent = SITE.address ? ", " + SITE.address : "";
  for (const a of document.querySelectorAll("a[data-download]")) {
    a.dataset.umamiEvent = "download";   // Umami counts clicks on these (no personal data)
    a.dataset.umamiEventPlace = a.closest("header") ? "nav" : a.closest("footer") ? "footer" : (a.closest("section")?.id || a.closest("section")?.className.split(" ")[0] || "page");
    if (SITE.released) { a.href = SITE.downloadURL; continue; }
    a.removeAttribute("href"); a.classList.add("soon"); a.setAttribute("aria-disabled", "true"); a.title = "The first release is being notarized";
    if (a.classList.contains("cta") || a.classList.contains("navcta")) a.innerHTML = a.innerHTML.replace(/Download( for Mac)?/, "Available soon");
  }
  // Checkout links carry the return page, so the key lands on /thanks after payment.
  // If the visit came from a Google ad, keep Google's click id in this browser and hand it to
  // checkout as metadata, so a sale can be matched to the ad. Kept 90 days, then forgotten.
  let click = "", fromAd = false;
  try {
    const q = new URLSearchParams(location.search), id = q.get("gclid") || q.get("gbraid") || q.get("wbraid");
    if (id) localStorage.setItem("tv_click", JSON.stringify({ id, kind: q.get("gclid") ? "gclid" : q.get("gbraid") ? "gbraid" : "wbraid", at: Date.now() }));
    const saved = JSON.parse(localStorage.getItem("tv_click") || "null");
    if (saved && Date.now() - saved.at < 90 * 864e5) { fromAd = true; click = "&metadata_" + saved.kind + "=" + encodeURIComponent(saved.id) + "&metadata_click_at=" + encodeURIComponent(new Date(saved.at).toISOString()); }
    else if (saved) localStorage.removeItem("tv_click");
  } catch (_) {}
  // Google's ad tag, only for those ad visits: it counts a download or a purchase against the
  // ad. Everyone else never loads a Google script. EEA, UK and Swiss visits run in Google's
  // consent mode with ad cookies off. On /thanks the license key is already out of the URL
  // (thanks.html strips it first) and only the payment id goes along. The page is reported as
  // /purchased, and the sale counts once per payment id (the transaction id).
  if (fromAd) {
    const ADS = "AW-18475319144";
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied",
      region: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT","LV","LI","LT","LU","MT","NL","NO","PL","PT","RO","SK","SI","ES","SE","GB","CH"] });
    gtag("consent", "default", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied", analytics_storage: "denied" });
    gtag("js", new Date());
    const thanks = location.pathname.replace(/\.html$/, "") === "/thanks";
    gtag("config", ADS, thanks ? { send_page_view: false, page_location: location.origin + "/purchased", page_referrer: "" } : {});
    if (thanks && window.TV_PAYMENT) gtag("event", "conversion", { send_to: ADS + "/XCx8COHg44UdEOj-2-lE", value: 79, currency: "USD", transaction_id: window.TV_PAYMENT });
    for (const a of document.querySelectorAll("a[data-download]"))
      a.addEventListener("click", () => gtag("event", "conversion", { send_to: ADS + "/R8eHCPuO4oUdEOj-2-lE", transport_type: "beacon" }));
    const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + ADS; document.head.appendChild(s);
  }
  const back = "?redirect_url=" + encodeURIComponent(SITE.domain + "/thanks") + click;
  for (const a of document.querySelectorAll("a[data-checkout]")) { a.href = SITE.checkoutURL + back; a.dataset.umamiEvent = "buy"; a.dataset.umamiEventPlace = a.closest("section")?.id || "page"; }
  for (const a of document.querySelectorAll("a[data-checkout-team]")) { a.href = SITE.teamCheckoutURL + back; a.dataset.umamiEvent = "buy-team"; }
  document.title = document.title.replace("TypeVoice", SITE.name);
  const y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  // Speech as it sounds: each word slightly tilted, offset and wobbling at its own pace.
  const clumsy = (text) => text.trim().split(/\s+/).map((w, i) => {
    const r = ((i * 7) % 11 - 5) * 0.55, y = ((i * 5) % 7 - 3) * 0.9, d = 2.6 + (i * 3) % 5 * 0.4, dl = -((i * 11) % 9) * 0.35, o = 0.42 + ((i * 13) % 5) * 0.09;
    return `<i class="w" style="--r:${r}deg;--y:${y}px;--d:${d}s;--dl:${dl}s;--o:${o}">${w}</i>`;
  }).join(" ");
  // Pill bars: calm, voice-like, on a canvas (hero + final).
  function startBars(c, opt = {}) {
    if (!c) return;
    const ctx = c.getContext("2d"), dpr = window.devicePixelRatio || 1;
    const W = opt.w || 168, H = opt.h || 40; c.width = W * dpr; c.height = H * dpr; c.style.width = W + "px"; c.style.height = H + "px"; ctx.scale(dpr, dpr);
    const n = opt.n || 18, bw = opt.bw || 2.5, gap = opt.gap || 2; let disp = new Array(n).fill(0);
    function bands(t) { const out = []; const syl = (0.35 + 0.65 * Math.max(0, Math.sin(t * 4.2))) * (0.7 + 0.3 * Math.sin(t * 0.9));
      for (let b = 0; b < 10; b++) { const f = 0.55 + 0.45 * Math.sin(t * 2.7 + b * 1.1); out.push(Math.min(1, Math.max(0, (0.15 + 0.85 * syl * f) * (1 - b * 0.055)))); } return out; }
    function targets(bs) { const half = (n - 1) / 2, raw = []; for (let i = 0; i < n; i++) { const d = Math.abs(i - half) / half, pos = d * 9, lo = Math.floor(pos), hi = Math.min(lo + 1, 9), f = pos - lo; let v = bs[lo] * (1 - f) + bs[hi] * f; if (i % 2) v = v * 0.85 + bs[Math.min(hi + 1, 9)] * 0.15; raw.push(v); }
      const out = raw.slice(); for (let i = 1; i < n - 1; i++) out[i] = raw[i-1] * 0.25 + raw[i] * 0.5 + raw[i+1] * 0.25; return out; }
    let last = performance.now();
    function frame(now) {
      // Off screen or hidden: keep the loop alive but draw nothing.
      if (document.hidden || c.closest(".offscreen")) { last = now; requestAnimationFrame(frame); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
      const boost = Math.max(0, (window.__boost || 0) - 0.02 * (dt * 60)); window.__boost = boost;
      const tg = targets(bands(t)).map(v => Math.min(1, v * (0.55 + boost * 1.2) + boost * 0.35));
      const up = 1 - Math.pow(0.001, dt * 3.2), down = 1 - Math.pow(0.001, dt * 1.6);
      ctx.clearRect(0, 0, W, H); const total = n * (bw + gap) - gap; let x = (W - total) / 2; const half = (n - 1) / 2;
      for (let i = 0; i < n; i++) { disp[i] += (tg[i] - disp[i]) * (tg[i] > disp[i] ? up : down); const h = Math.max(2, disp[i] * H * 0.82);
        const edge = Math.abs(i - half) / half; ctx.fillStyle = `rgba(255,255,255,${0.95 - 0.3 * edge})`;
        ctx.beginPath(); ctx.roundRect(x, H / 2 - h / 2, bw, h, bw / 2); ctx.fill(); x += bw + gap; }
      requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  }
  startBars(document.getElementById("wave2"), { w: 200, h: 48, n: 24, bw: 2.8, gap: 2.6 });
  // Hero ticker. One flow, left to right: speech bars run into the icon, the typed sentence
  // comes out the other side. Both move at the same speed so it reads as one stream.
  const tkOut = document.getElementById("tk-out"), tkIn = document.getElementById("tk-in");
  if (tkOut && tkIn) {
    const speed = 44; // px per second
    // Real dictations, with a few lines people have said out loud before us tucked in between.
    const lines = [
      "Can we move the launch review to Wednesday at 3? Wednesday works better for the design team.",
      "There was an idea\u2026 to bring together a group of remarkable people.",
      "Shipped the new export flow to VidAI. Two things to watch: cold start, and the retry logic.",
      "Houston, we have a problem.",
      "Groceries: milk, eggs, bread. Also call the dentist on Monday.",
      "Do or do not. There is no try.",
      "Hey, quick one: the invoice for March is still open, can you nudge them?",
      "Roads? Where we're going, we don't need roads.",
      "I think we should hold the release till the crash on Intel is fixed.",
      "I am Iron Man.",
      "Draft to Sam: loved the deck, two comments on slide four, otherwise ship it.",
      "Elementary, my dear Watson.",
      "Note to self: the good coffee is in the second cupboard, not the first.",
      "With great power comes great responsibility.",
      "Standup: yesterday the migration, today the flaky test, no blockers.",
      "Just keep swimming.",
      "Avengers, assemble.",
    ];
    const clean = lines.join("   ") + "   ";
    tkOut.innerHTML = `<span>${clean}</span><span>${clean}</span>`;
    const fit = () => { tkOut.style.animationDuration = (tkOut.scrollWidth / 2 / speed) + "s"; };
    fit(); addEventListener("resize", fit);

    // Bars: a fixed pitch, heights from a slow syllable-like envelope keyed to world position,
    // so the same bar keeps its height as it travels.
    const ctx = tkIn.getContext("2d"), bw = 4, gap = 4.5, pitch = bw + gap;
    const css = getComputedStyle(document.documentElement);
    const color = css.getPropertyValue("--tk-bar").trim() || "#8fb5f7", near = css.getPropertyValue("--c-green").trim() || "#5fd68a";
    let grad = null;
    let W = 0, H = 0, dpr = 1;
    const size = () => { dpr = window.devicePixelRatio || 1; W = tkIn.clientWidth; H = tkIn.clientHeight; tkIn.width = W * dpr; tkIn.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grad = ctx.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, color); grad.addColorStop(.55, color); grad.addColorStop(1, near); };
    size(); addEventListener("resize", size);
    const env = (k) => { // k = bar index in world space; gentle speech rhythm, never silent
      const syl = 0.5 + 0.5 * Math.sin(k * 0.55);                 // syllables
      const breath = 0.6 + 0.4 * Math.sin(k * 0.17 + 1.3);         // phrases
      const grain = 0.75 + 0.25 * Math.sin(k * 2.3) * Math.cos(k * 0.9);
      return 0.28 + 0.72 * syl * breath * grain; };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let t0 = performance.now();
    function frame(now) {
      // Browsers already stop rAF in hidden tabs; only skip when the hero is scrolled away.
      if (tkIn.closest(".offscreen")) { requestAnimationFrame(frame); return; }
      const off = reduced ? 0 : ((now - t0) / 1000) * speed;  // px travelled to the right
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = grad || color;
      // The cursor is a second voice: bars swell under it, and pressing the mouse makes the whole stream talk.
      const tk = window.__tk || { x: -1e4, near: 0, talk: 0 };
      tk.nearS = (tk.nearS || 0) + ((tk.near || 0) - (tk.nearS || 0)) * 0.12; tk.talkS = (tk.talkS || 0) + ((tk.talk || 0) - (tk.talkS || 0)) * 0.1;
      const first = Math.floor(-off / pitch) - 1, maxH = H * 0.5, ts = now / 1000;
      for (let k = first; ; k++) {
        const x = k * pitch + off; if (x > W) break; if (x + bw < 0) continue;
        const dx = x - tk.x, swell = tk.nearS * 1.25 * Math.exp(-dx * dx / 5000);
        const talk = tk.talkS * (0.45 + 0.55 * Math.abs(Math.sin(ts * 9 + k * 0.7)));
        const h = Math.max(3, Math.min(H * 0.96, env(k) * maxH * (1 + swell + talk)));
        ctx.beginPath(); ctx.roundRect(x, H / 2 - h / 2, bw, h, bw / 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  // Regional pricing. /geo (a Pages Function) returns the fixed price for the visitor's country
  // when there is one; Dodo charges exactly that at checkout, by billing country (plus tax).
  const priceTag = document.querySelector(".price-tag");
  if (priceTag && window.fetch) {
    fetch("/geo" + location.search).then(r => r.ok ? r.json() : null).then(g => {
      if (!g || !g.personal) return;
      const money = (n) => { try { return new Intl.NumberFormat("en", { style: "currency", currency: g.currency, maximumFractionDigits: 0 }).format(n); } catch (_) { return g.currency + " " + n; } };
      // Just the flag, no country name: "you're in 🇮🇳" is enough. Windows has no flag glyphs
      // and would show "IN", so it gets the plain price instead.
      if (!/^[A-Z]{2}$/.test(g.country) || /Win/.test(navigator.platform)) return;
      const flag = String.fromCodePoint(...[...g.country].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
      const p1 = money(g.personal), p2 = money(g.team);
      priceTag.querySelector("span").innerHTML = `${p1} <s>$79</s>`;
      priceTag.querySelector("small").innerHTML = `<span class="offer"><span>${flag}</span>A special price for you</span><br>once, plus ${g.tax}`;
      const tp = document.getElementById("team-price"); if (tp) tp.innerHTML = `${p2} <s>$299</s>`;
      const note = document.getElementById("price-note"); if (note) note.textContent =
        `${flag} You're in one of the few places with a special price; the checkout applies it by billing country. Payments by Dodo Payments · ${SITE.refundDays}-day money-back guarantee`;
      const fp = document.getElementById("final-price"); if (fp) fp.textContent = `Free for 7 days · ${flag} ${p1} once`;
      if (window.umami && umami.track) umami.track("regional-price", { country: g.country });
    }).catch(() => {});
  }

  // Sticky header shadow.
  const hdr = document.querySelector("header.nav");
  if (hdr) { const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 8); onScroll(); addEventListener("scroll", onScroll, { passive: true }); }
  // You say / you get: cycle real examples.
  const pair = document.getElementById("pair");
  if (pair) {
    const ex = [
      ["um so the launch is tuesday no wait wednesday and i think we're gonna need like two more days for QA", "The launch is Wednesday, and I think we're going to need two more days for QA."],
      ["send the invoice to priyam at vid ai for twenty twenty four q three, five thousand dollars", "Send the invoice to Priyam at VidAI for 2024 Q3, $5,000."],
      ["things to buy bullet milk bullet eggs bullet point bread new paragraph call the dentist monday", "Things to buy\n- Milk\n- Eggs\n- Bread\n\nCall the dentist Monday."],
      ["the the meeting was very very good, honestly it's it's the best one this quarter", "The meeting was very very good, honestly it's the best one this quarter."],
    ];
    const say = document.getElementById("say"), get = document.getElementById("get"); let i = 0;
    const show = () => { say.innerHTML = clumsy(ex[i][0]); get.textContent = ex[i][1]; };
    show();
    setInterval(async () => { pair.classList.add("swap"); await new Promise(r => setTimeout(r, 600)); i = (i + 1) % ex.length; show(); pair.classList.remove("swap"); }, 6500);
  }
  // Mock window: dictations keep arriving, calmly.
  const list = document.querySelector("#mock .list");
  if (list) {
    const feed = [
      ["a1", "✉︎", "Mail", "Thanks for the intro, Maya. Happy to jump on a call Thursday afternoon if that works for you.", 19, 7],
      ["a2", "#", "Slack", "Merged the fix for the retry logic. Cold start on the older machines is down to about a second.", 18, 6],
      ["a3", "✎", "Notes", "Ideas for the talk: start with the demo, keep the slides to five, end on the privacy story.", 17, 6],
      ["a1", "✉︎", "Mail", "Can you send over the signed version by Friday? I'll countersign the same day.", 15, 5],
      ["a2", "#", "Slack", "Design review moved to 4. Bring the new export flow and the onboarding cards.", 14, 5],
    ];
    let fi = 0, minutes = 9 * 60 + 41;
    const wordsEl = document.querySelector('.tile b[data-count="24,310"]'), dictEl = document.querySelector('.tile b[data-count="893"]');
    let words = 24310, dicts = 893;
    // Background tabs stall requestAnimationFrame, which left ghost rows; the feed simply waits.
    addEventListener("visibilitychange", () => { if (!document.hidden) list.querySelectorAll(".arriving").forEach(el => el.classList.remove("arriving")); });
    setInterval(() => {
      if (document.hidden) return;
      const [cls, glyph, app, text, w, sec] = feed[fi++ % feed.length];
      minutes += 3; const h = Math.floor(minutes / 60), m = minutes % 60;
      const item = document.createElement("div"); item.className = "item arriving";
      item.innerHTML = `<span class="app ${cls}">${glyph}</span><div><p></p><small>${app} · ${h}:${String(m).padStart(2, "0")} AM · ${w} words · ${sec}s · ${180 + Math.round(Math.random() * 80)} ms</small></div>`;
      item.querySelector("p").textContent = text;
      list.prepend(item); setTimeout(() => item.classList.remove("arriving"), 30);
      while (list.children.length > 3) list.lastElementChild.remove();
      if (wordsEl && wordsEl.dataset.done) { words += w; dicts += 1; wordsEl.textContent = words.toLocaleString(); dictEl.textContent = dicts.toLocaleString(); }
    }, 7000);
  }
  // Tour scenes.
  const mp = document.querySelector(".mini-pill");
  if (mp) {
    const spots = [["50%","-50%",74],["8%","0",74],["92%","-100%",74],["50%","-50%",11],["92%","-100%",11],["8%","0",11]];
    const looks = ["", "glass", "dark"], accents = ["#ffffff","#4d9cff","#b28cff","#ff80b3","#66d98c"];
    let si = 0, li = 0, ai = 0; const sw = document.querySelectorAll(".swatches span");
    const place = () => { const [x, tx, y] = spots[si]; mp.style.left = x; mp.style.top = y + "%"; mp.style.transform = `translateX(${tx})`; };
    place();
    setInterval(() => { si = (si + 1) % spots.length; place(); if (si === 0) { li = (li + 1) % looks.length; mp.className = "mini-pill " + looks[li]; ai = (ai + 1) % accents.length; mp.style.setProperty("--accent", accents[ai]); sw.forEach((e, k) => e.classList.toggle("on", k === ai)); } }, 3200);
  }
  const chip = document.getElementById("chip");
  if (chip) {
    const voice = document.getElementById("voice"), input = document.querySelector(".chat-input"), dpill = document.getElementById("dpill");
    (async function dragLoop() {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      while (true) {
        chip.className = "chip"; chip.style.transform = ""; voice.classList.remove("show"); input.classList.remove("hot");
        await sleep(1800);
        chip.classList.add("lift");
        const from = chip.getBoundingClientRect(), to = input.getBoundingClientRect();
        chip.style.transform = `translate(${to.left + 40 - from.left}px, ${to.top + 6 - from.top}px)`;
        await sleep(900); input.classList.add("hot");
        await sleep(700); chip.classList.add("gone"); input.classList.remove("hot");
        await sleep(300); voice.classList.add("show");
        await sleep(3200);
      }
    })();
  }
  // Voice-note showcase: chip drags into iMessage, a voice bubble appears and "plays".
  const chip2 = document.getElementById("chip2");
  if (chip2) {
    const voice2 = document.getElementById("voice2"), input2 = document.getElementById("msginput"), wave2 = document.getElementById("vwave2"), bars = [...wave2.querySelectorAll("i")];
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    (async function loop() {
      while (true) {
        chip2.className = "chip big"; chip2.style.transform = ""; voice2.classList.remove("show"); input2.classList.remove("hot"); wave2.classList.remove("playing"); bars.forEach(b => b.classList.remove("on"));
        await sleep(2200);
        chip2.classList.add("lift");
        const from = chip2.getBoundingClientRect(), to = input2.getBoundingClientRect();
        chip2.style.transform = `translate(${to.left + 60 - from.left}px, ${to.top + 8 - from.top}px)`;
        await sleep(1000); input2.classList.add("hot");
        await sleep(700); chip2.classList.add("gone"); input2.classList.remove("hot");
        await sleep(350); voice2.classList.add("show");
        await sleep(900); wave2.classList.add("playing");
        for (let i = 0; i < bars.length; i++) { bars[i].classList.add("on"); await sleep(320); }
        await sleep(1600);
      }
    })();
  }
  const prev = document.getElementById("style-prev");
  if (prev) {
    const state = { case: 0, punct: 0, tone: 0 };
    const base = [["The launch is Wednesday, and we'll need two more days for QA.", "The launch is Wednesday, and we will need two more days for QA."],
                  ["The launch is Wednesday, and we'll need two more days for QA", "The launch is Wednesday, and we will need two more days for QA"]];
    const render = () => { let t = base[state.punct][state.tone]; if (state.case) t = t.toLowerCase(); prev.style.opacity = 0; setTimeout(() => { prev.textContent = t; prev.style.opacity = 1; }, 250); };
    render();
    const keys = ["case", "punct", "tone"]; let k = 0;
    setInterval(() => { const key = keys[k++ % keys.length]; state[key] = 1 - state[key];
      const seg = document.querySelector(`.seg[data-seg="${key}"]`); seg.querySelectorAll("b").forEach((b, i) => b.classList.toggle("sel", i === state[key])); render(); }, 2600);
  }
  const dt = document.getElementById("dict-text");
  if (dt) {
    const chipEl = document.querySelector(".dict-chip");
    const heard = ["vid ai", "Vidai", "video eye"];
    let hi = 0;
    (async function dictLoop() {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      while (true) {
        const h = heard[hi++ % heard.length], sentence = "Send the export notes to the team at ";
        dt.textContent = "";
        for (let i = 1; i <= sentence.length; i++) { dt.textContent = sentence.slice(0, i); await sleep(26); }
        for (let i = 1; i <= h.length; i++) { dt.textContent = sentence + h.slice(0, i); await sleep(60); }
        await sleep(700);
        chipEl.classList.add("pulse"); dt.innerHTML = sentence + "<mark>VidAI</mark>.";
        await sleep(2600); chipEl.classList.remove("pulse");
      }
    })();
  }
  // Privacy diagrams: the clean chip lands in the field and the sentence types out, every cycle.
  for (const flow of document.querySelectorAll(".flow")) {
    const flowTyped = flow.querySelector(".mfield span"), flyClean = flow.querySelector(".fly.clean");
    if (!flowTyped || !flyClean) continue;
    const sentence = "Can we move the…";
    let timers = [];
    const cycle = () => {
      timers.forEach(clearTimeout); timers = [];
      timers.push(setTimeout(() => { flowTyped.textContent = ""; }, 200));
      for (let i = 1; i <= sentence.length; i++) timers.push(setTimeout(() => { flowTyped.textContent = sentence.slice(0, i); }, 5600 + i * 22));
    };
    cycle(); flyClean.addEventListener("animationiteration", cycle);
  }
  // Landing privacy diagram: when the last dot reaches the app, the sentence types out.
  for (const pf of document.querySelectorAll(".pflow")) {
    const field = pf.querySelector(".pf-field span"), first = pf.querySelector(".pf-dot");
    if (!field) continue;
    const sentence = "Ship it on Friday?";
    let timers = [];
    const cycle = () => {
      timers.forEach(clearTimeout); timers = [];
      timers.push(setTimeout(() => { field.textContent = ""; }, 150));
      for (let i = 1; i <= sentence.length; i++) timers.push(setTimeout(() => { field.textContent = sentence.slice(0, i); }, 5500 + i * 18));
    };
    cycle();
    if (first && getComputedStyle(first).display !== "none") first.addEventListener("animationiteration", cycle);
    else setInterval(() => { if (!pf.closest(".offscreen")) cycle(); }, 6500);
  }
  // Pause every animation in sections that are out of view (canvas loops check the same flag).
  const vis = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("offscreen", !e.isIntersecting)), { rootMargin: "120px 0px" });
  document.querySelectorAll("section, footer").forEach(el => vis.observe(el));
  // Reveal on scroll, count-up numbers.
  // Reveal a little before a section enters, so a fast scroll never lands on a blank viewport.
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px 120px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  // Never leave anything hidden (print, odd scroll tools, very tall viewports).
  setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }), 1200);
  const co = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; co.unobserve(e.target); countUp(e.target); }), { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach(el => co.observe(el));
  function countUp(el) {
    const target = el.dataset.count, m = target.match(/^([\d,.]+)(.*)$/); if (!m) { el.textContent = target; return; }
    const isTime = /h .*m$/.test(target);
    if (isTime) { const [h, mm] = target.match(/(\d+)h (\d+)m/).slice(1).map(Number); const total = h * 60 + mm; const t0 = performance.now();
      (function step(now) { const p = Math.min(1, (now - t0) / 2200), e = 1 - Math.pow(1 - p, 3), v = Math.round(total * e); el.textContent = Math.floor(v / 60) + "h " + (v % 60) + "m"; if (p < 1) requestAnimationFrame(step); })(t0); return; }
    const num = parseFloat(m[1].replace(/,/g, "")), suffix = m[2], decimals = (m[1].split(".")[1] || "").length, t0 = performance.now();
    (function step(now) { const p = Math.min(1, (now - t0) / 2200), e = 1 - Math.pow(1 - p, 3), v = num * e;
      el.textContent = (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix; if (p < 1) requestAnimationFrame(step); else el.dataset.done = "1"; })(t0);
  }
});

// ───────────── Motion: the hero, the three promises, cursor light, magnetic buttons ─────────────
document.addEventListener("DOMContentLoaded", () => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  // Hero: the aurora leans toward the pointer, the dot grid lights around it, the waveform listens.
  const hero = document.querySelector(".hero2"), bg = hero && hero.querySelector(".hero-bg"), tkIn = document.getElementById("tk-in");
  if (hero && bg) {
    window.__tk = { x: -1e4, near: 0, talk: 0 };
    const p = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    addEventListener("pointermove", (e) => {
      const r = bg.getBoundingClientRect(); p.tx = e.clientX - r.left; p.ty = e.clientY - r.top; p.on = e.clientY < r.bottom;
      if (tkIn) { const t = tkIn.getBoundingClientRect(), cy = t.top + t.height / 2; __tk.x = e.clientX - t.left; __tk.near = Math.max(0, 1 - Math.abs(e.clientY - cy) / 260) * (e.clientX < t.right + 40 ? 1 : 0); }
    }, { passive: true });
    const talk = (on) => { __tk.talk = on ? 1 : 0; hero.classList.toggle("talking", on); };
    hero.addEventListener("pointerdown", (e) => { if (!e.target.closest("a, button")) talk(true); });
    addEventListener("pointerup", () => talk(false)); addEventListener("pointercancel", () => talk(false));
    if (!reduced) (function loop() {
      if (!hero.classList.contains("offscreen")) {
        p.x = lerp(p.x, p.tx, 0.08); p.y = lerp(p.y, p.ty, 0.08);
        const r = bg.getBoundingClientRect();
        bg.style.setProperty("--px", p.x + "px"); bg.style.setProperty("--py", p.y + "px");
        bg.style.setProperty("--ax", (p.x - r.width / 2).toFixed(1)); bg.style.setProperty("--ay", (p.y - r.height / 2).toFixed(1));
      }
      requestAnimationFrame(loop);
    })();
  }

  // Cursor light on cards, a gentle tilt on the promises.
  const SPOT = ".tile-b, .gcard, .step, .rapp, .choose > div, .price-card, .cost-card, .cmp-card, .quick a, .priv-grid > div, .pillar, .pflow";
  document.querySelectorAll(SPOT).forEach((el) => el.classList.add("spot"));
  if (fine) document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest(".spot"); if (!el) return;
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
    if (el.classList.contains("pillar") && !reduced) el.style.transform = `perspective(1200px) rotateX(${((0.5 - y / r.height) * 5).toFixed(2)}deg) rotateY(${((x / r.width - 0.5) * 5).toFixed(2)}deg)`;
  }, { passive: true });
  document.querySelectorAll(".pillar").forEach((el) => el.addEventListener("pointerleave", () => { el.style.transform = ""; }));

  // Magnetic buttons: the big CTAs lean toward the pointer.
  if (fine && !reduced) document.querySelectorAll(".cta").forEach((b) => {
    b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`; });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  // 01 Private: words drift inside your Mac and bounce off its edge. The internet is right there, unreachable.
  const vault = document.getElementById("vault");
  if (vault) {
    const card = vault.closest(".pillar"), ctx = vault.getContext("2d"), wifi = document.getElementById("wifi");
    const css = getComputedStyle(document.documentElement), G = css.getPropertyValue("--c-green").trim(), TXT = css.getPropertyValue("--text").trim(), LINE = css.getPropertyValue("--line2").trim(), CARD = css.getPropertyValue("--card2").trim(), FAINT = css.getPropertyValue("--faint").trim();
    const WORDS = ["meeting notes", "salary", "Sam's number", "diagnosis", "the launch", "invoice #482", "love you", "NDA draft", "password?", "Wednesday 3pm", "therapy", "the new idea"];
    let W = 0, H = 0, S = null, words = [], hits = [], mouse = { x: -1e4, y: -1e4 }, offline = false;
    const font = "500 12.5px -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif";
    function size() {
      const dpr = devicePixelRatio || 1; W = vault.clientWidth; H = vault.clientHeight; vault.width = W * dpr; vault.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sw = Math.min(W * 0.86, 480), sh = Math.min(sw * 0.8, H - 160); S = { x: (W - sw) / 2, y: Math.max(78, (H - sh) / 2 + 4), w: sw, h: sh };
      ctx.font = font;
      if (!words.length) words = WORDS.slice(0, W < 420 ? 8 : 12).map((t, i) => { const w = ctx.measureText(t).width + 20, a = i * 2.4;
        return { t, w, h: 26, x: S.x + 20 + ((i * 97) % Math.max(1, sw - w - 40)), y: S.y + 20 + ((i * 53) % Math.max(1, sh - 66)), vx: Math.cos(a) * (22 + i % 4 * 7), vy: Math.sin(a) * (18 + i % 3 * 8) }; });
      else words.forEach((b) => { b.x = Math.min(Math.max(b.x, S.x + 8), S.x + S.w - b.w - 8); b.y = Math.min(Math.max(b.y, S.y + 8), S.y + S.h - b.h - 8); });
    }
    size(); addEventListener("resize", size);
    card.addEventListener("pointermove", (e) => { const r = vault.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    card.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });
    wifi.addEventListener("click", () => { offline = !offline; wifi.setAttribute("aria-pressed", offline); wifi.querySelector(".wl").textContent = offline ? "Wi‑Fi off" : "Wi‑Fi on"; card.classList.toggle("offline", offline); });
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!card.closest(".offscreen") && !document.hidden) {
        ctx.clearRect(0, 0, W, H);
        // The blocked path to the internet: a dashed line from the screen to the cloud, cut in the middle.
        const cx = W - 48, cy = 62, sx = S.x + S.w * 0.72, sy = S.y - 4, qx = cx - 10, qy = sy - 6;
        ctx.save(); ctx.globalAlpha = offline ? 0.12 : 0.55; ctx.setLineDash([3, 5]); ctx.strokeStyle = FAINT; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(qx, qy, cx, cy); ctx.stroke(); ctx.setLineDash([]);
        const mx = 0.25 * sx + 0.5 * qx + 0.25 * cx, my = 0.25 * sy + 0.5 * qy + 0.25 * cy; ctx.strokeStyle = "#ff6b6b"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(mx - 5, my - 5); ctx.lineTo(mx + 5, my + 5); ctx.moveTo(mx + 5, my - 5); ctx.lineTo(mx - 5, my + 5); ctx.stroke(); ctx.restore();
        // The Mac: a screen with a glowing edge, and its base.
        const glow = 10 + 6 * Math.sin(now / 900);
        ctx.save(); ctx.shadowColor = G; ctx.shadowBlur = glow; ctx.strokeStyle = G; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.roundRect(S.x, S.y, S.w, S.h, 14); ctx.stroke(); ctx.restore();
        ctx.fillStyle = LINE; ctx.beginPath(); ctx.roundRect(S.x - 22, S.y + S.h + 8, S.w + 44, 8, [2, 2, 8, 8]); ctx.fill();
        ctx.fillStyle = G; ctx.font = "600 10.5px -apple-system, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.globalAlpha = 0.9;
        ctx.fillText(offline ? "OFFLINE · STILL TYPING" : "YOUR MAC · NOTHING LEAVES", S.x + S.w / 2, S.y + S.h + 36); ctx.globalAlpha = 1; ctx.textAlign = "left";
        // Words: drift, shy away from the cursor, bounce off the edge with a flash, and never pile up.
        ctx.font = font;
        for (let i = 0; i < words.length; i++) for (let j = i + 1; j < words.length; j++) {
          const a = words[i], b = words[j], ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + 6, oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + 6;
          if (ox <= 0 || oy <= 0) continue;
          if (ox < oy) { const d = (a.x < b.x ? -1 : 1) * ox / 2; a.x += d; b.x -= d; const t = a.vx; a.vx = b.vx; b.vx = t; }
          else { const d = (a.y < b.y ? -1 : 1) * oy / 2; a.y += d; b.y -= d; const t = a.vy; a.vy = b.vy; b.vy = t; }
        }
        for (const b of words) {
          const dx = b.x + b.w / 2 - mouse.x, dy = b.y + b.h / 2 - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { const f = (1 - d2 / 9000) * 260 * dt; const d = Math.sqrt(d2) || 1; b.vx += dx / d * f; b.vy += dy / d * f; }
          const sp = Math.hypot(b.vx, b.vy), cap = 90, base = 26; if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; } else if (sp > base) { b.vx *= 0.99; b.vy *= 0.99; }
          if (!reduced) { b.x += b.vx * dt; b.y += b.vy * dt; }
          const L = S.x + 8, R = S.x + S.w - 8 - b.w, T = S.y + 8, B = S.y + S.h - 8 - b.h;
          if (b.x < L) { b.x = L; b.vx = Math.abs(b.vx); hits.push({ x: S.x, y: b.y + b.h / 2, t: now }); }
          if (b.x > R) { b.x = R; b.vx = -Math.abs(b.vx); hits.push({ x: S.x + S.w, y: b.y + b.h / 2, t: now }); }
          if (b.y < T) { b.y = T; b.vy = Math.abs(b.vy); hits.push({ x: b.x + b.w / 2, y: S.y, t: now }); }
          if (b.y > B) { b.y = B; b.vy = -Math.abs(b.vy); hits.push({ x: b.x + b.w / 2, y: S.y + S.h, t: now }); }
          ctx.fillStyle = CARD; ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 13); ctx.fill(); ctx.stroke();
          ctx.fillStyle = TXT; ctx.globalAlpha = 0.86; ctx.fillText(b.t, b.x + 10, b.y + 17); ctx.globalAlpha = 1;
        }
        hits = hits.filter((h) => now - h.t < 700);
        for (const h of hits) { const k = (now - h.t) / 700; ctx.save(); ctx.globalAlpha = (1 - k) * 0.8; ctx.strokeStyle = G; ctx.lineWidth = 2; ctx.shadowColor = G; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(h.x, h.y, 4 + k * 22, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // 02 Instant: typing vs talking, the same sentence.
  const race = document.getElementById("race");
  if (race) {
    const S = "Can we move the launch review to Wednesday at 3?", tType = document.getElementById("race-type"), tVoice = document.getElementById("race-voice");
    const cT = document.getElementById("clock-type"), cV = document.getElementById("clock-voice");
    const TALK = 2.6, LAG = 0.3, CPS = 3.4, LOOP = 9.5; let t0 = performance.now();
    tVoice.textContent = S;
    (function tick(now) {
      if (!race.closest(".offscreen")) {
        let t = (now - t0) / 1000; if (t > LOOP) { t0 = now; t = 0; }
        const n = Math.min(S.length, Math.floor(t * CPS)); tType.textContent = S.slice(0, n);
        tType.parentNode.scrollLeft = 1e4;
        cT.textContent = Math.min(t, LOOP).toFixed(1) + "s";
        const done = t >= TALK + LAG; race.classList.toggle("talk", t < TALK); race.classList.toggle("done", done);
        cV.textContent = (done ? TALK + LAG : t).toFixed(1) + "s";
      } else t0 = now - 0;
      requestAnimationFrame(tick);
    })(t0);
  }

  // 03 Yours: scrub through five years of a $12 subscription; TypeVoice stays at $79.
  const scrub = document.getElementById("scrub");
  if (scrub) {
    const M = 60, PER = 12, ONCE = 79, MAX = M * PER, X = (m) => (m - 1) / (M - 1) * 600, Y = (v) => 210 - v / MAX * 196;
    const sub = document.getElementById("sc-sub"), area = document.getElementById("sc-area"), xl = document.getElementById("sc-x");
    scrub.querySelector(".sc-tv").setAttribute("d", `M0 ${Y(ONCE).toFixed(1)}H600`);
    const cross = document.getElementById("sc-cross"), BE = Math.ceil(ONCE / PER);   // the month it has paid for itself
    cross.style.setProperty("--cx", (X(BE) / 600 * 100) + "%"); cross.style.setProperty("--cy", (Y(ONCE) / 220 * 100) + "%");
    const mEl = document.getElementById("sc-m"), vEl = document.getElementById("sc-sub-v");
    let cur = 1, target = 1, hovering = false;
    function draw(m) {
      const k = Math.max(1, Math.min(M, Math.round(m))); let d = `M0 ${Y(PER).toFixed(1)}`;
      for (let i = 2; i <= k; i++) d += `H${X(i).toFixed(1)}V${Y(i * PER).toFixed(1)}`;
      const xe = X(m); d += `H${xe.toFixed(1)}`;
      sub.setAttribute("d", d); area.setAttribute("d", d + `V220H0Z`); xl.setAttribute("x1", xe); xl.setAttribute("x2", xe);
      mEl.textContent = k >= 12 ? `Year ${Math.floor((k - 1) / 12) + 1}, month ${((k - 1) % 12) + 1}` : `Month ${k}`;
      vEl.textContent = "$" + (k * PER).toLocaleString();
      cross.classList.toggle("on", k >= BE);
    }
    const setFrom = (e) => { const r = scrub.getBoundingClientRect(), f = Math.min(1, Math.max(0, (e.clientX - r.left - 30) / (r.width - 60))); target = 1 + f * (M - 1); };
    scrub.addEventListener("pointerenter", () => { hovering = true; }); scrub.addEventListener("pointermove", setFrom);
    scrub.addEventListener("pointerleave", () => { hovering = false; target = M; });
    let started = false;
    new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !started) { started = true; target = M; } }), { threshold: 0.4 }).observe(scrub);
    draw(1);
    (function tick() { const speed = hovering ? 0.2 : 0.035; if (Math.abs(target - cur) > 0.01) { cur = reduced ? target : lerp(cur, target, speed); draw(cur); } requestAnimationFrame(tick); })();
  }
});

