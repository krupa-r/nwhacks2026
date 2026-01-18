
from fastapi import FastAPI, Request
from models import OpenAiResponse

app = FastAPI()






@app.get("/")
def testing():
    return {"name": "Henry"}

@app.post("/openaiAPItest")
async def openai(request : Request):
    body = await request.json()
    user_input = body["userInput"]

    return OpenAiResponse(userInput = user_input)
    
