import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "원본 번역문 정렬 및 XLIFF 추출 데모",
  description:
    "원문과 번역문을 각각 입력한 후 버튼을 클릭하면 각 세그먼트별로 원문과 번역문을 정렬한 결과를 xliff 파일로 다운받을 수 있습니다. (최대 5분 소요)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>원본 번역문 정렬 및 XLIFF 추출 데모</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
