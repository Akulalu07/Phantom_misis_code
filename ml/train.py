import argparse
import os
from typing import Dict

import numpy as np
import pandas as pd
import torch
from datasets import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from transformers import (
    AutoModelForSequenceClassification,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments,
)

from preprocess import batch_clean_text, get_tokenizer
from utils.metrics import macro_f1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train sentiment classifier")
    parser.add_argument("--train_path", type=str, default="train.csv", help="Path to train.csv")
    parser.add_argument("--model_name", type=str, required=True, help="HuggingFace model name or path")
    parser.add_argument("--output_dir", type=str, default="checkpoints", help="Where to save checkpoints")
    parser.add_argument("--max_length", type=int, default=256)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--learning_rate", type=float, default=2e-5)
    parser.add_argument("--num_epochs", type=int, default=2)
    parser.add_argument("--max_steps", type=int, default=-1, help="Limit total training steps (-1 to disable)")
    parser.add_argument("--eval_ratio", type=float, default=0.1, help="Validation split ratio; set 0 to disable eval")
    parser.add_argument("--no_eval", action="store_true", help="Disable evaluation to speed up quick runs")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--weight_decay", type=float, default=0.05)
    parser.add_argument("--warmup_ratio", type=float, default=0.1)
    parser.add_argument("--lr_scheduler_type", type=str, default="cosine")
    parser.add_argument("--label_smoothing", type=float, default=0.05)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=2)
    parser.add_argument("--eval_strategy", type=str, default="steps", help="steps|epoch|no (overridden if eval disabled)")
    parser.add_argument("--eval_steps", type=int, default=500)
    parser.add_argument("--save_strategy", type=str, default="steps", help="steps|epoch|no (overridden if eval disabled)")
    parser.add_argument("--save_steps", type=int, default=500)
    parser.add_argument("--fp16", action="store_true", help="Enable FP16 mixed precision (CUDA only)")
    parser.add_argument("--bf16", action="store_true", help="Enable BF16 mixed precision (Ampere GPU/CPU support)")
    return parser.parse_args()


def compute_metrics(eval_pred) -> Dict[str, float]:
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    metrics = macro_f1(preds, labels)
    metrics["accuracy"] = accuracy_score(labels, preds)
    return metrics


def main() -> None:
    args = parse_args()
    if args.fp16 and args.bf16:
        raise ValueError("Choose only one of fp16 or bf16.")

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cuda":
        torch.cuda.manual_seed_all(args.seed)
        torch.set_float32_matmul_precision("medium")
    print(f"Using device: {device}")

    df = pd.read_csv(args.train_path)
    if "label" not in df.columns:
        raise ValueError("train.csv must contain a 'label' column")

    df["text"] = batch_clean_text(df["text"].tolist())
    df["label"] = df["label"].astype(int)

    do_eval = not args.no_eval and args.eval_ratio > 0
    if do_eval:
        train_df, val_df = train_test_split(
            df,
            test_size=args.eval_ratio,
            stratify=df["label"],
            random_state=args.seed,
        )
    else:
        train_df, val_df = df, None

    tokenizer = get_tokenizer(args.model_name, max_length=args.max_length)

    train_ds = Dataset.from_pandas(train_df.reset_index(drop=True))
    val_ds = Dataset.from_pandas(val_df.reset_index(drop=True)) if val_df is not None else None

    label_names = {0: "negative", 1: "neutral", 2: "positive"}
    id2label = {i: label_names[i] for i in range(3)}
    label2id = {v: k for k, v in id2label.items()}

    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=args.max_length,
        )

    remove_cols = [c for c in train_ds.column_names if c not in {"label"}]
    train_ds = train_ds.map(tokenize_function, batched=True, remove_columns=remove_cols)
    val_ds = val_ds.map(tokenize_function, batched=True, remove_columns=remove_cols) if val_ds is not None else None
    train_ds = train_ds.rename_column("label", "labels")
    if val_ds is not None:
        val_ds = val_ds.rename_column("label", "labels")
    train_ds.set_format(type="torch")
    if val_ds is not None:
        val_ds.set_format(type="torch")

    model = AutoModelForSequenceClassification.from_pretrained(
        args.model_name,
        num_labels=3,
        id2label=id2label,
        label2id=label2id,
        use_safetensors=True,
    )

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer, pad_to_multiple_of=8)

    eval_strategy = "no" if not do_eval else args.eval_strategy
    save_strategy = "no" if not do_eval else args.save_strategy

    training_args = TrainingArguments(
        output_dir=args.output_dir,
        evaluation_strategy=eval_strategy,
        save_strategy=save_strategy,
        eval_steps=args.eval_steps if eval_strategy == "steps" else None,
        save_steps=args.save_steps if save_strategy == "steps" else None,
        logging_strategy="steps",
        logging_steps=50,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        num_train_epochs=args.num_epochs,
        max_steps=args.max_steps,
        weight_decay=args.weight_decay,
        warmup_ratio=args.warmup_ratio,
        lr_scheduler_type=args.lr_scheduler_type,
        label_smoothing_factor=args.label_smoothing,
        gradient_accumulation_steps=args.gradient_accumulation_steps,
        load_best_model_at_end=do_eval,
        metric_for_best_model="macro_f1",
        greater_is_better=True,
        save_total_limit=2,
        report_to="none",
        fp16=args.fp16,
        bf16=args.bf16,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics if do_eval else None,
    )

    trainer.train()
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print("Training complete. Best model saved to", os.path.abspath(args.output_dir))


if __name__ == "__main__":
    main()
