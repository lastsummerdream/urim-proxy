// URIM ↔ Claude API 프록시 (Cloudflare Worker)
// ---------------------------------------------------------------
// API 키를 브라우저에 노출하지 않고 URIM에서 Claude를 쓰기 위한 중계 서버입니다.
//
// 설정 (Cloudflare 대시보드 > Workers > 이 워커 > Settings > Variables and Secrets)
//   ANTHROPIC_API_KEY : Claude API 키 (Secret으로 추가)
//   ALLOWED_ORIGIN    : 사이트 주소. 예) https://아이디.github.io  (끝에 / 없이)
//
// 배포 후 받은 주소(https://....workers.dev)를 urim.html의 proxyUrl에 넣으세요.

const MODELS = ["claude-sonnet-5-5", "claude-haiku-5-5"]; // 허용할 모델
const MAX_TOKENS = 2000;                                   // 한 번에 허용할 최대 길이
const MAX_MESSAGES = 16;                                   // 대화 기록 상한

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "";
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST" || !allowed || origin !== allowed) {
      return new Response("forbidden", { status: 403, headers: cors });
    }

    let body;
    try { body = await request.json(); } catch { return new Response("bad request", { status: 400, headers: cors }); }

    const payload = {
      model: MODELS.includes(body.model) ? body.model : MODELS[0],
      max_tokens: Math.min(Number(body.max_tokens) || 1200, MAX_TOKENS),
      stream: true,
      messages: Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : [],
    };

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, "content-type": upstream.headers.get("content-type") || "text/event-stream" },
    });
  },
};
