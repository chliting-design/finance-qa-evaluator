// netlify/functions/evaluate.js
//
// Serverless proxy between the classroom page and OpenRouter.
// The OpenRouter API key lives ONLY here, in the OPENROUTER_API_KEY
// environment variable set in the Netlify dashboard. It is never sent
// to the browser.
//
// Request (from public/index.html):
//   POST /.netlify/functions/evaluate
//   { "prompt": "<fully rendered grading prompt>" }
//   Header (optional): X-Access-Code: <shared instructor code>
//
// Response:
//   200 { "text": "<model output>", "model": "...", "usage": {...} }
//   4xx/5xx { "error": "<message>" }

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";
const MAX_PROMPT_CHARS = 20000;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Access-Control-Allow-Methods": "POST" } };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json(500, {
      error:
        "OPENROUTER_API_KEY is not configured. Add it under Site configuration → Environment variables in Netlify, then redeploy.",
    });
  }

  // Optional shared access code so strangers cannot spend your credits
  // by calling this endpoint directly. Leave ACCESS_CODE unset to disable.
  const requiredCode = process.env.ACCESS_CODE;
  if (requiredCode) {
    const supplied =
      event.headers["x-access-code"] || event.headers["X-Access-Code"] || "";
    if (supplied !== requiredCode) {
      return json(401, { error: "Instructor access code required." });
    }
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Request body must be JSON." });
  }

  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  if (!prompt) {
    return json(400, { error: "Missing 'prompt'." });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return json(413, { error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters).` });
  }

  const model = process.env.MODEL || DEFAULT_MODEL;
  const maxTokens = Number(process.env.MAX_TOKENS) || 800;
  const temperature = process.env.TEMPERATURE !== undefined
    ? Number(process.env.TEMPERATURE)
    : 0.2;

  let upstream;
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional attribution headers OpenRouter uses for its leaderboard.
        "HTTP-Referer": process.env.URL || "https://github.com",
        "X-Title": "Finance Q&A Evaluator",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return json(502, { error: `Could not reach OpenRouter: ${err.message}` });
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    return json(502, { error: "OpenRouter returned a non-JSON response." });
  }

  if (!upstream.ok) {
    const msg = (data && data.error && data.error.message) || `Upstream error ${upstream.status}`;
    return json(upstream.status, { error: msg });
  }

  const text =
    (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";

  if (!text) {
    return json(502, { error: "Model returned an empty response." });
  }

  return json(200, { text, model: data.model || model, usage: data.usage || null });
};
