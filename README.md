# Finance Q&A Evaluator

A real-time, AI-assisted "external judge" for classroom Q&A during student finance presentations.
While one group presents, other students ask questions; the instructor captures each question and
the presenters' response (by voice or typing), and the tool returns structured scores and feedback
within seconds. Every exchange is logged and exportable to Excel.

Built for FI 118 (Introduction to Finance) and FI 623 (Investments) at Bentley University.
First classroom pilot: Spring 2026. Developed with Claude ("vibe coding") by Li-Ting Chiu.

> **The AI is an advisor, not the grader.** Every score is shown to the instructor for review and
> can be overridden before it is saved. Final grades are always set by the instructor.

---

## What it does

| Step | Who | What happens |
|------|-----|--------------|
| 1 | Instructor | Picks the presenting group, the course level, and the presentation context (e.g. tickers in play) |
| 2 | Audience student | Asks a question → instructor records or types it |
| 3 | Presenting group | Responds → instructor records or types it |
| 4 | Tool | Sends both to the model with a level-calibrated rubric; returns `Q /10`, `A /10`, one-sentence feedback on each, plus a **stronger version** of the question and a **model response** with an explanation of *why* it is better |
| 5 | Instructor | Adjusts scores if needed → **Save to log** |
| 6 | After class | **Copy for Excel** (tab-separated) or **Download CSV** |

### Rubric (same at every level)

- **Part A — Question (/10):** A1 relevance to topic (/5), A2 depth & critical thinking (/5)
- **Part B — Presenter response (/10):** B1 accuracy & financial knowledge (/3.5), B2 depth & elaboration (/3.5), B3 clarity & communication (/3)

Scores are returned to two decimal places so adjacent answers can be distinguished.

### Three course levels

The rubric is identical; the *calibration* differs. The senior-undergraduate prompt is the baseline;
the other two are defined relative to it.

| Level | Calibration | File |
|-------|-------------|------|
| Undergraduate — entry | Generous, ~30 % above baseline | [`prompts/undergrad-entry.md`](prompts/undergrad-entry.md) |
| Undergraduate — senior | Baseline, strict but fair | [`prompts/undergrad-senior.md`](prompts/undergrad-senior.md) |
| Graduate / MBA — expert | ~20 % below baseline; demands advanced reasoning | [`prompts/graduate-expert.md`](prompts/graduate-expert.md) |

Instructors can edit the prompt template live in the UI ("Show prompt template"); edits are saved
in the browser per level and can be reset to the default.

A separate, pre-class prompt for grading the **slide decks** themselves (100-point rubric) is in
[`prompts/slide-grading.md`](prompts/slide-grading.md).

---

## Architecture

```
Browser (public/index.html)            Netlify Function                 OpenRouter
┌──────────────────────────┐   POST    ┌──────────────────────────┐    ┌───────────────────────┐
│ Web Speech API (voice)   │ ───────▶  │ netlify/functions/       │ ─▶ │ anthropic/            │
│ prompt template + rubric │  {prompt} │   evaluate.js            │    │   claude-haiku-4.5    │
│ parse Q_TOTAL / A_TOTAL  │ ◀───────  │ holds OPENROUTER_API_KEY │ ◀─ │                       │
│ session log (localStorage)│  {text}  │ optional ACCESS_CODE     │    └───────────────────────┘
└──────────────────────────┘           └──────────────────────────┘
```

- **No build step, no framework, no database.** One HTML file plus one 100-line serverless function.
- **The API key never reaches the browser.** It lives in a Netlify environment variable and is read
  only by the function.
- **Optional access code.** Set `ACCESS_CODE` and the page asks for it once; the function rejects
  requests without it, so strangers who find the URL cannot spend your credits.
- **Session log lives in the browser** (`localStorage`). It survives a page refresh but is private
  to that browser; export it after class. Nothing is stored server-side.
- **Model is swappable** via the `MODEL` environment variable (any OpenRouter model id).

### Privacy notes for institutional review

- Only the question text, the response text, the group label, and the context string are sent to
  the model provider. No student names are collected by the tool.
- Voice transcription happens in the browser via the Web Speech API (Chrome/Edge); audio is handled
  by the browser's speech service, not by this application.
- Netlify function logs record request metadata; the prompt body is not logged by this code.
- OpenRouter's data-handling policy applies to the text sent to the model. For institutional
  deployment, an organisation-owned OpenRouter or Anthropic account would replace the personal key.

---

## Deploy your own (about 10 minutes)

### 1. Get an OpenRouter key
Create one at <https://openrouter.ai/keys> and add a few dollars of credit. Claude Haiku 4.5 costs
well under a cent per exchange.

### 2. Deploy to Netlify
1. Fork or clone this repository to your own GitHub account.
2. In Netlify: **Add new site → Import an existing project → GitHub** → pick the repo.
   Build settings are read from `netlify.toml` (publish `public/`, functions `netlify/functions/`).
   Leave the build command empty.
3. **Site configuration → Environment variables** → add:
   - `OPENROUTER_API_KEY` = your key (required)
   - `ACCESS_CODE` = any passphrase you choose (recommended)
   - `MODEL`, `MAX_TOKENS`, `TEMPERATURE` (optional overrides)
4. **Deploy.** Your evaluator is live at `https://<site-name>.netlify.app/`
   (the legacy path `/evaluator` also works).

### 3. Customise for your class
Open `public/index.html` and edit the `CONFIG` block at the top of the `<script>`:

```js
const GROUPS = [
  "1. Group 7 — AAPL, CMI, AMD",
  "2. Group 4 — XOM, JNJ, COST",
  // ...
];
```

Level labels, notes, and default prompts are in the same block.

### Run locally
```bash
npm install -g netlify-cli
cp .env.example .env        # add your key
netlify dev                 # http://localhost:8888
```

---

## Using it in class

1. Open the site in **Chrome or Edge** (needed for voice input) on the projector laptop.
2. Choose the presenting group and course level; type the context (tickers, topic).
3. Press **Record** under *Audience question* while the student asks; press **Stop**. Repeat under
   *Presenter response*. Or type. Edit the transcript if the mic misheard a ticker.
4. **Evaluate this exchange.** Scores and feedback appear in 2–5 seconds.
5. Read the "stronger question" / "model response" aloud if useful for the class.
6. Adjust a score if you disagree, then **Save to log**. The exchange counter advances.
7. After class: **Copy for Excel** or **Download CSV**. Then **Clear** before the next session.

Tips: the `×` on a log row removes a mistaken entry; **Skip** logs the exchange with blank scores;
**Next** discards without logging.

---

## Repository layout

```
public/index.html              the whole app (UI + logic + default prompts)
netlify/functions/evaluate.js  serverless proxy; holds the API key
netlify.toml                   Netlify build/redirect config
prompts/                       the four prompts as standalone Markdown
docs/PRD.md                    original product requirements document
legacy/claude-ai-widget.html   first prototype; runs only inside Claude.ai's widget sandbox
.env.example                   environment variables for local dev
```

## Roadmap

- Instructor uploads the group's slides so the judge grades relevance against actual content
- Per-criterion sub-scores (A1/A2/B1/B2/B3) with cited evidence
- Instructor-uploaded rubric instead of the fixed one
- Server-side session storage so a log can be reopened from another device

## License

MIT — see [LICENSE](LICENSE). If you use this in your own course, a citation or a note would be
appreciated:

> Chiu, L.-T. (2026). *Finance Q&A Evaluator: an AI external judge for classroom presentations.*
> Bentley University. https://github.com/chliting-design/finance-qa-evaluator
