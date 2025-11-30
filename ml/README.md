# Sentiment Classification Service (API)

Проект решает задачу определения тональности (0 — негатив, 1 — нейтрально, 2 — позитив) для русскоязычных текстов. Предоставлен HTTP API на FastAPI и CLI-скрипты для инференса по CSV.

## Зависимости
- Python 3.9+
- Установите пакеты из `requirements.txt`: `pip install -r requirements.txt`  
  (для GPU используйте совместимую сборку PyTorch с вашей CUDA)

## Модель и файлы
- Каталог модели: `checkpoints` (перенесён из `checkpoints_tiny_tuned`). Внутри лежат `config.json`, `model.safetensors`, `tokenizer.json`, `vocab.txt`, `special_tokens_map.json`, `tokenizer_config.json`, `training_args.bin`.
- Переменная окружения `MODEL_DIR` указывает путь к каталогу модели (по умолчанию `checkpoints`).
- Переменная `MAX_LENGTH` задаёт максимальную длину токенизации (по умолчанию 256).

## Запуск API
```bash
export MODEL_DIR=checkpoints   # путь к весам/токенайзеру
export MAX_LENGTH=256          # опционально
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

### Эндпоинты
- `GET /health` — проверка работоспособности, ответ: `{"status": "ok"}`
- `POST /predict` — батчевый прогноз. Тело запроса:
```json
{"texts": ["пример отзыва", "другой текст"]}
```
Ответ:
```json
{
  "labels": [2, 0],
  "probs": [[0.01, 0.03, 0.96], [0.72, 0.18, 0.10]]
}
```

### Пример запроса
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"texts\": [\"Сервис понравился\", \"Это было плохо\"]}"
```

## CLI инференс по CSV
Для пакетной обработки `test.csv` используйте:
```bash
python infer_test.py \
  --model_dir checkpoints \
  --test_path test.csv \
  --submission_path submission.csv \
  --probs_path test_probs.csv
```

## Полезно знать
- Данные ожидаются в UTF-8. Для API текст очищается от HTML и нестандартных символов.
- Если хотите обновить веса, замените содержимое каталога `checkpoints` и перезапустите сервис.

## Архитектура
- **Артефакты модели**: дообученный `AutoModelForSequenceClassification` (3 класса) в каталоге `checkpoints/` (`model.safetensors`, `config.json`, `tokenizer*.json`, `vocab.txt`, `training_args.bin`).
- **Препроцессинг**: `preprocess.py` чистит текст (HTML-unescape, удаление тегов и шума), батчево токенизирует через HuggingFace и собирает `datasets.Dataset`.
- **Обучение**: `train.py` (CLI) оборачивает HF `Trainer`, считает `macro_f1`/`accuracy` из `utils/metrics.py`, сохраняет модель и токенайзер в `output_dir`.
- **Инференс**:
  - Пакетно по CSV: `infer_test.py` выдаёт `submission.csv` (`ID,label`) и `test_probs.csv` (вероятности по классам).
  - HTTP API: `api_server.py` (FastAPI) с `/health` и `/predict`, использует те же веса/токенайзер.
- **Оценка**: `evaluate.py` считает метрики на размеченном CSV, печатает classification report, по желанию сохраняет confusion matrix (`utils/plots.py`) и CSV с вероятностями.
- **Служебное**: `requirements.txt` с зависимостями; `.gitattributes` ведёт большие файлы (веса/CSV) через Git LFS.
