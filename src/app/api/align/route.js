import { NextResponse } from "next/server";
import { splitText, invokeGemini, buildXliff } from "@/lib/align";
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
  const xmlBuffer = buildXliff(
    srcArr,
    trgArr,
    mapping,
    srcLang || "und",
    trgLang || "und"
  );
  const xliffHtml = xmlBuffer.toString("utf-8");

  await saveAlignment({
    source: sourceText,
    target: targetText,
    mapping,
    xliffHtml,
    usage,
  });

  return new NextResponse(xmlBuffer, {
    status: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="alignment.xliff"',
      "Content-Type": "application/xml",
    },
  });
}
