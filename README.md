# AI Spring Training

A gamified trainer that teaches an IT and digital staffing sales team how AI
teams are built, so they can run better client and candidate conversations.

Open `index.html` in a browser. There is nothing to install.

## What is in it

- **Training** — ten modules, each a few short lessons ending in a line to say
  on a call, then a five-question quiz:
  AI foundations · platforms and tools · the roles · data foundations ·
  low-code, no-code and automation · agentic AI (agents, harnesses,
  orchestration, MCP) · security and governance · pilot to production ·
  client conversations · candidate conversations.
- **Games** — Scout the Role (match a client's problem to the role), Signal or
  Noise (judge a candidate's claim), a 60-second Speed Round, Flash Cards, and
  four scripted live calls (two client, two candidate).
- **Field Guide** — 28 role scouting reports (forward deployed engineer, AI
  engineer, AI governance, both kinds of AI trainer, data engineer and more),
  who a client needs at each phase of an AI program, a platform map, talk
  tracks with objection replies, and a glossary.
- **Progress** — XP, seven levels from Rookie Ball to Hall of Fame, 13 badges,
  a daily drill, a streak and a final exam (the Tryout).
- **Leaderboard** — a shared board ranking everyone on the team by XP.

## Leaderboard

The Leaderboard tab ranks everyone who has entered a name, by XP. It is the
only part of the app that uses a server: one table, `training_leaderboard`,
in a Supabase project, reached through three database functions. The schema is
in `supabase/leaderboard.sql`, and the project URL and publishable key are the
`BOARD` constant near the top of `src/app.js`.

- Nothing is sent until someone enters a name. After that their name, XP,
  modules mastered, badge count, Tryout score and streak are sent whenever
  they change. Clearing the name or resetting progress removes their row.
- There is no login. Each browser gets a random id that owns its row, so the
  same person on two devices appears twice, and scores are whatever the
  browser reports. It is an honour-system board.
- The table cannot be read or written directly with the publishable key, only
  through the functions, and it is capped at 5,000 rows.
- To clear the board, delete the rows in the Supabase table editor. To move it
  to another project, run `supabase/leaderboard.sql` there and change `BOARD`.

## Things to know

- Lessons, quiz answers and badges are saved in each person's browser
  (`localStorage`); only the leaderboard summary above leaves the device. If
  the leaderboard cannot be reached, training carries on unaffected.
- The content was written from general knowledge and has not been reviewed by
  a practitioner. Vendor and product names date quickly; review `src/content/`
  every few months. The "hard to fill" rating on each role is a directional
  read, not market data.

## Editing

It is plain HTML, CSS and JS with no framework.

```
src/
  shell.html            the page skeleton
  styles.css            all styling, light and dark themes
  app.js                the engine: XP, levels, badges, quizzes, games
  content/modules.js    lessons and quiz questions
  content/roles.js      role scouting reports and the lifecycle map
  content/reference.js  platform map, glossary, talk tracks
  content/games.js      game scenarios and the scripted calls
scripts/build.mjs       concatenates src/ into index.html
supabase/leaderboard.sql the leaderboard's table and functions
```

`index.html` is build output kept in the tree so the repository can be served
as it is. After changing anything under `src/`, rebuild and commit both:

```bash
npm run build     # needs Node 18+, no dependencies
```

## Publishing

To host it on GitHub Pages: Settings → Pages → Deploy from a branch → `main`,
folder `/ (root)`.
