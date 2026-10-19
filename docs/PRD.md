# Product Requirements Document
## Finance Classroom Q&A Evaluator
**Version:** 1.0  
**Author:** Li-Ting Chiu, Bentley University  
**Status:** Ready for Development

> **Implementation note (Oct 2026).** This is the original v1.0 specification written before the
> first build. The shipped version differs in three ways: (1) the model is called through a Netlify
> serverless function and OpenRouter (`anthropic/claude-haiku-4.5`) rather than directly from the
> browser, so no API key is ever exposed client-side; (2) the presenter response is scored /10
> (B1 3.5 + B2 3.5 + B3 3) rather than /15, so the combined score is /20; (3) three course-level
> prompt variants replaced the single prompt in §7.2, and the output gained `*_UPGRADE` / `*_WHY`
> fields. See `README.md` and `prompts/` for the current behaviour.

---

## 1. Overview

### 1.1 Purpose
A real-time classroom web application that helps a finance professor evaluate student Q&A exchanges during group project presentations. The tool captures spoken or typed questions and responses, sends them to an AI model for structured scoring, and logs all results in a session table exportable to Excel.

### 1.2 Problem Statement
During a finance project presentation class with up to 15 groups, the professor needs to:
- Evaluate the quality of questions raised by audience students
- Evaluate the quality of responses given by the presenting group
- Track scores across all exchanges in a single session
- Export results after class for grading

Currently this is done manually, which is slow, inconsistent, and hard to track across 15 groups.

### 1.3 Solution Summary
A single-page web app where the professor can:
1. Select the presenting group
2. Record (via microphone) or type the student question and presenter response
3. Click Evaluate — the AI returns structured scores in the same interface
4. Enter the scores from the AI response into score fields
5. Save to a running session log
6. Export the log as a tab-separated file for Excel/Google Sheets

---

## 2. Users

| User | Description |
|------|-------------|
| Primary | Finance professor running a classroom presentation session |
| Context | Classroom setting, projector likely, Chrome/Edge browser on laptop |
| Technical level | Non-developer; needs zero configuration |

---

## 3. Core Workflow

```
1. Professor opens app in Chrome/Edge
2. Sets presenting group (Group 1–15) and presentation context (stock tickers/topics)
3. For each Q&A exchange:
   a. Records student question via mic OR types it
   b. Records presenter response via mic OR types it
   c. Clicks "Evaluate this exchange"
   d. AI returns structured scores in a results panel within the app
   e. Professor reads scores, they auto-populate or professor enters them
   f. Clicks "Save & Next" → row appended to session log, fields clear
4. After all exchanges, professor clicks "Copy for Excel" → pastes into spreadsheet
```

---

## 4. Functional Requirements

### 4.1 Group & Context Management

| ID | Requirement |
|----|-------------|
| F-01 | Dropdown to select presenting group: Group 1 through Group 15 |
| F-02 | Text input for presentation context (e.g. "AAPL earnings miss, TSLA recall, NVDA AI fundamentals") |
| F-03 | Exchange counter displayed per group (Exchange #1, #2…), resets when group changes |
| F-04 | Context persists across exchanges within the same group session |

### 4.2 Input — Question & Response Panels

| ID | Requirement |
|----|-------------|
| F-05 | Two side-by-side panels: "Audience Question" (Q) and "Presenter Response" (A) |
| F-06 | Each panel has a Record button that activates the browser's Web Speech API (SpeechRecognition) |
| F-07 | Recording is continuous with interim results shown in real time as the speaker talks |
| F-08 | Clicking Record again (or clicking Stop) ends recording and finalises the transcript |
| F-09 | Only one panel can record at a time — starting one stops the other |
| F-10 | Each panel has a manual text area for typing if mic is unavailable |
| F-11 | Each panel has a "Clear" button to reset its content |
| F-12 | Visual feedback: panel border changes colour when recording (red pulse animation) and when filled (accent colour) |
| F-13 | "Evaluate" button is disabled until both panels have content (>3 characters each) |
| F-14 | If Web Speech API is unavailable (non-Chrome/Edge), show a clear message and fall back to typing mode only |

### 4.3 AI Evaluation

| ID | Requirement |
|----|-------------|
| F-15 | Clicking "Evaluate this exchange" sends a structured prompt to the Anthropic Claude API (claude-sonnet-4-20250514) |
| F-16 | The prompt includes: group name, exchange number, context, question text, response text, and the full evaluation rubric |
| F-17 | The AI response is displayed in a structured Results Panel within the app (not just as raw text) |
| F-18 | The Results Panel shows two separate scored sections: Question Score and Response Score |
| F-19 | Each criterion is displayed with its score, a progress bar, and a one-sentence explanation |
| F-20 | Strength and Suggestion feedback are shown for both the questioner and the presenter |
| F-21 | The "Evaluate" button shows a loading state while the API call is in progress |
| F-22 | Errors (network failure, API error) are caught and shown as a dismissible error message |

### 4.4 Evaluation Rubric (AI Prompt Specification)

**PART A — Question Quality (10 points total)**

| Criterion | Max Score | Description |
|-----------|-----------|-------------|
| A1. Relevance to topic | 5 | Does the question engage directly with the stocks, news, or fundamentals presented? Is it specific? Does it show the questioner was paying attention? |
| A2. Depth & critical thinking | 5 | Does it probe an assumption, limitation, or implication? Does it go beyond surface curiosity toward analytical inquiry? Could it spark meaningful financial discussion? |

**PART B — Presenter Response Quality (15 points total)**

| Criterion | Max Score | Description |
|-----------|-----------|-------------|
| B1. Accuracy & financial knowledge | 5 | Is the response factually correct and grounded in data from their slides? Do they demonstrate understanding of the underlying financial concepts? Do they avoid vague or evasive answers? |
| B2. Depth & elaboration | 5 | Do they go beyond restating slide content? Do they address the specific point raised? Do they connect the question to broader market or company context? |
| B3. Clarity & communication | 5 | Is the response well-structured and easy to follow? Do they speak confidently and professionally as analysts? Is it appropriately concise? |

**Combined Score: 25 points total**

**AI Output Format (structured, parseable):**
```
Q_TOTAL:[0-10]
Q1_SCORE:[0-5]
Q1_NOTE:[one sentence]
Q2_SCORE:[0-5]
Q2_NOTE:[one sentence]
Q_STRENGTH:[one sentence]
Q_SUGGESTION:[one sentence]
A_TOTAL:[0-15]
A1_SCORE:[0-5]
A1_NOTE:[one sentence]
A2_SCORE:[0-5]
A2_NOTE:[one sentence]
A3_SCORE:[0-5]
A3_NOTE:[one sentence]
A_STRENGTH:[one sentence]
A_SUGGESTION:[one sentence]
```

### 4.5 Score Entry & Saving

| ID | Requirement |
|----|-------------|
| F-23 | After AI returns scores, the Results Panel shows number input fields for Q score (/10) and A score (/15) |
| F-24 | If AI scores are successfully parsed, auto-populate these fields |
| F-25 | Combined total is calculated automatically (Q + A) and displayed as X/25 |
| F-26 | "Save & Next" button saves the exchange to the session log and resets all input fields |
| F-27 | "Skip" button logs the exchange without scores (shown as "—") and resets fields |
| F-28 | "Next" button (always visible) clears fields without saving, for when evaluation is not needed |

### 4.6 Session Log

| ID | Requirement |
|----|-------------|
| F-29 | Session log appears below the input area after the first exchange is saved |
| F-30 | Log shows columns: Group, Exchange #, Question (truncated to 55 chars), Q Score, A Score, Total, Time |
| F-31 | Most recent exchange appears at the top (reverse chronological) |
| F-32 | Scores are colour-coded: Q scores in purple, A scores in green, Total in amber |
| F-33 | "Copy for Excel" button copies the full log as tab-separated text to clipboard |
| F-34 | Copied format: one header row + one data row per exchange, tab-separated, pasteable directly into Excel or Google Sheets |
| F-35 | "Clear" button clears the log with a confirmation prompt |
| F-36 | Log is session-only (not persisted across page refreshes — this is intentional for classroom use) |

---

## 5. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF-01 | Must work in Chrome and Edge (Web Speech API requirement) |
| NF-02 | No login, no backend, no database — fully client-side single HTML file |
| NF-03 | API key for Anthropic must be configurable (env variable or config object at top of file) |
| NF-04 | App must be usable on a laptop screen at 1280×800 minimum resolution |
| NF-05 | All interactions must feel fast — UI feedback within 100ms of any button click |
| NF-06 | AI evaluation response must appear within 10 seconds under normal network conditions |
| NF-07 | Responsive layout — panels stack vertically on screens narrower than 500px |
| NF-08 | No external dependencies beyond Google Fonts and the Anthropic API |

---

## 6. Visual Design Specification

### 6.1 Colour Palette

| Element | Colour |
|---------|--------|
| App background | `#2d2d44` (medium slate — not too dark) |
| Panel background | `#353550` |
| Input/surface background | `#3a3a55` |
| Border default | `#4e4e6e` |
| Question accent | `#7c73ff` / `#c0bbff` |
| Response accent | `#2dcb8f` |
| Combined score | `#f0a847` (amber) |
| Recording state | `#f05a5a` (red pulse) |
| Success/save | `#059669` (green) |
| Text primary | `#ffffff` / `#eeecf8` |
| Text secondary | `#888888` |
| Text muted | `#666666` |

### 6.2 Typography
- Primary font: `Syne` (Google Fonts) — headings, labels, buttons
- Monospace font: `DM Mono` (Google Fonts) — transcripts, scores, table data

### 6.3 Key UI Components

**Header bar**
- App title + subtitle on left
- Group dropdown + Exchange counter pill on right

**Context input**
- Full-width dark input bar with "Context" label

**Q & A panels (side by side)**
- Labelled badge (Q / A), panel title, Record button in header
- Transcript textarea in body
- Clear link below textarea
- Border changes: default → recording (red pulse) → filled (accent colour)

**Evaluate button**
- Full-width, purple gradient
- Disabled state when fields empty
- Loading state during API call
- Success state (green) for 3 seconds after send

**Results panel (appears after evaluation)**
- Two cards side by side: Question Score | Response Score
- Each card: large score number, criterion rows with score + bar + note, feedback box (Strength / Suggestion)
- Combined total bar spanning full width below both cards

**Score entry fields**
- Appear inside the Results panel after AI scores load
- Small number inputs for Q (/10) and A (/15), auto-populated if AI parsing succeeds
- Combined score calculated live

**Session log**
- Appears after first save
- Dark table with coloured score columns
- "Copy for Excel" and "Clear" buttons in header

---

## 7. API Integration

### 7.1 Anthropic API Call

```javascript
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: EVALUATION_PROMPT
    }]
  })
})
```

### 7.2 Prompt Template

```
You are evaluating a Q&A exchange in a student finance presentation.

Context: {context}

QUESTION by audience student: "{question}"
RESPONSE by presenting group: "{response}"

Reply in EXACTLY this format, one field per line, no extra text or markdown:

Q_TOTAL:[number 0-10]
Q1_SCORE:[number 0-5]
Q1_NOTE:[one sentence]
Q2_SCORE:[number 0-5]
Q2_NOTE:[one sentence]
Q_STRENGTH:[one sentence]
Q_SUGGESTION:[one sentence]
A_TOTAL:[number 0-15]
A1_SCORE:[number 0-5]
A1_NOTE:[one sentence]
A2_SCORE:[number 0-5]
A2_NOTE:[one sentence]
A3_SCORE:[number 0-5]
A3_NOTE:[one sentence]
A_STRENGTH:[one sentence]
A_SUGGESTION:[one sentence]

Rubric:
- Q1 = Relevance to topic (0–5)
- Q2 = Depth & critical thinking (0–5)
- Q_TOTAL = Q1 + Q2
- A1 = Accuracy & financial knowledge (0–5)
- A2 = Depth & elaboration (0–5)
- A3 = Clarity & communication (0–5)
- A_TOTAL = A1 + A2 + A3
```

### 7.3 Response Parsing

Parse each field using regex: `new RegExp(key + ':(.+)')` on the raw response string. Fall back to `0` for scores and `""` for notes if parsing fails. Show a non-blocking warning if parsing partially fails.

---

## 8. State Management

The app has no backend. All state is held in JavaScript variables:

| Variable | Type | Description |
|----------|------|-------------|
| `groupName` | string | Currently selected group |
| `exchangeCount` | number | Auto-incremented per group |
| `contextText` | string | Presentation context |
| `questionText` | string | Current question transcript |
| `responseText` | string | Current response transcript |
| `pendingExchange` | object | Exchange being evaluated (group, ex#, question snippet, timestamp) |
| `sessionLog` | array | All saved exchanges with scores |
| `isRecording` | {q, a} | Which panel is currently recording |
| `isEvaluating` | boolean | Whether API call is in progress |

---

## 9. Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Web Speech API not available | Show banner: "Voice recording requires Chrome or Edge. Please type directly." — Record buttons hidden or disabled |
| Microphone permission denied | Show alert: "Microphone access was denied. Please type directly." |
| API call fails (network) | Show dismissible error banner: "Network error — please check your connection and try again." |
| API returns error response | Show dismissible error banner with API error message |
| AI response does not parse | Show partial results where available; flag unparsed fields with "—"; show warning: "Some scores could not be parsed — please enter manually." |
| Both fields empty on Evaluate | Button remains disabled (prevented at UI level) |

---

## 10. File Structure

Since this is a single-file app:

```
finance_qa_evaluator.html
  ├── <head>         — Google Fonts import, meta tags
  ├── <style>        — All CSS (no external stylesheet)
  ├── <body>         — All HTML markup
  └── <script>       — All JavaScript logic
        ├── CONFIG   — API key, model name, max_tokens
        ├── STATE    — All state variables
        ├── SPEECH   — SpeechRecognition setup and handlers
        ├── UI       — DOM manipulation helpers
        ├── API      — fetch() call and response parsing
        ├── LOG      — Session log rendering and export
        └── EVENTS   — Button click handlers
```

---

## 11. Out of Scope (v1.0)

- User authentication or multi-user support
- Persistent storage across sessions (intentional — resets each class)
- Automatic audio transcription via server-side API (Whisper etc.)
- Grading slides (separate workflow — handled via separate Claude prompt)
- Mobile support (designed for laptop/desktop classroom use)
- Printing or PDF export of the session log

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Time from exchange end to scores displayed | < 10 seconds |
| Button clicks to complete one full exchange | ≤ 5 |
| Exchanges loggable per class session | Up to 15 groups × ~5 exchanges = 75 |
| Export format compatibility | Paste directly into Excel/Google Sheets with no reformatting |

---

## 13. Sample Data

**Context:** AAPL earnings miss + price drop, TSLA recall news, NVDA AI chip fundamentals

**Question:** "Based on the fundamentals you covered, which stock has the most attractive valuation relative to its growth rate?"

**Response:** "We think NVDA offers the best risk-adjusted return — its forward P/E of 35x is justified by a 3-year revenue CAGR of over 50%, driven by sustained AI infrastructure demand that we don't see slowing in the near term."

**Expected scores:** Q: 8/10 · A: 13/15 · Total: 21/25
