// /api/align/route.js
import { NextResponse } from "next/server";
import { splitText, invokeGemini, buildCsv } from "@/lib/align";
import { saveAlignment } from "@/lib/db";

export const runtime = "nodejs";        // ✅ Edge가 아니라 Node로 강제
export const maxDuration = 600;
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  try {
    const { sourceText, targetText, srcLang, trgLang } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      // ✅ 키가 없을 때는 명시적으로 실패 사유 반환
      return new NextResponse("GEMINI_API_KEY is missing", { status: 500 });
    }
    if (!sourceText?.trim() || !targetText?.trim()) {
      return new NextResponse("sourceText/targetText required", { status: 400 });
    }

    const srcArr = splitText(sourceText, srcLang);
    const trgArr = splitText(targetText, trgLang);

    const { mapping, usage } = await invokeGemini(srcArr, trgArr);

    // ✅ buildCsv 시그니처: (srcArr, trgArr, mapping, sep?)
    const csvBuffer = buildCsv(srcArr, trgArr, mapping);

    // (선택) DB 저장
    await saveAlignment({
      source: sourceText,
      target: targetText,
      mapping,
      csv: csvBuffer.toString("utf-8"),
      usage,
    });

    return new NextResponse(csvBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8", // ✅ CSV
        "Content-Disposition": `attachment; filename="alignment_${srcLang || "und"}-${trgLang || "und"}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/align error:", err);
    // ✅ 개발 중에는 구체 메시지를 그대로 반환해서 디버깅
    return new NextResponse(
      err?.stack || err?.message || "Internal Server Error",
      { status: 500 }
    );
  }
}
