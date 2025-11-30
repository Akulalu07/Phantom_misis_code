import os
from typing import List, Optional

import torch
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from preprocess import batch_clean_text


MODEL_DIR = os.getenv("MODEL_DIR", "checkpoints")
MAX_LENGTH = int(os.getenv("MAX_LENGTH", "256"))

app = FastAPI(title="Sentiment API", version="1.0.0")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=True)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()


class PredictRequest(BaseModel):
    texts: List[str]


class PredictResponse(BaseModel):
    labels: List[int]
    probs: List[List[float]]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    cleaned = batch_clean_text(req.texts)
    batch = tokenizer(
        cleaned,
        padding=True,
        truncation=True,
        max_length=MAX_LENGTH,
        return_tensors="pt",
    ).to(device)

    with torch.no_grad():
        logits = model(**batch).logits
        probs = torch.softmax(logits, dim=-1).cpu().tolist()
        labels = torch.argmax(logits, dim=-1).cpu().tolist()

    return PredictResponse(labels=labels, probs=probs)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

