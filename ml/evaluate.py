import argparse
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from sklearn.metrics import accuracy_score, classification_report
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)

from preprocess import batch_clean_text
from utils.metrics import macro_f1
from utils.plots import plot_confusion_matrix


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate a trained sentiment model")
    parser.add_argument("--model_dir", type=str, required=True, help="Path to saved model directory")
    parser.add_argument("--eval_path", type=str, default="train.csv", help="Path to labeled CSV for evaluation")
    parser.add_argument("--max_length", type=int, default=256)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--save_probs", type=str, default="eval_outputs.csv", help="Where to save predictions + probabilities")
    parser.add_argument("--cm_path", type=str, default="confusion_matrix.png", help="Path to save confusion matrix PNG")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    df = pd.read_csv(args.eval_path)
    if "label" not in df.columns:
        raise ValueError("Evaluation CSV must contain 'label' column")

    df["text"] = batch_clean_text(df["text"].tolist())
    df["label"] = df["label"].astype(int)

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

    remove_cols = [c for c in dataset.column_names if c not in {"label"}]
    tokenized_ds = dataset.map(tokenize_function, batched=True, remove_columns=remove_cols)
    tokenized_ds = tokenized_ds.rename_column("label", "labels")
    tokenized_ds.set_format(type="torch")

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer, pad_to_multiple_of=8)

    training_args = TrainingArguments(
        output_dir="eval_tmp",
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
    labels = outputs.label_ids
    probs = torch.softmax(torch.tensor(logits), dim=1).numpy()
    preds = np.argmax(logits, axis=1)

    metrics = macro_f1(preds, labels)
    metrics["accuracy"] = accuracy_score(labels, preds)
    print("Evaluation metrics:", metrics)

    target_names = ["negative", "neutral", "positive"]
    report = classification_report(labels, preds, target_names=target_names, digits=4)
    print("\nClassification report:\n", report)

    cm_path = plot_confusion_matrix(labels, preds, labels=target_names, output_path=args.cm_path)
    print("Confusion matrix saved to", cm_path)

    prob_cols = [f"prob_{i}" for i in range(probs.shape[1])]
    out_df = df.copy()
    out_df["pred"] = preds
    for i, col in enumerate(prob_cols):
        out_df[col] = probs[:, i]
    Path(args.save_probs).parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(args.save_probs, index=False)
    print("Predictions with probabilities saved to", args.save_probs)


if __name__ == "__main__":
    main()
