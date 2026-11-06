# -*- coding: utf-8 -*-
"""Local (neighbourhood) structural-difference metrics. The wild-type and variant AF3 structures (ranked_0.pdb) are compared on the same basis.
Neighbourhood = residues whose C-alpha lies within 10 A of the variant residue C-alpha in the wild-type structure (including the variant residue).

  local_rmsd      : root mean square of the C-alpha displacement of the neighbourhood residues (superposition as in rmsd_utils)
  plddt           : pLDDT of the variant residue / mean pLDDT of the neighbourhood (wild, variant)
  contacts        : number of C-alpha pairs within 8 A (sequence separation >= 3) with at least one residue in the neighbourhood;
                    gained / lost pairs
  backbone_hbonds : number of backbone N...O pairs within 3.5 A between neighbourhood residues (sequence separation >= 3)
  clashes         : number of heavy-atom pairs of neighbourhood residues closer than 2.2 A with sequence separation >= 2
                    (disulfide S-S excluded; no hydrogen atoms)
  polar_contacts  : number of N/O heavy-atom pairs (backbone + side chain) within 3.5 A, sequence separation >= 2
  salt_bridges    : number of residue pairs with an Asp/Glu carboxyl O and a Lys/Arg positively charged N within 4.0 A
  hydrophobic     : number of residue pairs of non-polar residues (A V L I M F W P) with side-chain C-C within 4.5 A (separation >= 3)
  clashscore      : pairs with heavy-atom vdW overlap (radius sum - distance) of at least 0.4 A / number of neighbourhood atoms x 1000
                    (not a MolProbity value because there are no hydrogen atoms)
  pae_site        : mean PAE between the variant residue and the neighbourhood residues (A, mean of both directions)
These compare AF3 predictions with each other and do not directly demonstrate a real structural or stability change.
"""
import re
import numpy as np

RADIUS = 10.0
CONTACT = 8.0
HB = 3.5
CLASH = 2.2
VDW = {'C': 1.7, 'N': 1.55, 'O': 1.52, 'S': 1.8}
POS_N = {'LYS': ('NZ',), 'ARG': ('NE', 'NH1', 'NH2')}
NEG_O = {'ASP': ('OD1', 'OD2'), 'GLU': ('OE1', 'OE2')}
NONPOLAR = {'ALA', 'VAL', 'LEU', 'ILE', 'MET', 'PHE', 'TRP', 'PRO'}
_cache = {}


def read_atoms(path):
    """{residue number: {'name': residue name, 'atoms': {atom name: (x,y,z)}, 'b': CA pLDDT}} from the first chain of a pdb file"""
    out, chain = {}, None
    with open(path, 'r', errors='replace') as f:
        for line in f:
            if not line.startswith('ATOM'):
                continue
            if chain is None:
                chain = line[21]
            if line[21] != chain:
                continue
            el = line[76:78].strip() or line[12:16].strip()[:1]
            if el == 'H':
                continue
            try:
                r = out.setdefault(int(line[22:26]), {'name': line[17:20], 'atoms': {}, 'b': None})
                nm = line[12:16].strip()
                r['atoms'][nm] = (float(line[30:38]), float(line[38:46]), float(line[46:54]))
                if nm == 'CA':
                    r['b'] = float(line[60:66])
            except ValueError:
                continue
    return out


def _load(path):
    import os
    key = (path, os.path.getmtime(path))
    if key not in _cache:
        if len(_cache) > 6:
            _cache.clear()
        _cache[key] = read_atoms(path)
    return _cache[key]


def _contact_set(s, keys, sphere):
    ks = [k for k in keys if 'CA' in s[k]['atoms']]
    X = np.array([s[k]['atoms']['CA'] for k in ks])
    D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=2)
    out = set()
    ii, jj = np.where(np.triu(D < CONTACT, 1))
    for a, b in zip(ii, jj):
        if abs(ks[a] - ks[b]) >= 3 and (ks[a] in sphere or ks[b] in sphere):
            out.add((ks[a], ks[b]))
    return out


def _hbonds(s, sphere):
    ks = [k for k in sorted(sphere) if 'N' in s[k]['atoms'] or 'O' in s[k]['atoms']]
    N = [(k, s[k]['atoms']['N']) for k in ks if 'N' in s[k]['atoms']]
    O = [(k, s[k]['atoms']['O']) for k in ks if 'O' in s[k]['atoms']]
    n = 0
    for kn, pn in N:
        for ko, po in O:
            if abs(kn - ko) >= 3 and np.linalg.norm(np.array(pn) - np.array(po)) < HB:
                n += 1
    return n


def _clashes(s, sphere):
    ks = sorted(sphere)
    atoms = [(k, nm, p) for k in ks for nm, p in s[k]['atoms'].items()]
    if not atoms:
        return 0
    X = np.array([a[2] for a in atoms])
    D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=2)
    n = 0
    ii, jj = np.where(np.triu(D < CLASH, 1))
    for a, b in zip(ii, jj):
        ka, na, _ = atoms[a]
        kb, nb, _ = atoms[b]
        if abs(ka - kb) < 2:
            continue
        if na == 'SG' and nb == 'SG':
            continue
        n += 1
    return n


def _pairs(s, sphere, names, cutoff, min_gap):
    """Set of (residue, residue) pairs within cutoff among atom pairs of residues in the sphere that match names (atom name -> allowed function)"""
    atoms = [(k, nm, p) for k in sorted(sphere) for nm, p in s[k]['atoms'].items() if names(s[k]['name'], nm)]
    if len(atoms) < 2:
        return set()
    X = np.array([a[2] for a in atoms])
    D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=2)
    out = set()
    ii, jj = np.where(np.triu(D < cutoff, 1))
    for a, b in zip(ii, jj):
        if abs(atoms[a][0] - atoms[b][0]) >= min_gap:
            out.add((atoms[a][0], atoms[b][0], atoms[a][1], atoms[b][1]))
    return out


def _interactions(s, sphere):
    """Number of polar contacts, salt bridges and hydrophobic contact pairs, and the clashscore"""
    polar = len(_pairs(s, sphere, lambda r, n: n[0] in 'NO' and n not in ('OXT',), HB, 2))
    pos = {(r, n) for r, ns in POS_N.items() for n in ns}
    neg = {(r, n) for r, ns in NEG_O.items() for n in ns}
    sb = {(a, b) for a, b, na, nb in _pairs(s, sphere, lambda r, n: (r, n) in pos or (r, n) in neg, 4.0, 2)
          if ((s[a]['name'], na) in pos and (s[b]['name'], nb) in neg) or ((s[a]['name'], na) in neg and (s[b]['name'], nb) in pos)}
    bb = ('N', 'C', 'O', 'CA', 'OXT')
    hyd = {(a, b) for a, b, _, _ in _pairs(s, sphere, lambda r, n: r in NONPOLAR and n[0] == 'C' and n not in bb, 4.5, 3)}
    atoms = [(k, nm, p) for k in sorted(sphere) for nm, p in s[k]['atoms'].items()]
    score = 0.0
    if atoms:
        X = np.array([a[2] for a in atoms])
        R = np.array([VDW.get(a[1][0], 1.7) for a in atoms])
        D = np.linalg.norm(X[:, None, :] - X[None, :, :], axis=2)
        ov = (R[:, None] + R[None, :]) - D
        n = 0
        for a, b in zip(*np.where(np.triu(ov >= 0.4, 1))):
            if abs(atoms[a][0] - atoms[b][0]) < 2 or (atoms[a][1] == 'SG' and atoms[b][1] == 'SG'):
                continue
            n += 1
        score = round(n / len(atoms) * 1000, 1)
    return polar, len(sb), len(hyd), score


def _pae_site(pdb, pos, sphere):
    """Mean PAE (both directions) between the variant residue and the neighbourhood residues from the downsampled PAE in the same folder (ranked_0_pae_downsampled_t200.json, grid average). Variant folders contain only this file per structure.
    Residues closer than the grid resolution (residue count / 200) share a cell, so values are smoothed. None if the file is missing.
    """
    import json
    import os
    f = os.path.join(os.path.dirname(pdb), 'ranked_0_pae_downsampled_t200.json')
    if not os.path.isfile(f):
        return None
    try:
        d = json.load(open(f))
        bs, n = d['bin_size'], d['size']
        M = np.zeros((n, n))
        for x, y, val in d['data']:
            M[x // bs, y // bs] = val
        i = pos // bs
        idx = sorted({k // bs for k in sphere if k != pos and k // bs < n})
        if i >= n or not idx:
            return None
        return round(float((M[i, idx].mean() + M[idx, i].mean()) / 2), 2)
    except Exception:   # noqa: BLE001
        return None


def _mean_plddt(s, keys):
    v = [s[k]['b'] for k in keys if s[k]['b'] is not None]
    return round(float(np.mean(v)), 1) if v else None


def analyze(wild_pdb, var_pdb, variant, rm):
    """variant: form 'R1319Q'; rm: result of rmsd_utils.compare() (includes residues and dist). None if it cannot be computed"""
    m = re.fullmatch(r'[A-Z](\d+)[A-Z]', variant or '')
    if not m:
        return None
    pos = int(m.group(1))
    w, v = _load(wild_pdb), _load(var_pdb)
    if pos not in w or 'CA' not in w[pos]['atoms'] or pos not in v:
        return None
    c0 = np.array(w[pos]['atoms']['CA'])
    sphere = {k for k, r in w.items() if 'CA' in r['atoms'] and np.linalg.norm(np.array(r['atoms']['CA']) - c0) <= RADIUS}
    common = set(w) & set(v)
    sph_c = sphere & common
    dist = dict(zip(rm['residues'], rm['dist']))
    d = [dist[k] for k in sph_c if k in dist]
    res = {'position': pos, 'radius': RADIUS, 'n_residues': len(sphere),
           'local_rmsd': round(float(np.sqrt(np.mean(np.square(d)))), 2) if d else None,
           'site_displacement': dist.get(pos),
           'plddt_site': [w[pos]['b'], v[pos]['b']],
           'plddt_local': [_mean_plddt(w, sphere), _mean_plddt(v, sph_c)]}
    cw, cv = _contact_set(w, sorted(common), sph_c), _contact_set(v, sorted(common), sph_c)
    res['contacts'] = {'wild': len(cw), 'variant': len(cv), 'gained': len(cv - cw), 'lost': len(cw - cv)}
    res['backbone_hbonds'] = [_hbonds(w, sph_c), _hbonds(v, sph_c)]
    res['clashes'] = [_clashes(w, sph_c), _clashes(v, sph_c)]
    iw, iv = _interactions(w, sph_c), _interactions(v, sph_c)
    res['polar_contacts'] = [iw[0], iv[0]]
    res['salt_bridges'] = [iw[1], iv[1]]
    res['hydrophobic'] = [iw[2], iv[2]]
    res['clashscore'] = [iw[3], iv[3]]
    res['pae_site'] = [_pae_site(wild_pdb, pos, sphere), _pae_site(var_pdb, pos, sph_c)]
    res['residue_names'] = [w[pos]['name'], v[pos]['name']]
    return res


def local_fit(wild_pdb, var_pdb, variant):
    """Aligns the two structures using only the neighbourhood of the variant (within 10 A C-alpha in WT, residues present in both structures) and returns the C-alpha RMSD of those residues and the C-alpha displacement at the variant position (A).
    Unlike the global alignment (compare) it is not affected by domain movements. None if it cannot be computed.
    """
    from web_epilepsy.utils import rmsd_utils
    m = re.fullmatch(r'[A-Z](\d+)[A-Z]', variant or '')
    if not m:
        return None
    pos = int(m.group(1))
    (w, _), (x, _) = rmsd_utils._load(wild_pdb), rmsd_utils._load(var_pdb)
    if pos not in w or pos not in x:
        return None
    c0 = np.array(w[pos]['CA'])
    keys = sorted(k for k in set(w) & set(x) if np.linalg.norm(np.array(w[k]['CA']) - c0) <= RADIUS)
    if len(keys) < 5:
        return None
    W = np.array([w[k]['CA'] for k in keys])
    V = np.array([x[k]['CA'] for k in keys])
    fit = rmsd_utils._fit(V, W, np.ones(len(keys), dtype=bool))
    i = keys.index(pos)
    return {'rmsd': round(rmsd_utils._rmsd(fit, W), 3), 'site': round(float(np.linalg.norm(fit[i] - W[i])), 3), 'n': len(keys)}
