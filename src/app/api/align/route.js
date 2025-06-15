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

export async function POST(req) {
  const { sourceText, targetText } = await req.json();
  const srcArr = splitText(sourceText);
  const trgArr = splitText(targetText);
  const { mapping, usage } = await invokeGemini(srcArr, trgArr);
  const xmlBuffer = buildXliff(srcArr, trgArr, mapping);
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
