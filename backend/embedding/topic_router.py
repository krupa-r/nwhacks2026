#import topic_router_build as router_init
import os
from dotenv import load_dotenv
## disable Dynamo/compile
## torch.compile (Dynamo/Inductor) initialization being slow
## unstable in this stack, and ModernBERT is explicitly decorated with @torch.compile(dynamic=True).
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TORCHDYNAMO_DISABLE"] = "1"
from pathlib import Path
#from huggingface_hub import InferenceClient

import numpy as np
import json
import time

import multiprocessing as mp
try:
    mp.set_start_method("spawn", force=True)
except RuntimeError:
    pass


from sentence_transformers import SentenceTransformer
# Paths
ROUTER_DIR = Path(__file__).parent
CENTROIDS_PATH = ROUTER_DIR / "topic_centroids.npy"
META_PATH = ROUTER_DIR / "topic_router.json"

# Load router artifacts
# ----------------------------
if not CENTROIDS_PATH.exists():
    raise FileNotFoundError(f"Missing centroids file: {CENTROIDS_PATH}")

if not META_PATH.exists():
    raise FileNotFoundError(f"Missing router metadata: {META_PATH}")

centroids = np.load(CENTROIDS_PATH).astype("float32")

with META_PATH.open("r", encoding="utf-8") as f:
    meta = json.load(f)

topics = meta["topics"]
representative_titles = meta["representative_titles"]
topic_files = meta["topic_files"]
model_name = meta["model_name"]

# ----------------------------
# Load embedding model (once)
# ----------------------------
model = SentenceTransformer(model_name)


# Route user query → pick topic file (no need to load all docs first)
def route_query(user_query: str, top_n: int = 1):
    """
    Returns top-N matching topics for the user query.
    """
    q = model.encode(
        [user_query],
        convert_to_numpy=True,
        normalize_embeddings=True,
    ).astype("float32")[0]

    sims = centroids @ q
    order = np.argsort(-sims)[:top_n]

    return [
        {
            "topic": topics[i],
            "similarity": float(sims[i]),
            "representative_title": representative_titles[i],
            "file": topic_files[i],
        }
        for i in order
    ]

#BASE_DIR = Path.home() / "nwhacks2026" / "nwhacks2026" / "pubmed_data_by_topics" / "processed_json"



user_query = "acute chest pain with shortness of breath and suspected myocardial infarction"

candidates = route_query(user_query, top_n=1)

print("Chosen topic: ", candidates[0]["topic"])
print("Similarity: ", round(candidates[0]["similarity"],2))
print("Using file: ", candidates[0]["file"])

#best = candidates[0]
#second_best = candidates[1]
#third_best = candidates[2]
#print(best)

# Load only the selected topic file
#topic_file = best["file"]

#print("Chosen topic:", best["topic"])
#print("Using file:", topic_file)
