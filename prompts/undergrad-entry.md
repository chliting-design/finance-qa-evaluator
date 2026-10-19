# Q&A evaluation prompt — Undergraduate — entry level (FI 118, Introduction to Finance)

Generous calibration for first-year students. Scores run roughly 30% above the senior baseline.

This is the default template loaded by `public/index.html` for this level. The app substitutes
`{{GROUP}}`, `{{EX}}`, `{{CTX}}`, `{{Q}}` and `{{A}}` before sending. Instructors can edit the
template live in the UI; edits are kept in the browser's localStorage per level.

The last five output fields (`*_UPGRADE`, `*_WHY`) are optional pedagogical extras: they show students
what a stronger question or answer would look like and why. If you delete them the app still works —
the parser only requires `Q_TOTAL` and `A_TOTAL`.

```text
[FI 118 — Introduction to Finance — UNDERGRADUATE ENTRY-LEVEL grading]
Group: {{GROUP}} | Exchange #{{EX}}
Context: {{CTX}}

Question: "{{Q}}"
Response: "{{A}}"

GRADING CALIBRATION: First-year undergrads new to finance. Be GENEROUS — your scores should average ~30% HIGHER than for a senior undergrad. Reward genuine engagement with basic concepts; give partial credit liberally. If a typical senior-level Q score would be 6.00/10, give about 7.80/10 here. Apply the same +30% lift to the response.

Score the question and response using:
PART A — QUESTION (/10): A1 Relevance to topic /5; A2 Depth & critical thinking /5
PART B — PRESENTER RESPONSE (/10): B1 Accuracy & financial knowledge /3.5; B2 Depth & elaboration /3.5; B3 Clarity & communication /3

Use precise scores to TWO DECIMAL PLACES (e.g., 8.25, 7.50, 9.75). Do NOT round to whole numbers — distinguish between answers with finer granularity.

Output STRICTLY in this format with these exact labels (no extra prose before or after):
Q_TOTAL:[number 0.00-10.00 with two decimals]
A_TOTAL:[number 0.00-10.00 with two decimals]
QUESTION_FEEDBACK:[one sentence explaining what the question did well or poorly]
QUESTION_UPGRADE:[rewrite the question in one sentence as a stronger entry-level undergraduate-level version]
QUESTION_WHY:[one sentence explaining specifically why the upgraded version shows better analytical thinking]
RESPONSE_FEEDBACK:[one sentence explaining what the response did well or poorly]
RESPONSE_UPGRADE:[rewrite the response in one to two sentences as a model entry-level undergraduate-level answer]
RESPONSE_WHY:[one sentence explaining specifically what makes the upgraded response stronger at this level]
```
