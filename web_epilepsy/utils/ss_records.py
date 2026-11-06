# -*- coding: utf-8 -*-
"""Tool that prepends DSSP secondary structure to an AF3 pdb (ranked_N.pdb) as standard PDB HELIX/SHEET records.

AF3 pdb files carry no HELIX/SHEET records, so iCn3D used to send the whole pdb (1-2 MB) to the server on every open, and the server
forwarded it to NCBI (mmcifparser) to compute the secondary structure (slow and dependent on an external server). With the records
attached in advance iCn3D makes no such call. The computation uses dssp_np (own DSSP implementation) and the resulting records are cached in a file.
"""
import hashlib
import os
import numpy as np
from django.conf import settings
from web_epilepsy.utils import dssp_np

_ATOMS = ('N', 'CA', 'C', 'O')


def _read(path):
    """Per-residue {number: (name, N/CA/C/O coordinates)} and the chain id of the first chain of a pdb"""
    res, chain = {}, None
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
                r = res.setdefault(int(line[22:26]), {'resn': line[17:20].strip()})
                r[name] = (float(line[30:38]), float(line[38:46]), float(line[46:54]))
            except ValueError:
                continue
    return {k: v for k, v in res.items() if all(a in v for a in _ATOMS)}, (chain or 'A')


def _runs(keys, ss, kind):
    """(start, end) intervals in which the same secondary structure (kind) continues over consecutive residue numbers"""
    out, start, prev = [], None, None
    for k, s in zip(keys, ss):
        if s == kind and (prev is not None and k == prev + 1 and start is not None):
            prev = k
            continue
        if start is not None:
            out.append((start, prev))
            start = None
        if s == kind:
            start = prev = k
        else:
            prev = k
    if start is not None:
        out.append((start, prev))
    return out


def _rec(items):
    line = [' '] * 80
    for pos, text in items:
        line[pos:pos + len(text)] = text
    return ''.join(line).rstrip() + '\n'


def ss_records(path):
    """HELIX/SHEET record string (empty string if it cannot be computed)"""
    res, ch = _read(path)
    keys = sorted(res)
    if len(keys) < 8:
        return ''
    ss = dssp_np.assign(np.array([[res[k][a] for a in _ATOMS] for k in keys], dtype=float))
    out = []
    for i, (a, b) in enumerate(_runs(keys, ss, 'H'), 1):
        out.append(_rec([(0, 'HELIX'), (7, '%3d' % i), (11, '%3d' % i), (15, '%3s' % res[a]['resn']), (19, ch), (21, '%4d' % a),
                         (27, '%3s' % res[b]['resn']), (31, ch), (33, '%4d' % b), (38, ' 1'), (71, '%5d' % (b - a + 1))]))
    for i, (a, b) in enumerate(_runs(keys, ss, 'E'), 1):
        out.append(_rec([(0, 'SHEET'), (7, '%3d' % i), (11, 'S%02d' % 1), (14, ' 1'), (17, '%3s' % res[a]['resn']), (21, ch), (22, '%4d' % a),
                         (28, '%3s' % res[b]['resn']), (32, ch), (33, '%4d' % b), (38, ' 0')]))
    return ''.join(out)


def _cache_file(path):
    base = os.path.join(settings.BASE_DIR, 'data', 'ss_cache')
    key = hashlib.sha1(('%s|%s|%s' % (os.path.realpath(path), os.path.getmtime(path), os.path.getsize(path))).encode()).hexdigest()
    return base, os.path.join(base, key + '.txt')


def _apply_transform(raw, T):
    """Applies (x - pc) @ R.T + qc to the coordinates of all ATOM/HETATM records of the pdb text (bytes)"""
    R, pc, qc = T
    lines = raw.decode('latin-1').split(chr(10))
    idx = [i for i, l in enumerate(lines) if l.startswith(('ATOM', 'HETATM')) and len(l) >= 54]
    if not idx:
        return raw
    X = np.array([[float(lines[i][30:38]), float(lines[i][38:46]), float(lines[i][46:54])] for i in idx])
    Y = (X - pc) @ R.T + qc
    for i, (x, y, z) in zip(idx, Y):
        lines[i] = lines[i][:30] + '%8.3f%8.3f%8.3f' % (x, y, z) + lines[i][54:]
    return chr(10).join(lines).encode('latin-1')


def pdb_with_ss(path, transform=None):
    """pdb file content (bytes) with HELIX/SHEET records prepended. The original is returned unchanged if anything goes wrong.
    If transform (R, pc, qc) is given, the coordinates are moved by it (used to orient the variant structure like the wild structure).
    """
    with open(path, 'rb') as f:
        raw = f.read()
    if transform is not None:
        try:
            raw = _apply_transform(raw, transform)
        except Exception:
            with open(path, 'rb') as f:
                raw = f.read()
    if b'\nHELIX' in raw[:2000] or raw.startswith(b'HELIX'):
        return raw
    try:
        base, cache = _cache_file(path)
        if os.path.isfile(cache):
            with open(cache, 'r') as f:
                recs = f.read()
        else:
            recs = ss_records(path)
            try:
                os.makedirs(base, exist_ok=True)
                tmp = cache + '.%d.tmp' % os.getpid()
                with open(tmp, 'w') as f:
                    f.write(recs)
                os.replace(tmp, cache)
            except OSError:
                pass
        return recs.encode() + raw
    except Exception:
        return raw
