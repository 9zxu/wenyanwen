# backend/services/tts_service.py
import edge_tts
import io

class TTSService:
    async def text_to_speech_stream(self, text: str, voice: str = "zh-CN-YunjianNeural"):
        try:
            communicate = edge_tts.Communicate(text, voice)
            audio_stream = io.BytesIO()
            
            # This requires internet access
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_stream.write(chunk["data"])
            
            audio_stream.seek(0)
            if audio_stream.getbuffer().nbytes == 0:
                raise Exception("Generated audio is empty")
                
            return audio_stream
        except Exception as e:
            print(f"TTS Service Error: {str(e)}") # This will show up in your docker logs
            raise e