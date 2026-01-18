import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["TORCHDYNAMO_DISABLE"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
# If you still get "libomp already initialized" abort:
# os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from pathlib import Path
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import topic_router as router

faiss.omp_set_num_threads(1)

def load_docs_from_json(path: str | Path):
    path = Path(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    docs = []
    for i, rec in enumerate(data):
        title = (rec.get("title") or "").strip()
        abstract = (rec.get("abstract") or "").strip()
        if not title and not abstract:
            continue
        docs.append({
            "id": f"{path.stem}_{i:06d}",
            "title": title,
            "abstract": abstract,
        })
    return docs

_FAISS_CACHE = {}  # topic_file -> (index, docs, X)

def get_topic_faiss(topic_file: str | Path, model: SentenceTransformer, batch_size: int = 8):
    topic_file = str(topic_file)
    if topic_file in _FAISS_CACHE:
        return _FAISS_CACHE[topic_file]

    docs = load_docs_from_json(topic_file)

    MAX_ABS_CHARS = 800
    texts = [f"{d['title']}\n\n{d['abstract'][:MAX_ABS_CHARS]}".strip() for d in docs]

    X = model.encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        batch_size=batch_size,
        show_progress_bar=False,
    ).astype("float32")

    index = faiss.IndexFlatIP(X.shape[1])
    index.add(X)

    _FAISS_CACHE[topic_file] = (index, docs, X)
    return index, docs, X

def retrieve_topk_in_topic(user_query: str, topic_file: str | Path, model: SentenceTransformer, k: int = 8):
    index, docs, _X = get_topic_faiss(topic_file, model)

    q = model.encode(
        [user_query],
        convert_to_numpy=True,
        normalize_embeddings=True,
        batch_size=1,
        show_progress_bar=True,
    ).astype("float32")

    scores, idxs = index.search(q, k)

    results = []
    for score, idx in zip(scores[0], idxs[0]):
        if idx == -1:
            continue
        d = docs[idx]
        results.append({
            "id": d["id"],
            "score": float(score),
            "title": d["title"],
            "abstract": d["abstract"],
        })
    return results

# Use SAME model as router artifacts
model = SentenceTransformer(router.model_name)

user_input = "patient has severe chest pain radiating to left arm, suspected MI"
candidates = router.route_query(user_input, top_n=1)

best_topic = candidates[0]
topic_file = best_topic["file"]

hits = retrieve_topk_in_topic(user_input, topic_file, model, k=8)

print("Routed topic:", best_topic["topic"])
for h in hits[:5]:
    print(f"{h['score']:.3f}", h["title"][:90])
