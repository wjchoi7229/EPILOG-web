import json
import os

import numpy as np
import pandas as pd

# Downsamples the original PAE CSV (large matrices, e.g. 2005 x 2005) by grid averaging
# and converts it to the form {bin_size, size, data:[[x,y,value],...]}.
def downsample_pae_matrix(csv_path, target=200):
    # The first row is a column-index header, so it is read with header=0 and excluded.
    matrix = pd.read_csv(csv_path, header=0).to_numpy(dtype=float)

    n = matrix.shape[0]
    bin_size = max(1, n // target)
    trimmed_n = (n // bin_size) * bin_size
    trimmed = matrix[:trimmed_n, :trimmed_n]
    reshaped = trimmed.reshape(trimmed_n // bin_size, bin_size, trimmed_n // bin_size, bin_size)
    downsampled = reshaped.mean(axis=(1, 3))

    size = downsampled.shape[0]
    data = []
    for i in range(size):
        row = downsampled[i]
        for j in range(size):
            data.append([i * bin_size, j * bin_size, round(float(row[j]), 2)])

    return {'bin_size': bin_size, 'size': size, 'data': data}


# Path of the precomputed file that caches the downsampling result. One file per target (grid count),
# so that a request with another target never uses a wrong cache.
def downsampled_cache_path(csv_path, target=200):
    base, _ext = os.path.splitext(csv_path)
    return f'{base}_downsampled_t{target}.json'


# If the cache file exists it is read and returned (fast, no pandas/numpy work).
# Otherwise the result is computed from the original CSV, saved as a cache file and returned.
# (If cache files are precomputed elsewhere, only these files are needed on the web server: when the original CSV is missing,
# no computation is attempted and only the cache is used.)
def get_downsampled_pae(csv_path, target=200):
    cache_path = downsampled_cache_path(csv_path, target)

    if os.path.exists(cache_path):
        with open(cache_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    result = downsample_pae_matrix(csv_path, target)

    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(result, f)
    except OSError:
        # A failure to save the cache (e.g. a read-only deployment) does not affect the response.
        pass

    return result
