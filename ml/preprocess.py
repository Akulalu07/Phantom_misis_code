import html
import re
from typing import Dict, List, Optional

import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer, PreTrainedTokenizerBase


def load_csv(path: str, text_column: str = "text") -> pd.DataFrame:
    """
    Load a CSV file with utf-8 encoding and drop rows with missing text.
    """
    df = pd.read_csv(path)
    if text_column not in df.columns:
        raise ValueError(f"Column '{text_column}' not found in {path}")
    df = df.dropna(subset=[text_column]).reset_index(drop=True)
    return df


def clean_text(text: str) -> str:
    """
    Basic text cleanup:
    - HTML unescape
    - Remove HTML tags
    - Strip special characters except letters, digits, and basic punctuation
    - Collapse multiple whitespaces
    """
    text = html.unescape(str(text))
    text = re.sub(r"<[^>]+>", " ", text)  # remove HTML tags
    text = re.sub(r"[^\w\s.,!?;:()\"'-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def batch_clean_text(texts: List[str]) -> List[str]:
    return [clean_text(t) for t in texts]


def get_tokenizer(model_name: str, max_length: int = 256) -> PreTrainedTokenizerBase:
    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
    tokenizer.model_max_length = max_length
    return tokenizer


def tokenize_batch(
    examples: Dict[str, List[str]],
    tokenizer: PreTrainedTokenizerBase,
    max_length: int = 256,
) -> Dict[str, List[List[int]]]:
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=max_length,
    )


def prepare_dataset(
    csv_path: str,
    tokenizer: Optional[PreTrainedTokenizerBase] = None,
    model_name: Optional[str] = None,
    max_length: int = 256,
    text_column: str = "text",
    label_column: Optional[str] = "label",
) -> Dataset:
    """
    Load CSV, clean text, and convert to HuggingFace Dataset.
    If tokenizer is provided, tokenization is applied immediately.
    """
    if tokenizer is None:
        if model_name is None:
            raise ValueError("Either tokenizer or model_name must be provided.")
        tokenizer = get_tokenizer(model_name, max_length=max_length)

    df = load_csv(csv_path, text_column=text_column)
    df[text_column] = batch_clean_text(df[text_column].tolist())
    if label_column and label_column in df.columns:
        df[label_column] = df[label_column].astype(int)

    dataset = Dataset.from_pandas(df)
    dataset = dataset.rename_column(text_column, "text")
    if label_column and label_column in dataset.column_names:
        dataset = dataset.rename_column(label_column, "labels")

    keep_labels = {"labels"}
    dataset = dataset.map(
        lambda x: tokenize_batch(x, tokenizer=tokenizer, max_length=max_length),
        batched=True,
        remove_columns=[col for col in dataset.column_names if col not in keep_labels],
    )
    return dataset
