from openai import OpenAI
import os
from google import genai
from dotenv import load_dotenv
import json
import re


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
geminiClient = genai.Client(api_key=os.getenv("GEMINI_KEY"))  # explicit is fine  [oai_citation:3‡Google AI for Developers](https://ai.google.dev/gemini-api/docs/api-key?utm_source=chatgpt.com)

def GeminiResponse(userInput: str):   
    fake_string = """{
      "long_paragraph": "...",
      "key_remedies": ["...", "...", "..."]
    }"""

    prompt = f"""
Here are the user's symptoms:
{userInput}

Return ONLY valid JSON in exactly this format:
{fake_string}
"""

    resp = geminiClient.models.generate_content(
        model="gemini-2.5-flash",   # you can change model id
        contents=prompt,
    ) 
    # resp.text is the generated text
    print("RAW GEMINI TEXT:", resp.text)
    text = (resp.text or "").strip()

    # Remove ```json ... ``` or ``` ... ```
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    return json.loads(text)