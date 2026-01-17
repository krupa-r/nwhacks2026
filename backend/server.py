from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def testing():
    return {"name": "Henry"}