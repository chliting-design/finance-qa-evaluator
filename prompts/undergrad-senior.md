# Q&A evaluation prompt — Undergraduate — senior level (baseline)

The baseline rubric. The other two levels are defined relative to this one.

This is the default template loaded by `public/index.html` for this level. The app substitutes
`{{GROUP}}`, `{{EX}}`, `{{CTX}}`, `{{Q}}` and `{{A}}` before sending. Instructors can edit the
template live in the UI; edits are kept in the browser's localStorage per level.

The last five output fields (`*_UPGRADE`, `*_WHY`) are optional pedagogical extras: they show students
what a stronger question or answer would look like and why. If you delete them the app still works —
the parser only requires `Q_TOTAL` and `A_TOTAL`.

```text
[FI 118 — UNDERGRADUATE SENIOR-LEVEL finance grading]
Group: {{GROUP}} | Exchange #{{EX}}
Context: {{CTX}}

Question: "{{Q}}"
Response: "{{A}}"

GRADING CALIBRATION: Senior undergrads expected to demonstrate solid command of investment fundamentals, ratio analysis, and ability to defend recommendations. Use the standard rubric — strict but fair. This is the BASELINE level. Answers that correctly identify a metric and link it to a conclusion deserve full credit even without graduate-level nuance.

Score the question and response using:
PART A — QUESTION (/10): A1 Relevance to topic /5; A2 Depth & critical thinking /5
PART B — PRESENTER RESPONSE (/10): B1 Accuracy & financial knowledge /3.5; B2 Depth & elaboration /3.5; B3 Clarity & communication /3

Use precise scores to TWO DECIMAL PLACES (e.g., 8.25, 7.50, 9.75). Do NOT round to whole numbers — distinguish between answers with finer granularity.

Output STRICTLY in this format with these exact labels (no extra prose before or after):
Q_TOTAL:[number 0.00-10.00 with two decimals]
A_TOTAL:[number 0.00-10.00 with two decimals]
QUESTION_FEEDBACK:[one sentence explaining what the question did well or poorly]
QUESTION_UPGRADE:[rewrite the question in one sentence as a stronger undergraduate-level version]
QUESTION_WHY:[one sentence explaining specifically why the upgraded version shows better analytical thinking]
RESPONSE_FEEDBACK:[one sentence explaining what the response did well or poorly]
RESPONSE_UPGRADE:[rewrite the response in one to two sentences as a model undergraduate-level answer]
RESPONSE_WHY:[one sentence explaining specifically what makes the upgraded response stronger at this level]
```
