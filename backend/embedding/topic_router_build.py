import os
from dotenv import load_dotenv
## disable Dynamo/compile
## torch.compile (Dynamo/Inductor) initialization being slow
## unstable in this stack, and ModernBERT is explicitly decorated with @torch.compile(dynamic=True).
os.environ["TORCHDYNAMO_DISABLE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
from pathlib import Path

from sentence_transformers import SentenceTransformer
#from huggingface_hub import InferenceClient

import numpy as np
import json
import time
import random
random.seed(42)

"""
processed documentations for embedding
cardio_emergency_docs
core_docs
gastro_emergency_docs
gen_emergency_docs
genit_emergency_docs
neuro_emergency_docs
obst_gynec_docs
trauma_emergency_docs
vasc_isch_docs
"""

load_dotenv()  # loads .env into os.environ

##docs = [
##    {"id": "d1", "text": "RAG combines retrieval and generation to answer questions."},
##    {"id": "d2", "text": "Embedding models map text to vectors for similarity search."},
##    {"id": "d3", "text": "OpenAI models generate text from a prompt (tokens), not embeddings."},
##]

#p = Path.home() / "Desktop" / "pubmed_data_by_topics" / "processed_json" / "general_emergencies.json"
#print(p.exists())   # MUST be True
#print(p.is_file())  # MUST be True

def load_docs_from_json(path: str | Path):
    time_counter = time.perf_counter()
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")
    
    data = json.loads(path.read_text(encoding="utf-8"))

    docs = []
    for i, rec in enumerate(data):
        topic = (rec.get("topic") or "").strip()
        title = (rec.get("title") or "").strip()
        abstract = (rec.get("abstract") or "").strip()
        if not title and not abstract and not topic:
            continue
        docs.append({
            "id": f"{path.stem}_{i:06d}",
            "topic": topic,
            "title": title,
            "abstract": abstract
        })
    print(f"loading successful at {path} in {time.perf_counter() - time_counter:.3f}s.")
    return docs

BASE_DIR = Path.home() / "nwhacks2026" / "nwhacks2026" / "pubmed_data_by_topics" / "processed_json"


## load processed documentations for embedding (manual)
#cardio_emergency_docs = load_docs_from_json(BASE_DIR / "cardiovascular_emergencies.json")
#core_docs = load_docs_from_json(BASE_DIR / "core_scope.json")
#gastro_emergency_docs = load_docs_from_json(BASE_DIR / "gastrointestinal_emergencies.json")
#gen_emergency_docs = load_docs_from_json(BASE_DIR / "general_emergencies.json")
#genit_emergency_docs = load_docs_from_json(BASE_DIR / "genitourinary_emergencies.json")
#neuro_emergency_docs = load_docs_from_json(BASE_DIR / "neurological_emergencies.json")
#obst_gynec_docs = load_docs_from_json(BASE_DIR / "obstetric_gynecologic_emergencies.json")
#trauma_emergency_docs = load_docs_from_json(BASE_DIR / "trauma_related_emergencies.json")
#vasc_isch_docs = load_docs_from_json(BASE_DIR / "vascular_ischemic_emergencies.json")

# ModernPubMedBERT (HuggingFace sentence transformer model)
#bertModel = SentenceTransformer("lokeshch19/ModernPubMedBERT")

## FAISS index + topic centroids
# topic centroids to represent the topics as a center point of clusters in vector space
## data clustering: 
# 1. average the vectors of all items (words, documents) within that cluster
# 2. find the central point

"""
1. Build one centroid per topic file (using embeddings of that file’s docs).

2. For a user query, embed it once and find the closest topic centroid.

3. Use that topic name to decide which JSON file to load (and then do FAISS retrieval inside that topic only).

To get a title at the center:

1. compute the centroid vector

2. find the document whose embedding is closest to the centroid

3. use that doc’s title as the “representative” title
"""

def build_topic_router(processed_dir: Path, 
                       model_name: str, 
                       max_docs_per_topic: int ,
                       out_dir: Path | None = None):
    model = SentenceTransformer(model_name)

    topics = []
    centroids = []
    repr_titles = []   # title closest to centroid
    topic_files = []   # file path per topic
    
    # thresholds
    MAX_ABS_CHARS = 600
    BATCH_SIZE = 16

    for topic_file in sorted(processed_dir.glob("*.json")):
        docs = load_docs_from_json(topic_file)

        # random sampling
        if max_docs_per_topic and len(docs) > max_docs_per_topic:
            docs = random.sample(docs, k=max_docs_per_topic)

        titles = [d["title"] for d in docs]
        texts = [
            f"{d['title']}\n\n{d['abstract'][:MAX_ABS_CHARS]}".strip()
            for d in docs
        ]
        if not texts:
            continue

        X = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True, show_progress_bar=True).astype("float32")

        # centroid = mean of normalized vectors, then renormalize
        c = X.mean(axis=0)
        c = c / (np.linalg.norm(c) + 1e-12)

        # representative doc = closest to centroid (max cosine similarity)
        sims = X @ c
        best_idx = int(np.argmax(sims))
        rep_title = docs[best_idx]["title"] or "(no title)"

        topics.append(topic_file.stem)
        centroids.append(c)
        repr_titles.append(rep_title)
        topic_files.append(str(topic_file))
        
        # free per-topic memory
        del docs, titles, texts, X, sims

    centroids = np.vstack(centroids).astype("float32")
    
    # Save artifacts so Stage 1 truly runs once
    if out_dir is not None:
        out_dir = Path(out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        np.save(out_dir / "topic_centroids.npy", centroids)
        with (out_dir / "topic_router.json").open("w", encoding="utf-8") as f:
            json.dump(
                {
                    "model_name": model_name,
                    "topics": topics,
                    "representative_titles": repr_titles,
                    "topic_files": topic_files,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )
        print(f"[SAVE] Router artifacts written to: {out_dir}")
    return model, topics, centroids, repr_titles, topic_files

# Route user query → pick topic file (no need to load all docs first)
def route_query_to_topic(model, topics, centroids, repr_titles, topic_files, user_query: str, top_n=3):
    q = model.encode([user_query], convert_to_numpy=True, normalize_embeddings=True).astype("float32")[0]
    sims = centroids @ q  # cosine similarity

    order = np.argsort(-sims)[:top_n]
    routed = []
    for i in order:
        routed.append({
            "topic": topics[i],
            "similarity": float(sims[i]),
            "representative_title": repr_titles[i],
            "file": topic_files[i],
        })
    return routed

OUT_DIR = Path.home() / "nwhacks2026" / "nwhacks2026" / "backend" / "embedding"

model, topics, centroids, repr_titles, topic_files = build_topic_router(BASE_DIR, "lokeshch19/ModernPubMedBERT", 300, OUT_DIR)





