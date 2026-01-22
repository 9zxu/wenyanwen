import type { Metadata } from "next";
import { Noto_Serif_TC } from "next/font/google"; // 引入思源宋體
import "./globals.css";

const notoSerif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-serif", // 定義 CSS 變數
});

export const metadata: Metadata = {
  title: "文言文閱覽室",
  description: "古風 AI 文本分析",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSerif.variable} font-serif antialiased`}>
        {children}
      </body>
    </html>
  );
}