# !pip install edge_tts

import edge_tts
import io

class TTSService:
    async def text_to_speech_stream(self, text: str, voice: str = "zh-CN-YunjianNeural"):
        """
        將文字轉為語音串流 (In-memory)，避免頻繁讀寫硬碟
        """
        communicate = edge_tts.Communicate(text, voice)
        audio_stream = io.BytesIO()
        
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])
        
        audio_stream.seek(0)
        return audio_stream