import argparse
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)

from preprocess import batch_clean_text


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run inference on test.csv")
    parser.add_argument("--model_dir", type=str, required=True, help="Path to trained model directory")
    parser.add_argument("--test_path", type=str, default="test.csv")
    parser.add_argument("--submission_path", type=str, default="submission.csv")
    parser.add_argument("--probs_path", type=str, default="test_probs.csv", help="Where to save per-class probabilities")
    parser.add_argument("--max_length", type=int, default=256)
    parser.add_argument("--batch_size", type=int, default=16)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    df = pd.read_csv(args.test_path)
    if "text" not in df.columns:
        raise ValueError("test.csv must contain a 'text' column")

    df["text"] = batch_clean_text(df["text"].tolist())

    dataset = Dataset.from_pandas(df.reset_index(drop=True))

    tokenizer = AutoTokenizer.from_pretrained(args.model_dir, use_fast=True)
    model = AutoModelForSequenceClassification.from_pretrained(args.model_dir).to(device)

    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=args.max_length,
        )

    remove_cols = [c for c in dataset.column_names if c != "ID"]
    tokenized_ds = dataset.map(tokenize_function, batched=True, remove_columns=remove_cols)
    tokenized_ds.set_format(type="torch")

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer, pad_to_multiple_of=8)

    training_args = TrainingArguments(
        output_dir="inference_tmp",
        per_device_eval_batch_size=args.batch_size,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    outputs = trainer.predict(tokenized_ds)
    logits = outputs.predictions
    probs = torch.softmax(torch.tensor(logits), dim=1).numpy()
    preds = np.argmax(logits, axis=1)

    submission = pd.DataFrame({"ID": df["ID"], "label": preds})
    submission.to_csv(args.submission_path, index=False)
    print("Submission saved to", args.submission_path)

    prob_cols = [f"prob_{i}" for i in range(probs.shape[1])]
    probs_df = pd.DataFrame({"ID": df["ID"]})
    for i, col in enumerate(prob_cols):
        probs_df[col] = probs[:, i]
    Path(args.probs_path).parent.mkdir(parents=True, exist_ok=True)
    probs_df.to_csv(args.probs_path, index=False)
    print("Per-class probabilities saved to", args.probs_path)


if __name__ == "__main__":
    main()
