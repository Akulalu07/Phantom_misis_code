from pathlib import Path
from typing import Iterable, List

import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import ConfusionMatrixDisplay, confusion_matrix


def plot_confusion_matrix(
    y_true: Iterable[int],
    y_pred: Iterable[int],
    labels: List[str],
    output_path: str = "confusion_matrix.png",
) -> str:
    """
    Plot and save a confusion matrix.
    Returns the saved file path.
    """
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(labels))))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
    fig, ax = plt.subplots(figsize=(6, 6))
    disp.plot(ax=ax, cmap="Blues", colorbar=False, values_format="d")
    plt.xticks(rotation=45)
    plt.tight_layout()

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=200)
    plt.close(fig)
    return str(output_path)

