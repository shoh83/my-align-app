import segment from "sentencex";
import { GoogleGenAI } from "@google/genai";
import { create } from "xmlbuilder2";

// 1. 문장 분할 함수 (sentencex 사용)
export function splitText(text, lang = "ko") {
  // lang: 'ko', 'en' 등 언어 코드
  return segment(lang, text).filter(Boolean);
}

// 2. Gemini API 호출 함수 (API 키 방식)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function invokeGemini(srcArr, trgArr) {
  const sourceDict = Object.fromEntries(srcArr.map((txt, idx) => [idx, txt]));
  const targetDict = Object.fromEntries(trgArr.map((txt, idx) => [idx, txt]));

  const prompt = `
Map the keys of the source dictionary to the keys of the target dictionary. 
Mapped keys should contain values that have similar meaning in different languages.
A key in the source dictionary can be mapped to maximum three subsequent keys in the target dictionary, and 
a key in the target dictionary can be mapped to maximum three subsequent keys in the source dictionary.
Preserve the order of the keys in the source and target dictionaries.
Follow the form of a list of lists, where each inner list contains two elements as shown below. 
Try to keep the inner list as small as possible. Do not include any other text or explanation.
Make sure you map every key in both source and target dictionary.

###--- Format ---###

[
[[0], [0]],
[[1], [1,2]],
[[2,3], [3]],
...
]

###--- Source dictionary ---###

${JSON.stringify(sourceDict)}

###--- Target dictionary ---###

${JSON.stringify(targetDict)}
  `.trim();

  // Gemini API 호출
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-preview-06-05", // 적절한 모델 선택
    contents: prompt,
    // 필요한 경우 config 옵션 추가 가능
  });

  const jsonStr = response.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(jsonStr);
}

// 3. XLIFF 파일 생성 함수
export function buildXliff(
  srcArr,
  trgArr,
  mapping,
  srcLang = "ko",
  trgLang = "en",
  sep = " "
) {
  const doc = create({ version: "1.0" })
    .ele("xliff", {
      version: "2.0",
      srcLang,
      trgLang,
      xmlns: "urn:oasis:names:tc:xliff:document:2.0",
    })
    .ele("file", { id: "f1", original: "combined" });

  mapping.forEach(([sIdxs, tIdxs], idx) => {
    doc
      .ele("unit", { id: idx + 1 })
      .ele("segment", { id: idx + 1 })
      .ele("source")
      .txt(sIdxs.map((i) => srcArr[i]).join(sep))
      .up()
      .ele("target")
      .txt(tIdxs.map((j) => trgArr[j]).join(sep))
      .up()
      .up();
  });

  const xml = doc.end({ prettyPrint: true });
  return Buffer.from(xml, "utf-8");
}
