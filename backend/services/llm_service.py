import requests
import os

class LLMService:
    def __init__(self):
        # 指向主機上的 Ollama 服務路徑
        self.base_url = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
        self.api_url = f"{self.base_url}/api/generate"

    def explain_word(self, word: str, context: str):
        
        # 設計給 Qwen 2.5 的 Prompt
        prompt = f"""你是一位精通文言文與現代漢語的導師。
請分析文言文句子『{context}』中的單字『{word}』。
請提供：
1. 本字在此句中的含義
2. 現代漢語中的對應詞
3. 語法用途說明
請用簡明扼要的繁體中文回答。"""

        payload = {
            "model": "qwen2.5:7b",
            "prompt": prompt,
            "stream": False # 設為 False 方便後端一次性回傳給前端
        }

        try:
            response = requests.post(self.api_url, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json().get("response", "解析失敗")
            return f"Ollama 伺服器錯誤: {response.status_code}"
        except Exception as e:
            return f"無法連接至 Ollama: {str(e)}"