# !pip install fastapi pydantic uvicorn

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import Response # audio
from services.nlp_service import NLPService
from services.llm_service import LLMService
from services.tts_service import TTSService

# Initialize the FastAPI application instance.
# The 'title' parameter sets the name displayed in the automatic Swagger UI documentation (/docs).
app = FastAPI(title="Classical Chinese Analyzer API")

# Add Cross-Origin Resource Sharing (CORS) middleware to the application.
# This allows the backend to accept requests from different origins (e.g., a React frontend).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allows all domains to access the API.
    allow_methods=["*"], # allows all standard HTTP methods (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"], # permits all HTTP headers to be sent in the request (e.g., Authorization, Content-Type).
)

# Class initialization
nlp_service = NLPService()
llm_service = LLMService()
tts_service = TTSService()

# Define the data structure for the analysis request using Pydantic's BaseModel.
# This automatically handles JSON parsing and validation for the incoming request body.
class AnalyzeRequest(BaseModel):
    text: str # The raw text to be analyzed

# Define the data structure for the explanation request.
class ExplainRequest(BaseModel):
    word: str    # The specific word to explain
    context: str # The surrounding text to help the AI understand the usage

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Returns word segmentation, parts of speech, and Bopomofo (phonetics).
    回傳分詞、詞性與注音
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="請輸入文本")
    return nlp_service.analyze_text(request.text)

@app.post("/api/explain")
async def explain(request: ExplainRequest):
    """
    Returns an AI-generated explanation for a specific word.
    回傳 AI 產生的單詞解釋
    """
    explanation = llm_service.explain_word(request.word, request.context)
    return {"explanation": explanation}

@app.get("/api/tts")
async def get_tts(text: str = Query(...), voice: str = "zh-CN-YunjianNeural"):
    """
    Returns an MP3 audio stream for the given text.
    """
    try:
        audio_data = await tts_service.text_to_speech_stream(text, voice)
        # return StreamingResponse(audio_data, media_type="audio/mpeg")
        return Response(content=audio_data.getvalue(), media_type="audio/mpeg")
    except Exception as e:
        print(f"Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # The fastAPI service which runs on the backend container listens for incomming requests on all available network interfaces (listen on `0.0.0.0`) via container port `8000`.
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)