import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import numpy as np
import faiss

faiss.omp_set_num_threads(1)

X = np.random.randn(1000, 384).astype("float32")
faiss.normalize_L2(X)

index = faiss.IndexFlatIP(384)
index.add(X)

q = X[:1]
D, I = index.search(q, 5)
print(D[0], I[0])
