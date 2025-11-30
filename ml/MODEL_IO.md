# Модель классификации тональности: вход/выход

## Что подается на вход
- Формат: CSV с колонкой `text` (обязательно). Для инференса теста также ожидается колонка `ID`, которая копируется в `submission`.
- Предварительная обработка:
  - HTML-unescape, удаление HTML-тегов.
  - Удаление спецсимволов, оставляя буквы/цифры/базовую пунктуацию.
  - Схлопывание повторных пробелов.
  - Токенизация `transformers.AutoTokenizer` выбранной модели (`--model_name`), `max_length=256`, `padding="max_length"`, `truncation=True`.

## Что делает модель
- Архитектура: `AutoModelForSequenceClassification` с `num_labels=3` (0 — отрицательная, 1 — нейтральная, 2 — положительная).
- Обучение: HuggingFace `Trainer`, критерий выбора чекпоинта — `macro_f1` на валидации (стратифицированный сплит 90/10), гиперпараметры: `batch_size=16`, `learning_rate=2e-5`, `epochs=4`.

## Что выдает на выходе
- Для оценки (`evaluate.py`):
  - Метрики: `macro_f1`, `accuracy`, `classification_report`.
  - Конфьюжен-матрица (`.png`).
  - CSV с исходными текстами, истинными метками, предсказаниями и вероятностями по каждому классу.
- Для инференса (`infer_test.py`):
  - `submission.csv` с колонками `ID,label` (целое 0/1/2).
  - `test_probs.csv` с `ID` и столбцами `prob_0`, `prob_1`, `prob_2` (вероятности софтмакса).

## Форматы
- Классы: `0` (neg), `1` (neu), `2` (pos).
- Вероятности: `float` в диапазоне [0,1], сумма по строке = 1.
- Токенизация: входные `input_ids`, `attention_mask` формируются внутри скриптов, пользователю их готовить не нужно.

## Минимальные шаги запуска
1) Установить зависимости (`torch`, `transformers`, `datasets`, `scikit-learn`, `pandas`, `numpy`, `matplotlib`).
2) Обучить: `python train.py --model_name <hf-model> --train_path train.csv --output_dir checkpoints`.
3) Оценить: `python evaluate.py --model_dir checkpoints --eval_path train.csv`.
4) Инференс теста: `python infer_test.py --model_dir checkpoints --test_path test.csv --submission_path submission.csv`.
