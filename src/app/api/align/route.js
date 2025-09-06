// route.js
import { NextResponse } from "next/server";
import { splitText, invokeGemini, buildCsv } from "@/lib/align";
import { saveAlignment } from "@/lib/db";

export const runtime = "nodejs";       // ✅ Node 런타임 고정
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

    const srcArr = splitText(sourceText, srcLang);
    const trgArr = splitText(targetText, trgLang);

    const { mapping, usage } = await invokeGemini(srcArr, trgArr);

    // ⚠️ buildCsv 시그니처: (srcArr, trgArr, mapping, sep?)
    //   언어코드를 넘기면 sep로 들어가서 이상해집니다. → 언어코드 제거!
    const csvBuffer = buildCsv(srcArr, trgArr, mapping); 

    // (선택) DB 저장용 문자열
    const csv = csvBuffer.toString("utf-8");
    await saveAlignment({
      source: sourceText,
      target: targetText,
      mapping,
      csv,
      usage,
    });

    return new NextResponse(csvBuffer, {
      status: 200,
      headers: {
        // ✅ CSV로 명확히 지정
        "Content-Type": "text/csv; charset=utf-8",
        // ✅ 파일명에 언어코드 포함
        "Content-Disposition": `attachment; filename="alignment_${srcLang || "und"}-${trgLang || "und"}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("POST /api/align error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
