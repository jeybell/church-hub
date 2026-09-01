import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "교회 자료실",
  description: "교회 내부 자료 관리 시스템",
};

// 본문 글꼴은 globals.css 의 프리텐다드가 맡는다. Geist 는 화면 어디에서도
// 쓰이지 않으면서 요청만 두 건 늘리고 있어 걷어냈다.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
