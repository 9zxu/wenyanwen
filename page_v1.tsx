"use client";

import React, { useState, useEffect } from 'react';
// Import a simple icon or use text. I'll use text (×) for the delete button for simplicity.

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
  
  // New state for saved snippets
  const [savedTexts, setSavedTexts] = useState<SavedItem[]>([]);

  // Load saved texts from LocalStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem("wenyanwen_saved");
    if (saved) {
      setSavedTexts(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage whenever savedTexts changes
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
    const newItem: SavedItem = {
      id: Date.now(),
      content: inputText
    };
    setSavedTexts([newItem, ...savedTexts]);
  };

  const handleDeleteSaved = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the item when clicking delete
    setSavedTexts(savedTexts.filter(item => item.id !== id));
  };

  const handleWordClick = async (word: string) => {
    const audio = new Audio(`${API_BASE}/api/tts?text=${encodeURIComponent(word)}`);
    audio.play();
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
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 p-4 flex flex-col">
        <h2 className="font-bold mb-4 text-gray-800 dark:text-zinc-200">我的文庫</h2>
        
        {/* Add Button */}
        <button 
          onClick={handleSaveText}
          className="mb-6 w-full py-2 px-4 border-2 border-dashed border-blue-400 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2"
        >
          <span>+</span> 收藏目前文本
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Default Example */}
          <div className="text-xs text-gray-400 uppercase font-semibold mb-2">範例文本</div>
          <button 
            onClick={() => setInputText("師者，所以傳道、受業、解惑也。")}
            className="w-full text-left p-3 text-sm bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition"
          >
            《師說》選段
          </button>

          {/* Saved Texts List */}
          {savedTexts.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-gray-400 uppercase font-semibold mb-2">已儲存</div>
              {savedTexts.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setInputText(item.content)}
                  className="group relative w-full text-left p-3 text-sm border border-transparent hover:border-blue-200 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded mb-2 cursor-pointer transition"
                >
                  <p className="truncate pr-6 text-gray-700 dark:text-zinc-300">
                    {item.content}
                  </p>
                  <button 
                    onClick={(e) => handleDeleteSaved(item.id, e)}
                    className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Input Area */}
          <textarea 
            className="w-full p-4 border rounded shadow-sm mb-4 bg-white dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此輸入文言文..."
          />
          <div className="flex gap-2">
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-blue-500 text-white px-8 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? "分析中..." : "開始閱讀"}
            </button>
          </div>

          {/* Reading Area */}
          {words.length > 0 && (
            <div className="mt-8 p-10 bg-white dark:bg-zinc-900 rounded-lg shadow-lg leading-[4.5rem]">
              {words.map((item, index) => (
                <span 
                  key={index} 
                  onClick={() => handleWordClick(item.text)}
                  className="cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 px-1 rounded transition-colors group relative"
                >
                  <ruby className={`text-3xl font-serif ${getPosColor(item.pos)}`}>
                    {item.text}
                    <rt className="text-xs text-gray-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.pinyin}
                    </rt>
                  </ruby>
                </span>
              ))}
            </div>
          )}

          {/* AI Explanation */}
          {explanation && (
            <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded shadow animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">AI 詞義分析</h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-zinc-300 leading-relaxed">
                {explanation}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}