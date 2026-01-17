from openai import OpenAI
import os
from google import genai



# OpenAI
openaiClient = OpenAI(api_key=os.getenv("OPENAI_KEY"))


# Gemini
geminiClient = genai.Client()