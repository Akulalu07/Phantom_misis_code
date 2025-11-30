from typing import Dict

import numpy as np
from sklearn.metrics import f1_score


def macro_f1(preds: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    """
    Compute macro-averaged F1 score.
    """
    score = f1_score(labels, preds, average="macro")
    return {"macro_f1": score}

