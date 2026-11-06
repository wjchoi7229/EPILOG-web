# -*- coding: utf-8 -*-
"""C-alpha RMSD and per-residue displacement between the wild-type and variant AF3 structures (ranked_0.pdb).
Only residue numbers present in both structures are paired and superposed with the Kabsch algorithm.
  rmsd     : RMSD after superposing all common residues
  rmsd_ss  : RMSD after superposing only residues that are helix/strand (DSSP) in both structures with pLDDT >= 70
             (low-confidence linkers/loops move between AF3 runs and inflate the RMSD, so they are left out)
  dist     : per-residue C-alpha displacement under the rmsd_ss superposition
"""
import os
import numpy as np
from web_epilepsy.utils import dssp_np

SS_PLDDT = 70.0
_ATOMS = ('N', 'CA', 'C', 'O')
_cache = {}


def read_backbone(path):
    """Reads {residue number: {N, CA, C, O coordinates, 'b': pLDDT}} from the first chain of a pdb file."""
    out = {}
    chain = None
    with open(path, 'r', errors='replace') as f:
        for line in f:
            if not line.startswith('ATOM'):
                continue
            name = line[12:16].strip()
            if name not in _ATOMS:
                continue
            if chain is None:
                chain = line[21]
            if line[21] != chain:
                continue
            try:
                r = out.setdefault(int(line[22:26]), {})
                r[name] = (float(line[30:38]), float(line[38:46]), float(line[46:54]))
                r['b'] = float(line[60:66])
            except ValueError:
                continue
    return {k: v for k, v in out.items() if all(a in v for a in _ATOMS)}


_bb_cache = {}


def _load(path):
    """(backbone, secondary structure) of one pdb file; the most recent few are remembered so that the same file (especially wild) is not read repeatedly"""
    key = (path, os.path.getmtime(path))
    if key not in _bb_cache:
        if len(_bb_cache) > 6:
            _bb_cache.clear()
        bb = read_backbone(path)
        _bb_cache[key] = (bb, _ss_of(bb))
    return _bb_cache[key]


def _ss_of(bb):
    keys = sorted(bb)
    X = np.array([[bb[k][a] for a in _ATOMS] for k in keys], dtype=float)
    ss = dssp_np.assign(X) if len(keys) >= 8 else np.full(len(keys), '-')
    return {k: s for k, s in zip(keys, ss)}


def _transform(V, W, mask):
    """Rotation and translation (Kabsch) from the mask residues: a coordinate x is moved to (x - pc) @ R.T + qc"""
    pc, qc = V[mask].mean(axis=0), W[mask].mean(axis=0)
    H = (V[mask] - pc).T @ (W[mask] - qc)
    U, _, Vt = np.linalg.svd(H)
    d = np.sign(np.linalg.det(Vt.T @ U.T))
    R = Vt.T @ np.diag([1.0, 1.0, d]) @ U.T
    return R, pc, qc


def _fit(V, W, mask):
    """Applies the transform obtained from the mask residues to all of V"""
    R, pc, qc = _transform(V, W, mask)
    return (V - pc) @ R.T + qc


def _rmsd(A, B):
    return float(np.sqrt(((A - B) ** 2).sum(axis=1).mean()))


def _d0(L):
    return 0.5 if L <= 21 else max(0.5, 1.24 * (L - 15) ** (1.0 / 3) - 1.8)


def tm_score(W, V, L_norm):
    """TM-score (Zhang & Skolnick 2004) of two C-alpha coordinate sets W (reference) and V with a fixed residue correspondence (same numbers).
    TM = (1/L) * sum_i 1 / (1 + (d_i/d0)^2), d0 = 1.24 (L-15)^(1/3) - 1.8 (L: number of residues of the reference (wild) structure).
    To find the superposition that maximises the TM-score, the superposition is refined iteratively from fragments of several lengths/positions using residues with small d_i (the same approach as the TM-score program).
    """
    n = len(W)
    d0 = _d0(L_norm)
    best = 0.0

    def score(mask):
        R, pc, qc = _transform(V, W, mask)
        d2 = ((((V - pc) @ R.T + qc) - W) ** 2).sum(axis=1)
        return float((1.0 / (1.0 + d2 / (d0 * d0))).sum() / L_norm), d2

    lengths = sorted({n} | {max(8, n // (2 ** k)) for k in range(1, 5)}, reverse=True)
    for lf in lengths:
        if lf > n:
            continue
        step = max(1, lf // 2, n // 20)
        starts = list(range(0, n - lf + 1, step))
        if starts[-1] != n - lf:
            starts.append(n - lf)
        for st in starts:
            mask = np.zeros(n, dtype=bool)
            mask[st:st + lf] = True
            prev = None
            for _ in range(20):
                sc, d2 = score(mask)
                best = max(best, sc)
                dcut = d0 + 1.5
                while True:
                    new = d2 < dcut * dcut
                    if new.sum() >= 3 or dcut > 1e3:
                        break
                    dcut += 0.5
                if prev is not None and np.array_equal(new, prev):
                    break
                prev = mask = new
    return best


def compare(wild_pdb, var_pdb, tm=True):
    """tm=False skips the (slow) TM-score. For analysis scripts that compute all variants at once."""
    key = (wild_pdb, os.path.getmtime(wild_pdb), var_pdb, os.path.getmtime(var_pdb), tm)
    if key in _cache:
        return _cache[key]
    (w, sw), (v, sv) = _load(wild_pdb), _load(var_pdb)
    common = sorted(set(w) & set(v))
    if len(common) < 3:
        return None
    W = np.array([w[k]['CA'] for k in common])
    V = np.array([v[k]['CA'] for k in common])
    everything = np.ones(len(common), dtype=bool)
    res = {'n': len(common), 'n_wild': len(w), 'n_variant': len(v)}
    res['rmsd'] = _rmsd(_fit(V, W, everything), W)
    core = np.array([sw[k] != '-' and sv[k] != '-' and w[k]['b'] >= SS_PLDDT and v[k]['b'] >= SS_PLDDT for k in common])
    T = _transform(V, W, core if core.sum() >= 3 else everything)
    fit = (V - T[1]) @ T[0].T + T[2]
    res['_T'] = T  # 3D viewer superposition transform (not included in the response)
    if core.sum() >= 3:
        res['rmsd_ss'] = _rmsd(fit[core], W[core])
        res['n_ss'] = int(core.sum())
    if tm:
        res['tm'] = tm_score(W, V, len(w))
    dist = np.linalg.norm(fit - W, axis=1)
    res['residues'] = [int(k) for k in common]
    res['dist'] = [round(float(x), 2) for x in dist]
    if len(_cache) > 64:
        _cache.clear()
    _cache[key] = res
    return res


def public_result(res):
    """Result of compare() without the internal values (starting with '_', e.g. the superposition transform), i.e. what is sent to the browser"""
    return {k: v for k, v in res.items() if not k.startswith('_')}


def alignment(wild_pdb, var_pdb):
    """Transform (R, pc, qc) that superposes the variant structure on the wild structure. None if it cannot be computed"""
    try:
        r = compare(wild_pdb, var_pdb)
    except Exception:
        return None
    return r.get('_T') if r else None
