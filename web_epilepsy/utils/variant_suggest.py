# -*- coding: utf-8 -*-
"""Variant autocomplete, used by the main search box and the Variants filter of the Search list.
Only amino-acid substitutions (form R1319Q) are handled; cDNA notation is not.
Input may use one-letter (R13, R1319Q) or three-letter (Arg13, p.Arg1319Gln) notation; both are converted to a one-letter prefix for comparison.
"""
import re

AA3 = {'ala': 'A', 'arg': 'R', 'asn': 'N', 'asp': 'D', 'cys': 'C', 'gln': 'Q', 'glu': 'E', 'gly': 'G', 'his': 'H', 'ile': 'I',
       'leu': 'L', 'lys': 'K', 'met': 'M', 'phe': 'F', 'pro': 'P', 'ser': 'S', 'thr': 'T', 'trp': 'W', 'tyr': 'Y', 'val': 'V'}
AA1_TO_3 = {v: k.capitalize() for k, v in AA3.items()}
SUBST = re.compile(r'^[A-Z]\d+[A-Z]$')
_PARSE = re.compile(r'^(?:p\.)?([A-Za-z]{1,3}?)(\d+)([A-Za-z]{0,3})$', re.I)
_cache = {'n': None, 'rows': None}


def _aa(tok):
    """'R', 'r' (one letter) or 'Arg' (three letters) -> one-letter code. None if it cannot be interpreted"""
    if len(tok) == 1:
        return tok.upper() if tok.upper() in AA1_TO_3 else None
    return AA3.get(tok.lower())


def parse(q):
    """input -> (ref, position digits, alt or ''). None if it cannot be read as a variant prefix"""
    m = _PARSE.match((q or '').strip())
    if not m:
        return None
    ref = _aa(m.group(1))
    if not ref:
        return None
    alt = ''
    if m.group(3):
        alt = _aa(m.group(3))
        if not alt:
            return None
    return ref, m.group(2), alt


def _rows():
    """Full list of (gene, variant, position). The number of variants is small (thousands), so it is read once and read again when the row count changes."""
    from web_epilepsy.models import EplpAnlInfo
    qs = EplpAnlInfo.objects.exclude(vrat_info_letter__isnull=True).exclude(vrat_info_letter='')
    n = qs.count()
    if _cache['n'] != n:
        seen = set(qs.values_list('gene_nm', 'vrat_info_letter').distinct())
        rows = sorted(((g, v, int(re.sub(r'\D', '', v))) for g, v in seen if g and SUBST.match(v)), key=lambda r: (r[0], r[2], r[1]))
        _cache.update(n=n, rows=rows)
    return _cache['rows']


def genes():
    return {g.upper(): g for g, _, _ in _rows()}


def split_query(q, gene=None):
    """'SCN2A R13' -> ('SCN2A', 'R13'). If a gene is given separately, it is fixed to that gene."""
    q = (q or '').strip()
    known = genes()
    toks = q.split()
    if len(toks) >= 2 and toks[0].upper() in known:
        return known[toks[0].upper()], ' '.join(toks[1:])
    if gene and gene.upper() in known:
        return known[gene.upper()], q
    return None, q


def suggest(q, gene=None, limit=50):
    g, rest = split_query(q, gene)
    p = parse(rest.replace(' ', ''))
    if not p:
        return []
    ref, num, alt = p
    out = []
    for gn, v, pos in _rows():
        if g and gn != g:
            continue
        if v[0] != ref or not str(pos).startswith(num):
            continue
        if alt and v[-1] != alt:
            continue
        out.append({'gene': gn, 'variant': v, 'p3': 'p.%s%d%s' % (AA1_TO_3[v[0]], pos, AA1_TO_3.get(v[-1], v[-1])), 'value': '%s %s' % (gn, v)})
    # Positions whose digit count is close to the typed number (exact matches) first, then by position
    out.sort(key=lambda r: (str(int(re.sub(r'\D', '', r['variant']))) != num, r['gene'], int(re.sub(r'\D', '', r['variant']))))
    return out[:limit]
