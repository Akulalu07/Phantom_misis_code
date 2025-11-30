import html
import io
import json
import os
import random
import re
from typing import List, Tuple

import pandas as pd
import torch
import umap
from bertopic import BERTopic
from celery import Celery
from sentence_transformers import SentenceTransformer
from transformers import (
    AutoModelForCausalLM,
    AutoModelForSequenceClassification,
    AutoTokenizer,
)

# Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MAX_CLUSTERS = 3
MODEL_DIR = "checkpoints"
GEN_MODEL_NAME = "Qwen/Qwen3-8B"  # Target generation model

# Celery Setup
app = Celery(
    "cluster_tasks",
    broker=os.environ.get("REDIS_URL", "redis://:12345678@localhost:6379/0"),
    backend=os.environ.get("REDIS_URL", "redis://:12345678@localhost:6379/0"),
)
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

SENTIMENT_MAP = {0: "negative", 1: "neutral", 2: "positive"}

# Global caches for models
_EMBEDDING_MODEL = None
_CLASSIFIER_MODEL = None
_CLASSIFIER_TOKENIZER = None
_GEN_MODEL = None
_GEN_TOKENIZER = None


def get_embedding_model():
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        _EMBEDDING_MODEL = SentenceTransformer("cointegrated/rubert-tiny2")
    return _EMBEDDING_MODEL


def get_classifier_model():
    global _CLASSIFIER_MODEL, _CLASSIFIER_TOKENIZER
    if _CLASSIFIER_MODEL is None or _CLASSIFIER_TOKENIZER is None:
        _CLASSIFIER_TOKENIZER = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=True)
        _CLASSIFIER_MODEL = AutoModelForSequenceClassification.from_pretrained(
            MODEL_DIR
        ).to(device)
    return _CLASSIFIER_MODEL, _CLASSIFIER_TOKENIZER


def get_generation_model() -> Tuple[AutoModelForCausalLM, AutoTokenizer]:
    """Lazy loads the Qwen model for summarization."""
    global _GEN_MODEL, _GEN_TOKENIZER
    if _GEN_MODEL is None or _GEN_TOKENIZER is None:
        print(f"Loading generation model: {GEN_MODEL_NAME}...")
        try:
            _GEN_TOKENIZER = AutoTokenizer.from_pretrained(
                GEN_MODEL_NAME, trust_remote_code=True
            )
            _GEN_MODEL = AutoModelForCausalLM.from_pretrained(
                GEN_MODEL_NAME,
                device_map="auto",  # Automatically handles multi-gpu or cpu offload
                torch_dtype=torch.bfloat16,  # Use half-precision for memory efficiency
                trust_remote_code=True,
            )
        except Exception as e:
            print(f"Error loading generation model: {e}")
            raise e
    return _GEN_MODEL, _GEN_TOKENIZER


def clean_text(text: str) -> str:
    text = html.unescape(str(text))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[^\w\s.,!?;:()\"'-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def batch_clean_text(texts: List[str]) -> List[str]:
    return [clean_text(t) for t in texts]


def generate_summary(keywords, documents):
    """Generates a summary using Qwen instead of OpenAI."""
    model, tokenizer = get_generation_model()

    system_prompt = (
        "Ты — аналитик данных. Твоя задача — проанализировать отзывы и ключевые слова кластера. "
        "Создай JSON с полями 'title' (краткий заголовок 3-5 слов) и 'description' (описание 1 предложение). "
        "НЕ пиши вводных слов, верни ТОЛЬКО валидный JSON."
    )

    user_prompt = f"""
    Ключевые слова: {", ".join(keywords)}
    Примеры отзывов: {json.dumps(documents, ensure_ascii=False)}

    Сформируй JSON в формате: {{"title": "...", "description": "..."}}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        # Format input using the chat template
        text_input = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        model_inputs = tokenizer([text_input], return_tensors="pt").to(model.device)

        with torch.no_grad():
            generated_ids = model.generate(
                **model_inputs,
                max_new_tokens=256,
                temperature=0.3,
                top_p=0.9,
                do_sample=True,
            )

        # Decode output
        generated_ids = [
            output_ids[len(input_ids) :]
            for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]
        response_text = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[
            0
        ]

        # Extract JSON using regex in case the model adds conversational filler
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        else:
            print(f"Failed to parse JSON from Qwen response: {response_text}")
            return {
                "title": "Ошибка формата",
                "description": "Модель вернула некорректный ответ.",
            }

    except Exception as e:
        print(f"Generation Error: {e}")
        return {
            "title": "Ошибка генерации",
            "description": "Не удалось получить ответ от AI",
        }


@app.task(bind=True, name="worker.process_file")
def run_clustering_task(self, csv_data: str, task_arg_id: str):
    try:
        df = pd.read_csv(io.StringIO(csv_data))[:500]
    except FileNotFoundError:
        return {"status": "error", "message": "Не удалось прочитать файл"}

    if "text" not in df.columns or "src" not in df.columns:
        return {"status": "error", "message": "В CSV нет колонок text или src"}

    embedding_model = get_embedding_model()

    result_frames = []
    cluster_summaries = []
    topic_offset = 0

    categories = df["src"].unique()
    total_cats = len(categories)

    for idx, category in enumerate(categories):
        progress_percent = 10 + int((idx / total_cats) * 80)
        print("processing category:", category, "progress:", progress_percent)

        subset = df[df["src"] == category].copy()
        texts = subset["text"].tolist()

        if len(texts) < 5:
            continue

        embeddings = embedding_model.encode(texts, show_progress_bar=False)

        topic_model = BERTopic(
            embedding_model=embedding_model,
            language="russian",
            min_topic_size=2,
            verbose=False,
        )
        topics, _ = topic_model.fit_transform(texts, embeddings)

        freq = topic_model.get_topic_info()
        real_topics_df = freq[freq["Topic"] != -1]
        top_topics_df = real_topics_df.head(MAX_CLUSTERS)
        top_ids = top_topics_df["Topic"].tolist()

        remap_dict = {old_id: i for i, old_id in enumerate(top_ids)}

        qwen_results = {}
        for local_id in top_ids:
            keywords = [w[0] for w in topic_model.get_topic(local_id)[:10]]
            indices = [i for i, t in enumerate(topics) if t == local_id]

            sample_texts = [
                texts[i] for i in random.sample(indices, min(len(indices), 15))
            ]

            # Call the new Qwen-based generator
            info = generate_summary(keywords, sample_texts)
            qwen_results[local_id] = info
            print(f"Cluster {local_id} info: {info}")

            global_id = remap_dict[local_id] + topic_offset
            count = top_topics_df[top_topics_df["Topic"] == local_id]["Count"].values[0]

            cluster_summaries.append(
                {
                    "global_id": global_id,
                    "category": category,
                    "title": info.get("title", "No Title"),
                    "description": info.get("description", "No Description"),
                    "review_count": int(count),
                    "keywords": ", ".join(keywords),
                }
            )

        new_global_topics = []
        titles = []

        for t in topics:
            if t in remap_dict:
                new_global_topics.append(remap_dict[t] + topic_offset)
                titles.append(qwen_results[t]["title"])
            else:
                new_global_topics.append(-1)
                titles.append("Шум")

        subset["cluster_id"] = new_global_topics
        subset["cluster_title"] = titles

        n_neighbors = 15 if len(texts) > 15 else min(5, len(texts) - 1)
        if n_neighbors < 2:
            n_neighbors = 2

        reducer = umap.UMAP(
            n_neighbors=n_neighbors,
            n_components=2,
            min_dist=0.1,
            metric="cosine",
            random_state=42,
        )
        coords_2d = reducer.fit_transform(embeddings)
        subset["x"] = coords_2d[:, 0]
        subset["y"] = coords_2d[:, 1]

        result_frames.append(subset)

        if len(top_ids) > 0:
            topic_offset += len(top_ids)

    reviews = []
    clusters = []

    if result_frames:
        final_df = pd.concat(result_frames)

        classifier_model, tokenizer = get_classifier_model()

        cleaned = batch_clean_text(final_df["text"].tolist())
        batch = tokenizer(
            cleaned,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt",
        ).to(device)

        print("Estimating sentiment...")

        with torch.no_grad():
            logits = classifier_model(**batch).logits
            probs = torch.softmax(logits, dim=-1).cpu().tolist()
            labels = torch.argmax(logits, dim=-1).cpu().tolist()

        final_df["sentiment"] = [SENTIMENT_MAP[label] for label in labels]
        final_df["confidence"] = [p[label] for p, label in zip(probs, labels)]

        for _, row in final_df.iterrows():
            reviews.append(
                {
                    "source_id": str(row.get("ID", row.get("src", ""))),
                    "text": row["text"],
                    "sentiment": row["sentiment"],
                    "confidence": float(row["confidence"]),
                    "cluster_id": int(row["cluster_id"]),
                    "coords": {"x": float(row["x"]), "y": float(row["y"])},
                }
            )

    for summary in cluster_summaries:
        clusters.append(
            {
                "id": int(summary["global_id"]),
                "title": summary["title"],
                "summary": summary["description"],
            }
        )

    return {
        "status": "success",
        "reviews": reviews,
        "clusters": clusters,
    }
