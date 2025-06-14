"use client";

import { useState } from "react";

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!sourceText || !targetText) return alert("두 문장 모두 입력해주세요.");

    setLoading(true);
    try {
      const res = await fetch("/api/align", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText, targetText }),
      });
      if (!res.ok) throw new Error("에러 발생");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "alignment.xliff";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert("파일 생성 중 에러가 발생했습니다.");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-wrap justify-center mt-16 px-4 gap-4">
      <h1 className="w-full text-2xl font-bold text-center mb-4">
        XLIFF Alignment 데모
      </h1>

      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center gap-4 w-full"
      >
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <textarea
            placeholder="원문 텍스트 입력"
            rows={6}
            className="
          flex-auto basis-full
          sm:basis-[min(100%,700px)]
          max-w-[600px]
          min-h-[300px]
          border rounded p-2
        "
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />

          <textarea
            placeholder="번역문 텍스트 입력"
            rows={6}
            className="
          flex-auto basis-full
          sm:basis-[min(100%,700px)]
          max-w-[600px]
          min-h-[300px]
          border rounded p-2
        "
            value={targetText}
            onChange={(e) => setTargetText(e.target.value)}
          />
        </div>

        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="
          bg-[#fa7f3b] text-white font-bold    <!-- Added font-bold here -->
      py-2 px-6 rounded
      hover:bg-[#e67330] disabled:opacity-50
        "
          >
            {loading ? "처리 중..." : "Align & 다운로드"}
          </button>
        </div>
      </form>
    </main>
  );
}
