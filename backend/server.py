from fastapi import FastAPI, Request
from models import OpenAiResponse, GeminiResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def testing():
    return {"name": "Henry"}

@app.post("/openaiAPItest")
async def openai(request : Request):
    body = await request.json()
    user_input = body["userInput"]

    return OpenAiResponse(userInput = user_input)

@app.post("/geminitest")
async def openai(request : Request):
    body = await request.json()
    user_input = body["userInput"]

    return GeminiResponse(userInput = user_input)
    
    
