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
  const [inputText, setInputText] = useState("");
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
    if (!pos) return 'text-slate-700 dark:text-slate-300';
    const tag = pos[0].toLowerCase();
    const colors: Record<string, string> = {
      'n': 'text-blue-700 dark:text-blue-400',
      'v': 'text-red-800 dark:text-red-400',
      'a': 'text-emerald-700 dark:text-emerald-400',
      'd': 'text-purple-700 dark:text-purple-400',
      'p': 'text-amber-700 dark:text-amber-500',
      'w': 'text-gray-400',
    };
    return colors[tag] || 'text-slate-700 dark:text-slate-300';
  };

  return (
    // 使用 overflow-hidden 確保外層不捲動
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      
      {/* 1. 左側文庫欄 */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 flex flex-col">
        <div className="p-4 border-b dark:border-zinc-800">
          <h2 className="font-bold text-gray-800 dark:text-zinc-200">我的文庫</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button 
            onClick={handleSaveText}
            className="mb-4 w-full py-2 px-4 border-2 border-dashed border-blue-400 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm"
          >
            + 收藏目前文本
          </button>
          
          <div className="text-xs text-gray-400 uppercase font-semibold mb-2">範例</div>
          <button 
            onClick={() => setInputText("師者，所以傳道、受業、解惑也。")}
            className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 rounded transition"
          >
            《師說》選段
          </button>

          <div className="text-xs text-gray-400 uppercase font-semibold mt-6 mb-2">已儲存</div>
          {savedTexts.map((item) => (
            <div 
              key={item.id}
              onClick={() => setInputText(item.content)}
              className="group relative w-full text-left p-3 text-sm border border-transparent hover:border-blue-200 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded cursor-pointer transition"
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
      <main className="flex-1 overflow-y-auto p-8 border-r dark:border-zinc-800">
        <div className="max-w-2xl mx-auto">
          <textarea 
            className="w-full p-4 border rounded shadow-sm mb-4 bg-white dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此輸入文言文..."
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 mb-8"
          >
            {loading ? "分析中..." : "開始閱讀"}
          </button>

          {words.length > 0 && (
            <div className="p-10 bg-white dark:bg-zinc-900 rounded-lg shadow-sm leading-[4.5rem]">
              {words.map((item, index) => (
                <span 
                  key={index} 
                  onClick={() => handleWordClick(item.text)}
                  className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-1 rounded transition-colors group relative"
                >
                  <ruby className={`text-3xl font-serif ${getPosColor(item.pos)}`}>
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
      <aside className="w-80 flex-shrink-0 bg-white dark:bg-zinc-900 flex flex-col shadow-xl">
        <div className="p-4 border-b dark:border-zinc-800 bg-blue-500 text-white">
          <h3 className="font-bold flex items-center gap-2">
            <span>✨</span> AI 詞義分析
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {explanation ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-zinc-300 leading-relaxed text-sm lg:text-base">
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