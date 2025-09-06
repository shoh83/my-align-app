// /lib/align.js (발췌)
import { GoogleGenAI } from "@google/genai";

export async function invokeGemini(srcArr, trgArr) {
  const sourceDict = Object.fromEntries(srcArr.map((t, i) => [i, t]));
  const targetDict = Object.fromEntries(trgArr.map((t, i) => [i, t]));

  const prompt = `
[... 동일 ...]
${JSON.stringify(sourceDict)}
[...]
${JSON.stringify(targetDict)}
`.trim();

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-06-05",
    contents: prompt,
  });

  const raw = typeof resp.text === "function" ? resp.text() : resp.text;
  const cleaned = String(raw || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let mapping;
  try {
    mapping = JSON.parse(cleaned);
  } catch {
    // 대괄호 블록만 추출 재시도
    const m = cleaned.match(/\[[\s\S]*\]/);
    if (!m) throw new Error("Failed to parse mapping JSON");
    mapping = JSON.parse(m[0]);
  }

  const usage = resp.usageMetadata || {};
  return { mapping, usage: {
    promptTokenCount: usage.promptTokenCount,
    candidatesTokenCount: usage.candidatesTokenCount,
    totalTokenCount: usage.totalTokenCount,
    thoughtsTokenCount: usage.thoughtsTokenCount,
  }};
}

// CSV 빌더는 그대로 OK
export function buildCsv(srcArr, trgArr, mapping, sep = " ") {
  function escapeCsv(val) {
    if (val == null) return "";
    const s = String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  const rows = mapping.map(([sIdxs, tIdxs]) => [
    sIdxs.map((i) => srcArr[i]).join(sep),
    tIdxs.map((j) => trgArr[j]).join(sep),
  ]);
  const all = [["source", "target"], ...rows];
  const csv = all.map(r => r.map(escapeCsv).join(",")).join("\n");
  return Buffer.from(csv, "utf-8");
}
