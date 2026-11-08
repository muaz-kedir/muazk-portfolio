import { z } from "zod";
import {
  getPublishedExperience,
  getPublishedProjects,
  getPublishedServices,
  getPublishedSkills,
  getProfile,
  getSettings,
} from "@/lib/queries";
import {
  getPortfolioQuickAnswer,
  type PortfolioAssistantData,
} from "@/lib/portfolio-assistant";
import { envInt, getClientIp, rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 20_000;
const MAX_MESSAGES = 12;
const messagesSchema = z
  .array(
    z
      .object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1200),
      })
      .strict()
  )
  .min(1)
  .max(MAX_MESSAGES);

const requestSchema = z.object({ messages: messagesSchema }).strict();

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...Object.fromEntries(new Headers(headers)) },
  });
}

async function readLimitedBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { error: "too_large" as const };
  }

  const reader = request.body?.getReader();
  if (!reader) return { error: "invalid" as const };

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_BODY_BYTES) return { error: "too_large" as const };
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { body: new TextDecoder().decode(body) };
}

export async function POST(request: Request) {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return jsonResponse({ error: "INVALID_REQUEST" }, 415);
  }

  const ip = await getClientIp();
  const limit = rateLimit(
    `portfolio-assistant:${ip}`,
    envInt("RATE_LIMIT_PORTFOLIO_ASSISTANT_PER_MINUTE", 8),
    60_000
  );
  if (!limit.ok) {
    return jsonResponse(
      { error: "RATE_LIMITED", retryAfterSeconds: limit.retryAfterSeconds },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) }
    );
  }

  let rawBody: Awaited<ReturnType<typeof readLimitedBody>>;
  try {
    rawBody = await readLimitedBody(request);
  } catch {
    return jsonResponse({ error: "INVALID_REQUEST" }, 400);
  }

  if ("error" in rawBody) {
    return jsonResponse(
      { error: rawBody.error === "too_large" ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST" },
      rawBody.error === "too_large" ? 413 : 400
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.body);
  } catch {
    return jsonResponse({ error: "INVALID_REQUEST" }, 400);
  }

  const parsed = requestSchema.safeParse(payload);
  if (
    !parsed.success ||
    parsed.data.messages[0]?.role !== "user" ||
    parsed.data.messages.at(-1)?.role !== "user"
  ) {
    return jsonResponse({ error: "INVALID_REQUEST" }, 400);
  }

  let portfolioData: PortfolioAssistantData;
  try {
    const [profile, projects, skills, experience, services, settings] =
      await Promise.all([
        getProfile(),
        getPublishedProjects(),
        getPublishedSkills(),
        getPublishedExperience(),
        getPublishedServices(),
        getSettings(),
      ]);

    portfolioData = {
      profile,
      projects,
      skills,
      experience,
      services,
      contactEmail: settings.contactEmail,
    };
  } catch (error) {
    console.error(
      "[portfolio-assistant] Failed to load public portfolio data",
      error
    );
    return jsonResponse({ error: "PORTFOLIO_UNAVAILABLE" }, 503);
  }

  const question = parsed.data.messages.at(-1)?.content ?? "";
  const quickAnswer = getPortfolioQuickAnswer(question, portfolioData);
  return jsonResponse({ answer: quickAnswer, source: "portfolio" }, 200);
}
