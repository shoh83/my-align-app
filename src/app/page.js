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
    <main className="flex flex-col items-center mt-16 px-4">
      <h1 className="text-2xl font-bold mb-4">XLIFF Alignment 데모</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-xl">
        <textarea
          placeholder="원문 텍스트 입력"
          rows={6}
          className="border p-2 w-full"
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
        />
        <textarea
          placeholder="번역문 텍스트 입력"
          rows={6}
          className="border p-2 w-full"
          value={targetText}
          onChange={(e) => setTargetText(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "처리 중..." : "Align & 다운로드"}
        </button>
      </form>
    </main>
  );
}
