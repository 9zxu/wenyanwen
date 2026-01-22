"use client";

import React, { useState, useEffect } from 'react';

interface AnalyzedWord {
  text: string;
  pos: string;
  pinyin: string;
}

interface SavedItem {
  id: number;
  content: string;
}

const API_BASE = "http://localhost:8000";

export default function Reader() {
  const [inputText, setInputText] = useState(""); // array destructing
  const [words, setWords] = useState<AnalyzedWord[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedTexts, setSavedTexts] = useState<SavedItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("wenyanwen_saved");
    if (saved) setSavedTexts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("wenyanwen_saved", JSON.stringify(savedTexts));
  }, [savedTexts]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setWords(data);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveText = () => {
    if (!inputText.trim()) return;
    const newItem = { id: Date.now(), content: inputText };
    setSavedTexts([newItem, ...savedTexts]);
  };

  const handleDeleteSaved = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTexts(savedTexts.filter(item => item.id !== id));
  };

  const handleWordClick = async (word: string) => {
    // const audio = new Audio(`${API_BASE}/api/tts?text=${encodeURIComponent(word)}`);
    // audio.play();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-TW'; 
    window.speechSynthesis.speak(utterance);


    setExplanation("思考中...");
    const res = await fetch(`${API_BASE}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, context: inputText }),
    });
    const data = await res.json();
    setExplanation(data.explanation);
  };

  const getPosColor = (pos: string) => {
    if (!pos) return 'text-[var(--ink-black)]';
    const tag = pos[0].toLowerCase();
    const colors: Record<string, string> = {
      'n': 'text-[var(--indigo)]',    // 名詞用靛青
      'v': 'text-[var(--vermillion)]', // 動詞用朱紅
      'a': 'text-emerald-700 dark:text-emerald-400',
      'd': 'text-purple-700 dark:text-purple-400',
      'p': 'text-[var(--gold)]',      // 介詞用金色
    };
    return colors[tag] || 'text-[var(--ink-black)]';
  };


  return (
    // 使用 overflow-hidden 確保外層不捲動
    <div className="flex h-screen bg-(--bg-paper) overflow-hidden">
      
      {/* 1. 左側文庫欄 */}
      <aside className="w-64 shrink-0 bg-(--bg-sidebar) border-r border-(--border) flex flex-col">
        <div className="p-4 border-b border-(--border) ">
          <h2 className="text-(--gold) font-bold">文言文閱覽室</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button 
            onClick={handleSaveText}
            className="mb-4 w-full py-2 px-4 border-(--gold) text-(--gold) hover:bg-(--gold) hover:text-white border-2 border-dashed rounded-lg transition text-sm"
          >
            + 收藏目前文本
          </button>
          
          <div className="text-xs text-(--gold) uppercase font-semibold mb-2">範例</div>
          <button 
            onClick={() => setInputText("師者，所以傳道、受業、解惑也。")}
            className="w-full text-left p-3 text-sm bg-(--bg-sidebar) hover:bg-(--bg-paper) rounded cursor-pointer transition"
          >
            《師說》選段
          </button>

          <div className="text-xs text-(--gold) uppercase font-semibold mt-6 mb-2">已儲存</div>
          {savedTexts.map((item) => (
            <div 
              key={item.id}
              onClick={() => setInputText(item.content)}
              className="group relative w-full text-left p-3 text-sm bg-(--bg-sidebar) hover:bg-(--bg-paper) rounded cursor-pointer transition"
            >
              <p className="truncate pr-4 text-gray-700 dark:text-zinc-300">{item.content}</p>
              <button 
                onClick={(e) => handleDeleteSaved(item.id, e)}
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* 2. 中間主閱讀區 (獨立捲動) */}
      <main className="flex-1 overflow-y-auto p-8 border-r border-(--border)">
        <div className="max-w-2xl mx-auto">
          <textarea 
            className="w-full p-4 border rounded shadow-sm mb-4 bg-(--bg-paper) border-(--border) outline-none focus:ring-2 focus:ring-(--gold)"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此輸入文言文..."
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-(--gold) text-white px-8 py-2 rounded-lg hover:bg-(--vermillion) transition disabled:opacity-50 mb-8"
          >
            {loading ? "分析中..." : "開始閱讀"}
          </button>

          {words.length > 0 && (
            <div className="p-10 bg-white dark:bg-zinc-900 rounded-lg shadow-sm leading-18">
              {words.map((item, index) => (
                <span 
                  key={index} 
                  onClick={() => handleWordClick(item.text)}
                  className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-1 rounded transition-colors group relative"
                >
                  <ruby className={`text-3xl ${getPosColor(item.pos)}`}>
                    {item.text}
                    <rt className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.pinyin}
                    </rt>
                  </ruby>
                </span>
              ))}
            </div>
          )}
          {/* 墊高底部空間，確保最後一行字不會被遮住 */}
          <div className="h-20" />
        </div>
      </main>

      {/* 3. 右側 AI 分析面板 (固定位置，獨立捲動) */}
      <aside className="w-80 shrink-0 bg-(--bg-sidebar) flex flex-col shadow-xl">
        <div className="p-4 border-b border-(--border) bg-(--vermillion) text-white">
          <h3 className="font-bold flex items-center gap-2">
            <span>✨</span> AI 詞義分析
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {explanation ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-zinc-300 leading-relaxed text-sm lg:text-base font-bold">
                {explanation}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 italic">
              <p>點擊文章中的單字</p>
              <p>查看詳細解釋與語音</p>
            </div>
          )}
        </div>
        
        {/* 底部裝飾或提示 */}
        <div className="p-4 text-center text-xs text-gray-400 border-t dark:border-zinc-800">
          Powered by Ollama LLM
        </div>
      </aside>

    </div>
  );
}