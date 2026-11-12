/* AI Spring Training — the engine. Content lives in content/*.js, which the
   build concatenates ahead of this file into one script.

   Progress is kept in localStorage: it is one person's training record on one
   browser. Every read and write is guarded so the app still runs where storage
   is blocked; progress then lasts for the visit only. */

const KEY = "ai-spring-training-v1";
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => dayStr(new Date());
const roleById = (id) => ROLES.find((r) => r.id === id);
const modById = (id) => MODULES.find((m) => m.id === id);

const LEVELS = [
  [0, "Rookie Ball"], [150, "Single-A"], [400, "Double-A"], [750, "Triple-A"],
  [1200, "The Show"], [1800, "All-Star"], [2600, "Hall of Fame"],
];
const PASS = 4; // of 5: a module is mastered at 80%
const TRYOUT_SIZE = 20;
const TRYOUT_PASS = 16;

const BADGES = [
  { id: "first", mark: "1st", name: "First Pitch", desc: "Finish your first lesson", test: (s) => Object.keys(s.lessons).length >= 1 },
  { id: "onbase", mark: "OB", name: "On Base", desc: "Master a module quiz", test: () => mastered() >= 1 },
  { id: "cycle", mark: "4x", name: "The Cycle", desc: "Master four modules", test: () => mastered() >= 4 },
  { id: "fivetool", mark: "5T", name: "Five-Tool Player", desc: "Master all ten modules", test: () => mastered() >= MODULES.length },
  { id: "perfect", mark: "PG", name: "Perfect Game", desc: "Score 5 of 5 on a module quiz", test: (s) => Object.values(s.quiz).some((v) => v >= 5) },
  { id: "scout", mark: "SC", name: "Head Scout", desc: "7 of 8 in Scout the Role", test: (s) => (s.best.scout || 0) >= 7 },
  { id: "eye", mark: "GE", name: "Good Eye", desc: "7 of 8 in Signal or Noise", test: (s) => (s.best.claims || 0) >= 7 },
  { id: "closer", mark: "HR", name: "Closer", desc: "Hit a home run on a live call", test: (s) => Object.values(s.calls).some((v) => v >= 0.9) },
  { id: "speed", mark: "60", name: "Speedster", desc: "12 right in a speed round", test: (s) => (s.best.speed || 0) >= 12 },
  { id: "cards", mark: "28", name: "Card Collector", desc: "Open every scouting report", test: (s) => Object.keys(s.seen).length >= ROLES.length },
  { id: "talk", mark: "AZ", name: "Talks the Talk", desc: "Know 40 glossary terms", test: (s) => Object.keys(s.known).length >= 40 },
  { id: "streak", mark: "3D", name: "Hitting Streak", desc: "Train three days in a row", test: (s) => s.streak >= 3 },
  { id: "called", mark: "MLB", name: "Called Up", desc: "Pass the Tryout", test: (s) => !!s.cert },
];

/* — state — */
const blank = () => ({ pid: "", name: "", xp: 0, lessons: {}, quiz: {}, badges: {}, last: "", streak: 0, known: {}, seen: {}, best: {}, calls: {}, daily: "", cert: null });
let S = blank();
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { /* storage blocked: start fresh */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* keep going in memory */ } queueScore(); };

/* — shared leaderboard —
   The one part of the app that talks to a server: a Supabase table reached
   through three functions (see supabase/leaderboard.sql). The key below is the
   project's publishable key, which is meant to ship in a page; the table
   itself is closed to it. A row is tied to a random id kept in this browser,
   and nothing is sent until the player has entered a name. */
const BOARD = { url: "https://mqksikjcudxmoejpmijc.supabase.co", key: "sb_publishable_xV1U1tDghZyEeIZwJ_2uLw_6Hhst6as" };
const boardOn = () => /^https:/.test(BOARD.url) && !!BOARD.key;
const newId = () => (crypto.randomUUID ? crypto.randomUUID()
  : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)));

async function rpc(fn, args) {
  const r = await fetch(`${BOARD.url}/rest/v1/rpc/${fn}`, {
    method: "POST", keepalive: true, body: JSON.stringify(args),
    headers: { apikey: BOARD.key, Authorization: `Bearer ${BOARD.key}`, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`leaderboard ${r.status}`);
  return r.status === 204 ? null : r.json();
}

let scoreTimer = null, scoreSent = "";
/* Send this player's row if it changed. A failure is swallowed: training
   must never stall on the network, and the next change retries. */
function pushScore() {
  clearTimeout(scoreTimer);
  if (!boardOn() || !S.name || !S.pid) return Promise.resolve();
  const row = { p_id: S.pid, p_name: S.name, p_xp: S.xp, p_modules: mastered(), p_badges: Object.keys(S.badges).length, p_tryout: S.cert ? S.cert.score : null, p_streak: S.streak };
  const sig = JSON.stringify(row);
  if (sig === scoreSent) return Promise.resolve();
  return rpc("training_submit", row).then(() => { scoreSent = sig; }, () => {});
}
function queueScore() { clearTimeout(scoreTimer); scoreTimer = setTimeout(pushScore, 1500); }
function leaveBoard(pid) { scoreSent = ""; if (boardOn() && pid) rpc("training_remove", { p_id: pid }).catch(() => {}); }

const levelOf = (xp) => { let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++; return i; };
const mastered = () => MODULES.filter((m) => (S.quiz[m.id] || 0) >= PASS).length;
const lessonsDone = (m) => m.lessons.filter((_, i) => S.lessons[`${m.id}:${i}`]).length;
const totalLessons = MODULES.reduce((n, m) => n + m.lessons.length, 0);

/* Every reward goes through here so the streak, level-ups and badges are
   checked in one place. */
function award(xp, label) {
  const before = levelOf(S.xp);
  const t = today();
  if (S.last !== t) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.last === dayStr(y) ? S.streak + 1 : 1;
    S.last = t;
  }
  S.xp += xp;
  if (xp > 0) toast(`+${xp} XP`, label);
  const after = levelOf(S.xp);
  let party = false;
  if (after > before) { toast(`Promoted to ${LEVELS[after][1]}`, "New level"); party = true; }
  for (const b of BADGES) {
    if (!S.badges[b.id] && b.test(S)) { S.badges[b.id] = t; toast(`Badge: ${b.name}`, b.desc); party = true; }
  }
  if (party) confetti();
  save();
  renderScore();
}

function toast(title, sub) {
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ""}`;
  $("#toasts").append(el);
  setTimeout(() => el.remove(), 3200);
}

function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#confetti");
  const ctx = c.getContext("2d");
  c.hidden = false;
  c.width = innerWidth; c.height = innerHeight;
  const colors = ["#f0b03c", "#8fc0ea", "#74d6a4", "#ffffff", "#2f5f85"];
  const bits = Array.from({ length: 90 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 3,
    s: 4 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)], r: Math.random() * 6,
  }));
  let frame = 0;
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const b of bits) {
      b.vy += 0.35; b.x += b.vx; b.y += b.vy; b.r += 0.2;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
      ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6); ctx.restore();
    }
    if (++frame < 110) requestAnimationFrame(tick); else c.hidden = true;
  })();
}

/* — view state. `ui.view` follows the hash; `ui.sub` is whatever is open
   inside that view (a lesson, a running quiz, a call). — */
const VIEWS = ["home", "train", "games", "leaderboard", "guide", "profile"];
const ui = { view: "home", sub: null, guideTab: "roles", group: "All", q: "", board: { state: "idle", rows: [] } };
let timer = null;

function go(view, sub) {
  clearInterval(timer); timer = null;
  ui.view = view; ui.sub = sub || null;
  if (view === "leaderboard") loadBoard();
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  render();
  scrollTo(0, 0);
}

function renderScore() {
  const li = levelOf(S.xp);
  const lo = LEVELS[li][0];
  const hi = li + 1 < LEVELS.length ? LEVELS[li + 1][0] : null;
  const pct = hi ? Math.round(((S.xp - lo) / (hi - lo)) * 100) : 100;
  $("#score").innerHTML = `
    <span class="lvl">${esc(LEVELS[li][1])}</span>
    <span class="meter" title="${hi ? `${hi - S.xp} XP to ${esc(LEVELS[li + 1][1])}` : "Top level"}"><i style="width:${pct}%"></i></span>
    <span class="xp num">${S.xp} XP</span>
    ${S.streak > 1 ? `<span class="streak num">${S.streak}-day streak</span>` : ""}`;
}

function render() {
  for (const a of document.querySelectorAll("#tabs a")) {
    if (a.getAttribute("href") === `#${ui.view}`) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  }
  renderScore();
  const sub = ui.sub;
  let html;
  if (sub && sub.type === "run") html = viewRun();
  else if (sub && sub.type === "module") html = viewModule(modById(sub.id));
  else if (sub && sub.type === "lesson") html = viewLesson();
  else if (sub && sub.type === "flash") html = viewFlash();
  else if (sub && sub.type === "speed") html = viewSpeed();
  else if (sub && sub.type === "call") html = viewCall();
  else html = { home: viewHome, train: viewTrain, games: viewGames, leaderboard: viewBoard, guide: viewGuide, profile: viewProfile }[ui.view]();
  $("#view").innerHTML = html;
}

/* — Clubhouse — */
function nextUp() {
  for (const m of MODULES) {
    const i = m.lessons.findIndex((_, k) => !S.lessons[`${m.id}:${k}`]);
    if (i >= 0) return { label: `${m.title}: ${m.lessons[i].t}`, kind: "Next lesson", a: "lesson", mod: m.id, i };
  }
  for (const m of MODULES) if ((S.quiz[m.id] || 0) < PASS) return { label: `${m.title} quiz`, kind: "Quiz to master", a: "quiz", mod: m.id };
  if (!S.cert) return { label: "The Tryout", kind: "Final exam", a: "tryout" };
  return { label: "Take a live call", kind: "Keep sharp", a: "tab", to: "games" };
}

function viewHome() {
  const li = levelOf(S.xp);
  const hi = li + 1 < LEVELS.length ? LEVELS[li + 1] : null;
  const pct = hi ? Math.round(((S.xp - LEVELS[li][0]) / (hi[0] - LEVELS[li][0])) * 100) : 100;
  const n = nextUp();
  const doneLessons = Object.keys(S.lessons).length;
  const dailyDone = S.daily === today();
  return `<div class="stack">
    <div class="hero">
      <section class="card welcome stack">
        <div>
          <p class="eyebrow">${esc(LEVELS[li][1])}</p>
          <h1>${S.name ? `Welcome back, ${esc(S.name)}` : "Welcome to camp"}</h1>
        </div>
        <p class="muted">Ten modules, four games, four live calls and a field guide. Learn how AI teams are built so you can run sharper client and candidate calls.</p>
        ${S.name ? "" : `<form class="namebox" data-form="name"><input id="name-in" name="name" maxlength="24" placeholder="Your first name" aria-label="Your first name" autocomplete="given-name" /><button class="btn gold">Start</button></form><p class="muted" style="font-size:.85rem">Your name and score appear on the team leaderboard.</p>`}
        <div>
          <div class="meter"><i style="width:${pct}%"></i></div>
          <p class="muted num" style="margin-top:6px">${hi ? `${hi[0] - S.xp} XP to ${esc(hi[1])}` : "Top of the league"}</p>
        </div>
        <div class="stats">
          <div class="stat"><b class="num">${doneLessons}/${totalLessons}</b><span>lessons</span></div>
          <div class="stat"><b class="num">${mastered()}/${MODULES.length}</b><span>modules mastered</span></div>
          <div class="stat"><b class="num">${Object.keys(S.badges).length}/${BADGES.length}</b><span>badges</span></div>
        </div>
      </section>
      <div class="stack">
        <section class="card stack">
          <div><p class="eyebrow">${esc(n.kind)}</p><h3>${esc(n.label)}</h3></div>
          <div><button class="btn" data-a="${n.a}" data-mod="${n.mod || ""}" data-i="${n.i ?? ""}" data-to="${n.to || ""}">Continue</button></div>
        </section>
        <section class="card stack">
          <div><p class="eyebrow">Daily drill</p><h3>Three questions, 30 bonus XP</h3></div>
          <div class="row">
            <button class="btn ${dailyDone ? "ghost" : "gold"}" data-a="daily">${dailyDone ? "Practice again" : "Take today's drill"}</button>
            ${dailyDone ? `<span class="chip good">Done today</span>` : ""}
          </div>
        </section>
      </div>
    </div>
    <section class="card stack">
      <div class="row spread"><h2>The lineup</h2><a class="btn ghost sm" href="#train">All training</a></div>
      ${lineup()}
    </section>
    <section class="card stack">
      <h2>Badges</h2>
      ${badgeGrid()}
    </section>
  </div>`;
}

function lineup() {
  return `<ol class="lineup">${MODULES.map((m, i) => {
    const d = lessonsDone(m), best = S.quiz[m.id] || 0, ok = best >= PASS;
    const pct = Math.round(((d + (ok ? 1 : 0)) / (m.lessons.length + 1)) * 100);
    return `<li><button data-a="module" data-mod="${m.id}">
      <span class="no num">${i + 1}</span>
      <span><span class="ttl">${esc(m.title)}</span><br><span class="sub">${esc(m.blurb)}</span>
        <div class="bar ${ok ? "done" : ""}"><i style="width:${pct}%"></i></div></span>
      <span>${ok ? `<span class="chip good">Mastered</span>` : `<span class="chip num">${d}/${m.lessons.length}</span>`}</span>
    </button></li>`;
  }).join("")}</ol>`;
}

function badgeGrid() {
  return `<div class="badges">${BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? "on" : ""}">
    <div class="medal">${esc(b.mark)}</div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div>`).join("")}</div>`;
}

/* — Training — */
function viewTrain() {
  return `<div class="stack">
    <div><h1>Training</h1><p class="muted">Read the lessons, then master the quiz with 4 of 5. Each lesson is worth 10 XP and each new correct quiz answer 15.</p></div>
    <section class="card">${lineup()}</section>
    <section class="card stack">
      <div><p class="eyebrow">Final exam</p><h2>The Tryout</h2></div>
      <p class="muted">${TRYOUT_SIZE} questions drawn from every module. Score ${TRYOUT_PASS} or better to get called up.${S.cert ? ` Your best: ${S.cert.score}/${TRYOUT_SIZE}.` : ""}</p>
      <div><button class="btn gold" data-a="tryout">${S.cert ? "Retake the Tryout" : "Start the Tryout"}</button></div>
    </section>
  </div>`;
}

/* What to do next in a module. Every module page and every quiz result leads
   with this one step, so the way in is the same wherever you start. */
function moduleStep(m) {
  const i = m.lessons.findIndex((_, k) => !S.lessons[`${m.id}:${k}`]);
  const read = lessonsDone(m);
  if (i >= 0) return { label: read ? `Continue with lesson ${i + 1}` : "Start lesson 1", note: m.lessons[i].t, a: "lesson", i };
  if ((S.quiz[m.id] || 0) < PASS) return { label: "Take the quiz", note: "All lessons read. Score 4 of 5 to master the module.", a: "quiz" };
  return { label: "Review from lesson 1", note: "Module mastered.", a: "lesson", i: 0 };
}
const stepButton = (m, st, cls = "") => `<button class="btn ${cls}" data-a="${st.a}" data-mod="${m.id}" data-i="${st.i ?? ""}">${esc(st.label)}</button>`;

function viewModule(m) {
  const best = S.quiz[m.id] || 0, st = moduleStep(m), n = MODULES.indexOf(m);
  const after = MODULES[n + 1];
  return `<div class="stack lesson">
    <div><button class="btn ghost sm" data-a="tab" data-to="train">All modules</button></div>
    <div><p class="eyebrow">Module ${n + 1} of ${MODULES.length}</p><h1>${esc(m.title)}</h1><p class="muted">${esc(m.blurb)}</p></div>
    <section class="card row spread">
      <div><p class="eyebrow">${lessonsDone(m)} of ${m.lessons.length} lessons read</p><h3>${esc(st.note)}</h3></div>
      <div class="row">${stepButton(m, st, "gold")}${best >= PASS && after ? `<button class="btn ghost" data-a="module" data-mod="${after.id}">Next module</button>` : ""}</div>
    </section>
    <section class="card">
      <ol class="lesson-list">${m.lessons.map((l, i) => { const done = S.lessons[`${m.id}:${i}`]; return `<li><button data-a="lesson" data-mod="${m.id}" data-i="${i}">
        <span><span class="num muted">${i + 1}.</span> ${esc(l.t)}</span><span class="chip ${done ? "good" : "gold"}">${done ? "Read · review" : "Start · +10 XP"}</span></button></li>`; }).join("")}</ol>
    </section>
    <section class="card row spread">
      <div><h3>Module quiz</h3><p class="muted num">${best ? `Best score ${best}/5` : "Five questions"}${best >= PASS ? " · mastered" : ""}</p></div>
      <button class="btn ${st.a === "quiz" ? "ghost" : ""}" data-a="quiz" data-mod="${m.id}">${best ? "Retake quiz" : "Take the quiz"}</button>
    </section>
  </div>`;
}

function viewLesson() {
  const { id, i } = ui.sub;
  const m = modById(id), l = m.lessons[i], last = i === m.lessons.length - 1;
  return `<article class="stack lesson">
    <div class="row spread">
      <button class="btn ghost sm" data-a="module" data-mod="${m.id}">${esc(m.title)}</button>
      <span class="dots" aria-label="Lesson ${i + 1} of ${m.lessons.length}">${m.lessons.map((_, k) => `<i class="${k <= i ? "on" : ""}"></i>`).join("")}</span>
    </div>
    <section class="card stack">
      <div><p class="eyebrow">Lesson ${i + 1} of ${m.lessons.length}</p><h1>${esc(l.t)}</h1></div>
      <div class="body">${l.body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="say"><p class="eyebrow">Say it on a call</p><p>${esc(l.say)}</p></div>
    </section>
    <div class="row spread">
      ${i > 0 ? `<button class="btn ghost" data-a="lesson" data-mod="${m.id}" data-i="${i - 1}">Back</button>` : "<span></span>"}
      <button class="btn" data-a="lesson-next">${last ? "Finish and take the quiz" : "Next lesson"}</button>
    </div>
  </article>`;
}

/* — The question runner: module quizzes, the daily drill, the Tryout, Scout
   the Role and Signal or Noise all run through it. — */
function startRun(cfg) {
  const items = cfg.items.map((it) => {
    const order = cfg.fixed ? it.a.map((_, k) => k) : shuffle(it.a.map((_, k) => k));
    return { ...it, a: order.map((k) => it.a[k]), c: order.indexOf(it.c) };
  });
  go(cfg.view, { type: "run", cfg, items, i: 0, right: 0, picked: null, done: false });
}

function viewRun() {
  const r = ui.sub, cfg = r.cfg;
  if (r.done) {
    const pct = r.right / r.items.length;
    return `<section class="card stack result">
      <p class="eyebrow">${esc(cfg.title)}</p>
      <div class="big num">${r.right}/${r.items.length}</div>
      <h2>${esc(r.verdict.head)}</h2>
      <p class="muted">${esc(r.verdict.text)}</p>
      ${r.verdict.xp ? `<span class="chip gold num">+${r.verdict.xp} XP</span>` : ""}
      <div class="row" style="justify-content:center">
        ${r.verdict.next || ""}
        <button class="btn ${r.verdict.next ? "ghost" : ""}" data-a="rerun">${pct === 1 ? "Play again" : "Try again"}</button>
        <button class="btn ghost" data-a="tab" data-to="${cfg.view}">Done</button>
      </div>
    </section>`;
  }
  const it = r.items[r.i], picked = r.picked;
  return `<section class="stack run">
    <div class="row spread">
      <span class="eyebrow">${esc(cfg.title)} · <span class="num">${r.i + 1} of ${r.items.length}</span></span>
      <button class="btn ghost sm" data-a="tab" data-to="${cfg.view}">Quit</button>
    </div>
    <div class="bar"><i style="width:${(r.i / r.items.length) * 100}%"></i></div>
    <div>${it.eyebrow ? `<p class="eyebrow">${esc(it.eyebrow)}</p>` : ""}<h2 class="q">${esc(it.q)}</h2></div>
    <div class="opts">${it.a.map((a, k) => `<button class="opt ${picked === null ? "" : k === it.c ? "right" : k === picked ? "wrong" : ""}" data-a="pick" data-i="${k}" ${picked === null ? "" : "disabled"}><kbd>${k + 1}</kbd><span>${esc(a)}</span></button>`).join("")}</div>
    ${picked === null ? "" : `<div class="why ${picked === it.c ? "good" : "bad"}"><b>${picked === it.c ? "Correct" : "Not quite"}</b>${esc(it.why)}</div>
      <div><button class="btn" id="next" data-a="next">${r.i + 1 === r.items.length ? "See result" : "Next"}</button></div>`}
  </section>`;
}

function finishRun() {
  const r = ui.sub;
  r.done = true;
  r.verdict = r.cfg.finish(r.right, r.items.length);
  if (r.verdict.xp || r.verdict.touch) award(r.verdict.xp || 0, r.cfg.title);
  render();
}

function quizModule(id) {
  const m = modById(id);
  startRun({
    view: "train", title: `${m.title} quiz`, items: m.quiz, again: () => quizModule(id),
    finish(right, total) {
      const prev = S.quiz[id] || 0;
      const xp = Math.max(0, right - prev) * 15;
      if (right > prev) S.quiz[id] = right;
      const after = MODULES[MODULES.indexOf(m) + 1];
      // Lead out of the quiz the same way every time: on to the next module
      // (or the Tryout after the last one), or back into this one's lessons.
      const onward = after
        ? `<button class="btn gold" data-a="module" data-mod="${after.id}">Next module: ${esc(after.title)}</button>`
        : `<button class="btn gold" data-a="tryout">Take the Tryout</button>`;
      const back = `<button class="btn gold" data-a="lesson" data-mod="${id}" data-i="0">Review the lessons</button>`;
      return right >= PASS
        ? { xp, touch: true, next: onward, head: right === total ? "Perfect game" : "Module mastered", text: "That is 80 percent or better." }
        : { xp, touch: true, next: back, head: "Not mastered yet", text: `You need ${PASS} of ${total}. Review the lessons and take another swing.` };
    },
  });
}

const allQuestions = () => MODULES.flatMap((m) => m.quiz.map((q) => ({ ...q, eyebrow: m.title })));

function dailyDrill() {
  startRun({
    view: "home", title: "Daily drill", items: shuffle(allQuestions()).slice(0, 3), again: dailyDrill,
    finish(right) {
      const first = S.daily !== today();
      S.daily = today();
      const xp = right * 5 + (first ? 30 : 0);
      return { xp, touch: true, head: first ? "Drill done" : "Extra practice", text: first ? "Bonus banked. Come back tomorrow to keep the streak going." : "Today's bonus was already banked. Practice still counts." };
    },
  });
}

function tryout() {
  const items = shuffle(MODULES.flatMap((m) => shuffle(m.quiz).slice(0, 2).map((q) => ({ ...q, eyebrow: m.title }))));
  startRun({
    view: "train", title: "The Tryout", items, again: tryout,
    finish(right, total) {
      const pass = right >= TRYOUT_PASS;
      const firstPass = pass && !S.cert;
      if (pass && (!S.cert || right > S.cert.score)) S.cert = { score: right, date: today() };
      return pass
        ? { xp: firstPass ? 200 : 20, touch: true, head: "You got the call", text: "You passed the Tryout. Your certificate is on your profile." }
        : { xp: right * 2, touch: true, head: "Sent back down, for now", text: `You need ${TRYOUT_PASS} of ${total}. The module quizzes show where to practice.` };
    },
  });
}

function scoutGame() {
  const items = shuffle(SCOUT).slice(0, 8).map((s) => ({
    eyebrow: "A client tells you", q: `“${s.say}”`, a: s.opts.map((id) => roleById(id).name), c: 0,
    why: `${roleById(s.opts[0]).name}. ${s.why}`,
  }));
  startRun({
    view: "games", title: "Scout the Role", items, again: scoutGame,
    finish(right, total) {
      S.best.scout = Math.max(S.best.scout || 0, right);
      return { xp: right * 10, touch: true, head: right >= 7 ? "Head scout material" : right >= 5 ? "Solid read" : "Keep scouting", text: `You matched ${right} of ${total} client needs to the right role.` };
    },
  });
}

function claimsGame() {
  const items = shuffle(CLAIMS).slice(0, 8).map((c) => ({
    eyebrow: "A candidate says", q: `“${c.t}”`, a: ["Production signal", "Dig deeper"], c: c.real ? 0 : 1, why: c.why,
  }));
  startRun({
    view: "games", title: "Signal or Noise", items, fixed: true, again: claimsGame,
    finish(right, total) {
      S.best.claims = Math.max(S.best.claims || 0, right);
      return { xp: right * 10, touch: true, head: right >= 7 ? "Good eye" : right >= 5 ? "Decent read" : "Listen for specifics", text: `You called ${right} of ${total} correctly. Numbers, users and failures are the signal.` };
    },
  });
}

/* — Games — */
function viewGames() {
  const g = (title, text, action, best, attrs = "") => `<section class="card stack">
    <div><h3>${title}</h3><p class="muted">${text}</p></div>
    <div class="row spread"><button class="btn" data-a="${action}" ${attrs}>Play</button>${best ? `<span class="chip num">${best}</span>` : ""}</div></section>`;
  return `<div class="stack">
    <div><h1>Games</h1><p class="muted">Short rounds that turn the lessons into reflexes. Every right answer earns XP.</p></div>
    <div class="grid g2">
      ${g("Scout the Role", "A client describes a problem. Pick the role that fixes it. Eight per round.", "scout", S.best.scout != null ? `Best ${S.best.scout}/8` : "")}
      ${g("Signal or Noise", "A candidate makes a claim. Is it a production signal, or do you need to dig deeper?", "claims", S.best.claims != null ? `Best ${S.best.claims}/8` : "")}
      ${g("Speed Round", "Sixty seconds. Match as many definitions to their terms as you can.", "speed", S.best.speed != null ? `Best ${S.best.speed}` : "")}
      ${g("Flash Cards", `Flip through the glossary and mark the terms you know.`, "flash", `${Object.keys(S.known).length}/${GLOSSARY.length} known`)}
    </div>
    <div><h2>Live calls</h2><p class="muted">Scripted conversations. Choose what you would say and see how it lands.</p></div>
    <div class="grid g2">
      ${CALLS.map((c) => {
        const b = S.calls[c.id];
        return `<section class="card stack">
          <div><p class="eyebrow">${c.kind} call</p><h3>${esc(c.title)}</h3><p class="muted">${esc(c.who)}</p></div>
          <div class="row spread"><button class="btn" data-a="call" data-id="${c.id}">Take the call</button>${b != null ? `<span class="chip">${esc(rating(b))}</span>` : ""}</div>
        </section>`;
      }).join("")}
    </div>
  </div>`;
}

const rating = (p) => (p >= 0.9 ? "Home run" : p >= 0.75 ? "Triple" : p >= 0.55 ? "Double" : p >= 0.35 ? "Single" : "Strikeout");

function viewCall() {
  const s = ui.sub, c = CALLS.find((x) => x.id === s.id);
  const first = c.who.split(",")[0];
  const log = s.log.map((m) => m.who === "them"
    ? `<div class="msg them"><div class="who">${esc(first)}</div>${esc(m.text)}</div>`
    : `<div class="msg you"><div class="who">You</div>${esc(m.text)}</div><div class="fb p${m.pts}">${esc(m.fb)}</div>`).join("");
  const done = s.i >= c.turns.length;
  const max = c.turns.length * 3;
  return `<section class="stack run">
    <div class="row spread"><span class="eyebrow">${c.kind} call · ${esc(c.title)}</span><button class="btn ghost sm" data-a="tab" data-to="games">Hang up</button></div>
    <div><h2>${esc(c.who)}</h2><p class="muted">${esc(c.setup)}</p></div>
    <div class="chat">${log}</div>
    ${done ? `<section class="card stack result">
        <div class="big">${esc(rating(s.pts / max))}</div>
        <p class="muted num">${s.pts} of ${max} points</p>
        ${s.xp ? `<span class="chip gold num">+${s.xp} XP</span>` : ""}
        <div class="row" style="justify-content:center"><button class="btn" data-a="call" data-id="${c.id}">Replay</button><button class="btn ghost" data-a="tab" data-to="games">Done</button></div>
      </section>`
      : `<div class="stack"><p class="eyebrow">Your reply</p><div class="opts">${s.opts.map((o, k) => `<button class="opt" data-a="say" data-i="${k}"><kbd>${k + 1}</kbd><span>${esc(o.t)}</span></button>`).join("")}</div></div>`}
  </section>`;
}

function startCall(id) {
  const c = CALLS.find((x) => x.id === id);
  go("games", { type: "call", id, i: 0, pts: 0, xp: 0, log: [{ who: "them", text: c.turns[0].line }], opts: shuffle(c.turns[0].opts) });
}

function sayLine(k) {
  const s = ui.sub, c = CALLS.find((x) => x.id === s.id), o = s.opts[k];
  s.log.push({ who: "you", text: o.t, fb: o.fb, pts: o.pts });
  s.pts += o.pts; s.i++;
  if (s.i < c.turns.length) {
    s.log.push({ who: "them", text: c.turns[s.i].line });
    s.opts = shuffle(c.turns[s.i].opts);
  } else {
    const p = s.pts / (c.turns.length * 3);
    S.calls[c.id] = Math.max(S.calls[c.id] || 0, p);
    s.xp = s.pts * 5;
    award(s.xp, c.title);
  }
  render();
  const end = $(".chat").lastElementChild;
  if (end) end.scrollIntoView({ block: "center", behavior: "smooth" });
}

/* Speed round: definition up, four terms, sixty seconds. */
function startSpeed() {
  go("games", { type: "speed", left: 60, score: 0, miss: 0, card: speedCard(), over: false });
  timer = setInterval(() => {
    const s = ui.sub;
    if (!s || s.type !== "speed") { clearInterval(timer); return; }
    s.left--;
    if (s.left <= 0) {
      clearInterval(timer); timer = null;
      s.over = true;
      S.best.speed = Math.max(S.best.speed || 0, s.score);
      s.xp = s.score * 5;
      award(s.xp, "Speed Round");
      render();
    } else {
      const t = $("#clock");
      if (t) { t.textContent = `0:${String(s.left).padStart(2, "0")}`; t.classList.toggle("low", s.left <= 10); }
    }
  }, 1000);
}
function speedCard() {
  const picks = shuffle(GLOSSARY).slice(0, 4);
  return { def: picks[0][1], term: picks[0][0], opts: shuffle(picks.map((p) => p[0])) };
}
function viewSpeed() {
  const s = ui.sub;
  if (s.over) return `<section class="card stack result">
    <p class="eyebrow">Speed Round</p><div class="big num">${s.score}</div>
    <h2>${s.score >= 12 ? "Lightning quick" : s.score >= 7 ? "Good pace" : "Warming up"}</h2>
    <p class="muted num">${s.score} right, ${s.miss} missed. Best: ${S.best.speed}.</p>
    ${s.xp ? `<span class="chip gold num">+${s.xp} XP</span>` : ""}
    <div class="row" style="justify-content:center"><button class="btn" data-a="speed">Play again</button><button class="btn ghost" data-a="tab" data-to="games">Done</button></div>
  </section>`;
  return `<section class="stack run">
    <div class="row spread"><span class="eyebrow">Speed Round · <span class="num">${s.score} right</span></span>
      <span class="timer num ${s.left <= 10 ? "low" : ""}" id="clock">${s.left === 60 ? "1:00" : `0:${String(s.left).padStart(2, "0")}`}</span></div>
    <div><p class="eyebrow">Which term is this?</p><h2 class="q">${esc(s.card.def)}</h2></div>
    <div class="opts">${s.card.opts.map((o, k) => `<button class="opt" data-a="speed-pick" data-t="${esc(o)}"><kbd>${k + 1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>
    <div><button class="btn ghost sm" data-a="tab" data-to="games">Quit</button></div>
  </section>`;
}

/* Flash cards: unknown terms first. */
function startFlash() {
  const deck = shuffle(GLOSSARY.filter((g) => !S.known[g[0]])).concat(shuffle(GLOSSARY.filter((g) => S.known[g[0]])));
  go("games", { type: "flash", deck, i: 0, flipped: false });
}
function viewFlash() {
  const s = ui.sub, [term, def] = s.deck[s.i];
  const known = Object.keys(S.known).length;
  return `<section class="stack run">
    <div class="row spread"><span class="eyebrow">Flash Cards · <span class="num">${known} of ${GLOSSARY.length} known</span></span><button class="btn ghost sm" data-a="tab" data-to="games">Done</button></div>
    <div class="bar done"><i style="width:${(known / GLOSSARY.length) * 100}%"></i></div>
    <button class="flash" data-a="flip" aria-label="Flip card">
      ${s.flipped ? `<div class="stack"><p class="eyebrow">${esc(term)}</p><p class="def">${esc(def)}</p></div>` : `<div><div class="term">${esc(term)}</div><p class="muted">Tap to see the definition</p></div>`}
    </button>
    <div class="row" style="justify-content:center">
      <button class="btn ghost" data-a="flash-next" data-k="0">Still learning</button>
      <button class="btn" data-a="flash-next" data-k="1">Know it${S.known[term] ? "" : " · +2 XP"}</button>
    </div>
  </section>`;
}

/* — Field Guide — */
const GUIDE_TABS = [["roles", "Scouting reports"], ["lifecycle", "Who you need when"], ["platforms", "Platform map"], ["talk", "Talk tracks"], ["glossary", "Glossary"]];

function viewGuide() {
  return `<div class="stack">
    <div><h1>Field Guide</h1><p class="muted">Reference for the desk. Open it before a call.</p></div>
    <div class="subtabs" role="tablist">${GUIDE_TABS.map(([id, label]) => `<button class="chip" role="tab" aria-pressed="${ui.guideTab === id}" data-a="guide-tab" data-id="${id}">${esc(label)}</button>`).join("")}</div>
    ${["roles", "platforms", "glossary"].includes(ui.guideTab) ? `<input class="search" id="guide-q" type="search" placeholder="Search ${ui.guideTab === "roles" ? "roles and skills" : ui.guideTab}" aria-label="Search" value="${esc(ui.q)}" />` : ""}
    <div id="guide-body" class="stack">${guideBody()}</div>
  </div>`;
}

const pips = (n) => `<span class="pips" aria-label="${n} of 5">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? "on" : ""}"></i>`).join("")}</span>`;
const roleChip = (id) => { const r = roleById(id); return `<button class="chip" data-a="role" data-id="${id}">${esc(r.name)}</button>`; };

function guideBody() {
  const q = ui.q.trim().toLowerCase();
  const hit = (...parts) => !q || parts.join(" ").toLowerCase().includes(q);
  if (ui.guideTab === "roles") {
    const list = ROLES.filter((r) => (ui.group === "All" || r.group === ui.group) && hit(r.name, r.aka, r.what, r.skills.join(" ")));
    return `<div class="row">${["All", ...ROLE_GROUPS].map((g) => `<button class="chip" aria-pressed="${ui.group === g}" data-a="group" data-id="${esc(g)}">${esc(g)}</button>`).join("")}
        <span class="muted num" style="margin-left:auto">${Object.keys(S.seen).length}/${ROLES.length} opened</span></div>
      ${list.length ? `<div class="grid g3">${list.map((r) => `<button class="card rolecard" data-a="role" data-id="${r.id}">
        <span class="row spread"><span class="eyebrow">${esc(r.group)}</span>${S.seen[r.id] ? `<span class="seen">Opened</span>` : ""}</span>
        <h3>${esc(r.name)}</h3><p>${esc(r.what)}</p>
        <span class="muted" style="font-size:.85rem">Hard to fill ${pips(r.scarcity)}</span></button>`).join("")}</div>` : `<p class="muted">No roles match that search.</p>`}`;
  }
  if (ui.guideTab === "lifecycle") {
    return `<section class="card"><p class="muted">The seven phases of an AI program and the roles a client is short of in each. Ask which phase they are in.</p>
      ${LIFECYCLE.map((p, i) => `<div class="phase"><div><p class="eyebrow">Phase ${i + 1}</p><h3>${esc(p.phase)}</h3><p class="muted">${esc(p.goal)}</p></div>
      <div class="row">${p.roles.map(roleChip).join("")}</div></div>`).join("")}</section>`;
  }
  if (ui.guideTab === "platforms") {
    const cats = PLATFORMS.map((c) => ({ ...c, items: c.items.filter((it) => hit(it[0], it[1], c.cat)) })).filter((c) => c.items.length);
    return cats.length ? cats.map((c) => `<section class="card stack"><h3>${esc(c.cat)}</h3><div class="scroll-x"><table class="ref">
      ${c.items.map(([n, d, role]) => `<tr><th scope="row">${esc(n)}</th><td>${esc(d)}<div style="margin-top:6px">Often means ${roleChip(role)}</div></td></tr>`).join("")}</table></div></section>`).join("")
      : `<p class="muted">No platforms match that search.</p>`;
  }
  if (ui.guideTab === "glossary") {
    const list = GLOSSARY.filter(([t, d]) => hit(t, d)).sort((a, b) => a[0].localeCompare(b[0]));
    return list.length ? `<section class="card"><div class="scroll-x"><table class="ref">${list.map(([t, d]) => `<tr><th scope="row">${esc(t)}</th><td>${esc(d)}</td></tr>`).join("")}</table></div></section>`
      : `<p class="muted">No terms match that search.</p>`;
  }
  const T = TALK_TRACKS;
  const qa = (rows, they) => `<div class="qa">${rows.map(([a, b]) => `<div><p class="${they ? "they" : "eyebrow"}">${they ? `“${esc(a)}”` : esc(a)}</p><p>${esc(b)}</p></div>`).join("")}</div>`;
  return `<section class="card stack"><h3>Client discovery questions</h3>${qa(T.discovery)}</section>
    <section class="card stack"><h3>Objections and replies</h3>${qa(T.objections, true)}</section>
    <section class="card stack"><h3>Candidate screening questions</h3>${qa(T.candidate)}</section>`;
}

function openRole(id) {
  const r = roleById(id);
  const fresh = !S.seen[id];
  S.seen[id] = 1;
  const d = $("#dlg");
  d.innerHTML = `<div class="in">
    <div class="row spread"><span class="eyebrow">Scouting report · ${esc(r.group)}</span><button class="btn ghost sm" data-a="close">Close</button></div>
    <div><h2 id="dlg-title">${esc(r.name)}</h2><p class="muted">Also called: ${esc(r.aka)}</p></div>
    <p>${esc(r.what)}</p>
    <div><h4>The client needs one when</h4><p>${esc(r.need)}</p></div>
    <div><h4>Listen for</h4><div class="row">${r.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>
    <div><h4>Screening questions</h4><ul>${r.screen.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>
    <div><h4>Often confused with</h4><p>${esc(r.confuse)}</p></div>
    <p class="muted" style="font-size:.9rem">Hard to fill ${pips(r.scarcity)} <span>(a directional read, not market data)</span></p>
  </div>`;
  if (!d.open) d.showModal();
  if (fresh) award(3, `Scouting report: ${r.name}`); else save();
  if (ui.view === "guide" && !ui.sub && ui.guideTab === "roles") $("#guide-body").innerHTML = guideBody();
}

/* — Leaderboard — */
function loadBoard() {
  if (!boardOn()) return;
  const b = ui.board;
  b.state = "loading";
  const mine = (b.req = {}); // a later request supersedes this one
  pushScore()
    .then(() => rpc("training_board", { p_id: S.pid || null }))
    .then((rows) => { if (b.req === mine) { b.rows = rows || []; b.state = "ok"; } },
          () => { if (b.req === mine) b.state = "error"; })
    .then(() => { if (ui.view === "leaderboard" && !ui.sub) render(); });
}

function viewBoard() {
  const b = ui.board;
  const join = S.name ? "" : `<section class="card stack">
      <div><h3>Add your name to join</h3><p class="muted">Your name, XP and badge count will be visible to everyone on the board.</p></div>
      <form class="namebox" data-form="name"><input id="name-board" name="name" maxlength="24" placeholder="Your first name" aria-label="Your first name" autocomplete="given-name" /><button class="btn gold">Join the board</button></form>
    </section>`;
  let body;
  if (!boardOn()) body = `<section class="card"><p class="muted">The leaderboard is not connected in this copy of the app.</p></section>`;
  else if (b.state === "error") body = `<section class="card stack"><p>The leaderboard could not be reached. Your progress is still saved on this device.</p><div><button class="btn" data-a="board-refresh">Try again</button></div></section>`;
  else if (b.state !== "ok") body = `<section class="card"><p class="muted">Loading the standings…</p></section>`;
  else if (!b.rows.length) body = `<section class="card"><p class="muted">Nobody is on the board yet. Enter your name and finish a lesson to be first.</p></section>`;
  else {
    const me = b.rows.find((r) => r.me);
    const top = b.rows.slice(0, 3), rest = b.rows.slice(3), lead = Math.max(1, b.rows[0].xp);
    // The next person up the board, and how far ahead they are.
    const ahead = me ? b.rows[b.rows.indexOf(me) - 1] : null;
    const chase = !me ? "" : me.rank === 1 ? "You are in first place."
      : `You are ranked ${me.rank} of ${me.total}.${ahead ? ` ${ahead.xp - me.xp + 1} XP to pass ${ahead.name}.` : ""}`;
    const place = ["First place", "Second place", "Third place"];
    const spot = (r, i) => `<div class="spot p${i + 1} ${r.me ? "me" : ""}">
        <div class="medal-xl num">${i + 1}</div>
        <p class="eyebrow">${place[i]}${r.me ? " · you" : ""}</p>
        <h2>${esc(r.name)}</h2>
        <div class="pxp num">${r.xp}<span>XP</span></div>
        <p class="sub num">${esc(LEVELS[levelOf(r.xp)][1])} · ${r.modules}/${MODULES.length} modules · ${r.badges} badges</p>
      </div>`;
    const open = (i) => `<div class="spot p${i + 1} open"><div class="medal-xl num">${i + 1}</div><p class="eyebrow">${place[i]}</p><h2>Open</h2><p class="sub">Up for grabs</p></div>`;
    body = `<section class="podium">${[0, 1, 2].map((i) => (top[i] ? spot(top[i], i) : open(i))).join("")}</section>
      ${chase ? `<p class="chase num">${esc(chase)}</p>` : ""}
      ${rest.length ? `<section class="card"><div class="scroll-x"><table class="board">
        <thead><tr><th class="r">#</th><th>Player</th><th>Level</th><th>XP</th><th class="r">Modules</th><th class="r">Badges</th><th class="r">Tryout</th></tr></thead>
        <tbody>${rest.map((r) => `<tr class="${r.me ? "me" : ""}">
          <td class="r num rank">${r.rank}</td>
          <td class="who">${esc(r.name)}${r.me ? ` <span class="chip gold">You</span>` : ""}</td>
          <td>${esc(LEVELS[levelOf(r.xp)][1])}</td>
          <td class="xpcell num"><b>${r.xp}</b><span class="bar"><i style="width:${Math.round((r.xp / lead) * 100)}%"></i></span></td>
          <td class="r num">${r.modules}/${MODULES.length}</td>
          <td class="r num">${r.badges}/${BADGES.length}</td>
          <td class="r num">${r.tryout == null ? "—" : `${r.tryout}/${TRYOUT_SIZE}`}</td></tr>`).join("")}</tbody>
      </table></div></section>` : ""}`;
  }
  return `<div class="stack">
    <div class="row spread"><div><h1>Leaderboard</h1><p class="muted">Everyone in camp, ranked by XP.</p></div>
      ${boardOn() ? `<button class="btn ghost sm" data-a="board-refresh">Refresh</button>` : ""}</div>
    ${join}${body}
  </div>`;
}

/* — Profile — */
function viewProfile() {
  const li = levelOf(S.xp);
  return `<div class="stack">
    <h1>Profile</h1>
    <div class="grid g2">
      <section class="card stack">
        <div><p class="eyebrow">Player</p><h2>${esc(S.name || "Unnamed rookie")}</h2><p class="muted num">${esc(LEVELS[li][1])} · ${S.xp} XP · ${S.streak || 0}-day streak</p></div>
        <form class="namebox" data-form="name"><input id="name-edit" name="name" maxlength="24" value="${esc(S.name)}" placeholder="Your first name" aria-label="Your first name" /><button class="btn ghost">Save name</button></form>
      </section>
      <section class="card stack">
        <div><p class="eyebrow">Certificate</p><h2>${S.cert ? "Called up" : "Not yet earned"}</h2></div>
        ${S.cert ? `<p>${esc(S.name || "This player")} passed the AI Spring Training Tryout with <b class="num">${S.cert.score}/${TRYOUT_SIZE}</b> on ${esc(S.cert.date)}.</p>`
          : `<p class="muted">Pass the Tryout with ${TRYOUT_PASS} of ${TRYOUT_SIZE} to earn it.</p><div><button class="btn gold" data-a="tryout">Start the Tryout</button></div>`}
      </section>
    </div>
    <section class="card stack"><h2>Levels</h2>
      <div class="row">${LEVELS.map(([xp, name], i) => `<span class="chip ${i <= li ? "gold" : ""} num">${esc(name)} · ${xp}</span>`).join("")}</div>
    </section>
    <section class="card stack"><h2>Badges</h2>${badgeGrid()}</section>
    <section class="card stack">
      <div><h3>Start over</h3><p class="muted">Progress is saved in this browser. Resetting clears XP, badges and scores, and takes you off the leaderboard.</p></div>
      <div class="row">${ui.confirmReset ? `<button class="btn danger" data-a="reset-yes">Yes, erase my progress</button><button class="btn ghost" data-a="reset-no">Keep it</button>`
        : `<button class="btn ghost" data-a="reset">Reset progress</button>`}</div>
    </section>
  </div>`;
}

/* — actions — */
const actions = {
  tab: (d) => go(d.to),
  module: (d) => go("train", { type: "module", id: d.mod }),
  lesson: (d) => go("train", { type: "lesson", id: d.mod, i: +d.i }),
  "lesson-next"() {
    const { id, i } = ui.sub, m = modById(id), k = `${id}:${i}`;
    if (!S.lessons[k]) { S.lessons[k] = 1; award(10, m.lessons[i].t); }
    if (i + 1 < m.lessons.length) go("train", { type: "lesson", id, i: i + 1 }); else quizModule(id);
  },
  quiz: (d) => quizModule(d.mod),
  daily: dailyDrill, tryout, scout: scoutGame, claims: claimsGame, speed: startSpeed, flash: startFlash,
  rerun: () => ui.sub.cfg.again(),
  pick(d) {
    const r = ui.sub;
    if (r.picked !== null) return;
    r.picked = +d.i;
    if (r.picked === r.items[r.i].c) r.right++;
    render();
    $("#next").focus();
  },
  next() {
    const r = ui.sub;
    if (r.i + 1 >= r.items.length) return finishRun();
    r.i++; r.picked = null; render();
  },
  call: (d) => startCall(d.id),
  say: (d) => sayLine(+d.i),
  "speed-pick"(d) {
    const s = ui.sub;
    if (d.t === s.card.term) s.score++; else s.miss++;
    s.card = speedCard(); render();
  },
  flip() { ui.sub.flipped = !ui.sub.flipped; render(); },
  "flash-next"(d) {
    const s = ui.sub, term = s.deck[s.i][0];
    if (d.k === "1" && !S.known[term]) { S.known[term] = 1; award(2, term); }
    if (d.k === "0" && S.known[term]) { delete S.known[term]; save(); }
    s.i = (s.i + 1) % s.deck.length; s.flipped = false; render();
  },
  "guide-tab"(d) { ui.guideTab = d.id; ui.q = ""; render(); },
  group(d) { ui.group = d.id; $("#guide-body").innerHTML = guideBody(); },
  role: (d) => openRole(d.id),
  close: () => $("#dlg").close(),
  reset() { ui.confirmReset = true; render(); },
  "reset-no"() { ui.confirmReset = false; render(); },
  "board-refresh": () => { loadBoard(); render(); },
  "reset-yes"() { leaveBoard(S.pid); S = blank(); S.pid = newId(); save(); ui.confirmReset = false; toast("Progress erased"); go("home"); },
};

document.addEventListener("click", (e) => {
  // A tab pointing at the hash already in the address bar fires no
  // hashchange, so leaving a game for its own section needs handling here.
  const tab = e.target.closest('a[href^="#"]');
  if (tab && VIEWS.includes(tab.hash.slice(1))) { e.preventDefault(); return go(tab.hash.slice(1)); }
  const el = e.target.closest("[data-a]");
  if (el && actions[el.dataset.a]) actions[el.dataset.a](el.dataset);
  else if (e.target === $("#dlg")) $("#dlg").close(); // click on the backdrop
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.dataset.form !== "name") return;
  S.name = new FormData(e.target).get("name").trim();
  if (!S.name) leaveBoard(S.pid);
  save(); toast(S.name ? `Welcome, ${S.name}` : "Name cleared");
  if (ui.view === "leaderboard") loadBoard();
  render();
});
document.addEventListener("input", (e) => {
  if (e.target.id !== "guide-q") return;
  ui.q = e.target.value;
  $("#guide-body").innerHTML = guideBody();
});
/* Number keys answer, Enter moves on. */
document.addEventListener("keydown", (e) => {
  if (e.target.matches("input") || $("#dlg").open || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^[1-4]$/.test(e.key)) {
    const b = document.querySelectorAll("#view .opt:not(:disabled)")[+e.key - 1];
    if (b) { e.preventDefault(); b.click(); }
  }
});
addEventListener("hashchange", () => {
  const v = location.hash.slice(1);
  if (VIEWS.includes(v) && (v !== ui.view || ui.sub)) go(v);
});

if (!S.pid) { S.pid = newId(); save(); }
// Catch the last few points if the tab is closed before the timer fires.
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") pushScore(); });

const startView = location.hash.slice(1);
ui.view = VIEWS.includes(startView) ? startView : "home";
if (ui.view === "leaderboard") loadBoard();
render();
