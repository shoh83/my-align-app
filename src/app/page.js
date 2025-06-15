"use client";

import { useState } from "react";

const LANGUAGES = [
  { code: "ko", label: "한국어 (ko)" },
  { code: "en", label: "English (en)" },
  { code: "ja", label: "日本語 (ja)" },
  { code: "zh", label: "中文 (zh)" },
  { code: "fr", label: "Français (fr)" },
  { code: "es", label: "Español (es)" },
  // 👇 add more as needed from BCP‑47 common list :contentReference[oaicite:1]{index=1}
];

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [srcLang, setSrcLang] = useState("ko");
  const [trgLang, setTrgLang] = useState("en");
  const [loading, setLoading] = useState(false);

  // Feedback form state
  const [feedback, setFeedback] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!sourceText || !targetText) return alert("두 문장 모두 입력해주세요.");
    if (!srcLang || !trgLang) return alert("언어를 모두 선택해주세요.");

    setLoading(true);
    try {
      const res = await fetch("/api/align", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText, targetText, srcLang, trgLang }),
      });
      if (!res.ok) throw new Error("에러 발생");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alignment_${srcLang}-${trgLang}.xliff`;
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
        원본 번역문 정렬 및 XLIFF 추출 데모
      </h1>

      <p className="w-full text-center text-lg text-gray-600 mb-4 px-2 dark:text-gray-100">
        원문과 번역문을 각각 입력한 후 버튼을 클릭하면 각 세그먼트별로 원문과
        번역문을
        <br />
        정렬한 결과를 xliff 파일로 다운받을 수 있습니다. (최대 5분 소요)
      </p>

      <form
        onSubmit={onSubmit}
        className="flex flex-col items-center gap-4 w-full"
      >
        <div className="flex gap-4 w-full max-w-xl">
          <select
            value={srcLang}
            onChange={(e) => setSrcLang(e.target.value)}
            className="flex-1 border rounded p-2"
            required
          >
            <option value="">원본 언어 선택</option>
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={trgLang}
            onChange={(e) => setTrgLang(e.target.value)}
            className="flex-1 border rounded p-2"
            required
          >
            <option value="">번역 언어 선택</option>
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full">
          <textarea
            placeholder={`원문 텍스트 입력(최대 20000자)\n\n예시: 내가 아직 어리고 여렸을 적에 아버지는 내게 충고 한마디를 해주셨는데, 그 후로 나는 줄곧 그 말씀을 되뇌곤 한다. "누군가를 비판하고 싶어질 때는," 아버지께서는 말씀하셨다. "이 세상 모든 사람이 너와 같은 혜택을 누리며 살아오지 못했다는 것을 기억하거라."`}
            rows={6}
            maxLength={20000}
            className="
          flex-auto basis-full
          sm:basis-[min(100%,700px)]
          max-w-[600px]
          min-h-[400px]
          border rounded p-2
        "
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />

          <textarea
            placeholder={`번역문 텍스트 입력(최대 20000자)\n\n예시: In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. "Whenever you feel like criticizing any one," he told me, " just remember that all the people in this world haven't had the advantages that you've had."`}
            rows={6}
            maxLength={20000}
            className="
          flex-auto basis-full
          sm:basis-[min(100%,700px)]
          max-w-[600px]
          min-h-[400px]
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
          bg-[#fa7f3b] text-white font-bold mt-4 text-lg
      py-2 px-6 rounded
      hover:bg-[#e67330] disabled:opacity-50
        "
          >
            {loading ? "처리 중..." : "입력 & 다운로드"}
          </button>
        </div>
      </form>
      <p className="w-full text-center text-sm text-gray-600 mt-4 mb-4 px-2 dark:text-gray-300">
        * 검증된 API를 사용하여 데이터 유출 위험은 최소화했으나 민감한 정보
        입력은 주의해주세요.
        <br />
        개발 중인 서비스로 개선할 점이 많습니다. 양해부탁드립니다.
      </p>
      <section className="w-full max-w-xl mt-12 p-4">
        <h2 className="text-lg text-center mb-4 font-bold mb-2">
          개선을 위한 피드백 부탁드려요.
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!feedback.trim()) return alert("피드백을 입력해주세요.");
            setFbLoading(true);
            try {
              const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: feedback }),
              });
              if (!res.ok) throw new Error("Error");
              alert(await res.text());
              setFeedback("");
            } catch {
              alert("피드백 전송 실패");
            }
            setFbLoading(false);
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            rows={4}
            maxLength={2000}
            className="w-full border rounded p-2 min-h-[200px]"
            placeholder="이 기능이 도움이 되었는지, 더 개선할 점은 없는지, 비용을 지불하고 이용할 가치가 있는지 의견부탁드립니다.(최대 2000자)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            type="submit"
            disabled={fbLoading}
            className="self-end border text-[#fa7f3b] font-bold mt-2 py-2 px-4 rounded disabled:opacity-50"
          >
            {fbLoading ? "전송 중…" : "피드백 보내기"}
          </button>
        </form>
      </section>
    </main>
  );
}
