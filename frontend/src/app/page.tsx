"use client"; // the code executes in the user's web browser

import React, { useState } from 'react';

// 定義後端回傳的單字結構
interface AnalyzedWord {
  text: string;
  pos: string;
  pinyin: string;
}

export default function MiraaReader() {
  const [inputText, setInputText] = useState("");
  const [words, setWords] = useState<AnalyzedWord[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. 呼叫後端進行分詞與注音分析
  const handleAnalyze = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText }),
    });
    const data = await res.json();
    setWords(data);
    setLoading(false);
  };

  // 2. 點擊單字：呼叫 AI 解釋並播放該詞語音
  const handleWordClick = async (word: string) => {
    setExplanation("思考中...");
    // 取得 AI 解釋
    const res = await fetch("http://localhost:8000/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, context: inputText }),
    });
    const data = await res.json();
    setExplanation(data.explanation);

    // 播放點擊單字的語音
    const audio = new Audio(`http://localhost:8000/api/tts?text=${encodeURIComponent(word)}`);
    audio.play();
  };

  // 3. 根據詞性 (POS) 回傳對應顏色
  const getPosColor = (pos: string) => {
    const colors: Record<string, string> = {
      'n': 'text-blue-600',   // 名詞 - 藍色
      'v': 'text-red-600',    // 動詞 - 紅色
      'a': 'text-green-600',  // 形容詞 - 綠色
      'd': 'text-purple-600', // 副詞 - 紫色
    };
    return colors[pos[0]] || 'text-gray-800'; // 預設顏色
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左側選單列 - 範例文本 */}
      <aside className="w-64 bg-white p-4 shadow-md">
        <h2 className="font-bold mb-4">範例文本</h2>
        <button 
          onClick={() => setInputText("師者，所以傳道、受業、解惑也。")}
          className="w-full text-left p-2 hover:bg-gray-100 rounded"
        >
          《師說》選段
        </button>
      </aside>

      {/* 右側主閱覽區 */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* 輸入區 */}
          <textarea 
            className="w-full p-4 border rounded shadow-sm mb-4"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此輸入文言文..."
          />
          <button 
            onClick={handleAnalyze}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            {loading ? "分析中..." : "開始閱讀"}
          </button>

          {/* 核心閱讀區 - Miraa 風格 */}
          <div className="mt-8 p-10 bg-white rounded-lg shadow-lg leading-[4rem]">
            {words.map((item, index) => (
              <span 
                key={index} 
                onClick={() => handleWordClick(item.text)}
                className={`cursor-pointer hover:bg-yellow-100 px-1 rounded transition-colors group relative`}
              >
                {/* HTML <ruby> 標籤用於顯示注音 */}
                <ruby className={`text-2xl font-serif ${getPosColor(item.pos)}`}>
                  {item.text}
                  <rt className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.pinyin}
                  </rt>
                </ruby>
              </span>
            ))}
          </div>

          {/* AI 解釋彈窗/區塊 */}
          {explanation && (
            <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded shadow">
              <h3 className="font-bold text-blue-800 mb-2">AI 詞義分析</h3>
              <p className="whitespace-pre-wrap text-gray-700">{explanation}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}