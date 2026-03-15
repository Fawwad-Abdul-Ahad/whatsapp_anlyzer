from fastapi import FastAPI, UploadFile
from analyzer import analyze_chat

app = FastAPI()

@app.post("/analyze")
async def analyze(file: UploadFile):

    content = await file.read()
    text = content.decode("utf-8")

    result = analyze_chat(text)

    return results