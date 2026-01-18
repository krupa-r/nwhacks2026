from openai import OpenAI
import os
# from google import genai
from dotenv import load_dotenv
import json


load_dotenv()

# OpenAI
openaiClient = OpenAI(api_key=os.getenv("OPENAI_KEY"))

def OpenAiResponse (userInput):

    fake_string = """{
    "long_paragraph": "...",
    "key_words": ["...", "...", "..."]
    }"""

    resp = openaiClient.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": f"""
                Here are the user's symptoms:
                {userInput}

            Please return ONLY a JSON object in this format:
            {fake_string}
            """
            }
        ],
    )


    return json.loads(resp.choices[0].message.content)



# Gemini
# geminiClient = genai.Client()