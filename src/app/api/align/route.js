import { NextResponse } from "next/server";
import { splitText, invokeGemini, buildCsv } from "@/lib/align";
import { saveAlignment } from "@/lib/db";

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

export const maxDuration = 600; // 10 minutes
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { sourceText, targetText, srcLang, trgLang } = await req.json();
  const srcArr = splitText(sourceText, srcLang);
  const trgArr = splitText(targetText, trgLang);
  const { mapping, usage } = await invokeGemini(srcArr, trgArr);
  const csvBuffer = buildCsv(
    srcArr,
    trgArr,
    mapping,
    srcLang || "und",
    trgLang || "und"
  );
  const csv = csvBuffer.toString("utf-8");

  await saveAlignment({
    source: sourceText,
    target: targetText,
    mapping,
    csv,
    usage,
  });

  return new NextResponse(xmlBuffer, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="alignment.csv"',
      "Content-Type": "application/xml",
    },
  });
}
