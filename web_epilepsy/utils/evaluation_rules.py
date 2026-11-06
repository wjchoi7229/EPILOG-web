# -*- coding: utf-8 -*-
"""Variant Evaluation / Takeaway decision rules (rule set v1.2).

  Pathogenicity     : number of tools among REVEL / AlphaMissense / CADD at or above their threshold
                      (counted as a single PP3-like criterion; 3/3 only raises the displayed confidence)
  Functional effect : experimental (patch clamp etc.) > in silico (SCION, funNCion)
      Per-paper parameter synthesis (Result): LoF+GoF together -> Mixed / LoF(+Non-specific) -> LoF /
      GoF(+Non-specific) -> GoF / all Non-specific -> Non-specific
      Per-variant synthesis: human-channel results are used first; the per-paper Results are combined by the same rule.
  Concordance       : experimental direction vs in silico direction
                      (Concordant / Discordant / Partial agreement / Prediction disagreement / Not assessable)
  Confidence        : High / Moderate / Low

The thresholds are the same as those used by the Variant effects view (REVEL >= 0.75 / AlphaMissense > 0.564 / CADD >= 20).
"""

RULE_VERSION = 'v1.2'  # v1.2: Concordance has four categories (Partial agreement and Prediction disagreement were added); other calls are as in v1.1.

# Thresholds (same as on screen)
TH = {'REVEL': (0.75, 0.15), 'AlphaMissense': (0.564, 0.34), 'CADD': (20.0, 10.0)}  # (damaging: at or above, benign: at or below / below)
INSILICO_GENES = {'SCN1A', 'SCN2A', 'SCN8A'}  # genes covered by SCION/funNCion
FIXED_END = 'For research use; not a clinical classification.'
PHRASE = {
    'Concordant': 'Experimental and in silico evidence agree on the functional direction.',
    'Discordant': 'Experimental data take precedence; in silico direction should be interpreted with caution.',
    'Partial agreement': 'The experiment shows both LoF and GoF features and the in silico direction matches one of them.',
    'Prediction disagreement': 'The two in silico tools predict opposite directions, so the in silico direction is not usable.',
    'Mixed': 'The variant shows both LoF and GoF features; the net effect on neuronal excitability cannot be inferred from these parameters alone.',
    'No experimental data': 'Functional direction is based on in silico prediction only and awaits experimental confirmation.',
    'No data': 'No functional data are available for this variant yet.',
    'Not assessable': 'Experimental data are available, but no in silico direction model applies to this gene.',
}


def tokens(value):
    """Turns a value such as 'GOF / Non-specific' into {'GoF', 'Non-specific'}. Values without a direction (Altered etc.) are dropped."""
    out = set()
    if not value:
        return out
    for t in str(value).replace(';', '/').split('/'):
        t = t.strip()
        u = t.upper()
        if u == 'LOF' or u == 'LOF.':
            out.add('LoF')
        elif u == 'GOF':
            out.add('GoF')
        elif u.replace('-', ' ') == 'NON SPECIFIC':
            out.add('Non-specific')
    return out


def combine(token_sets):
    """Combines sets of parameter (or paper) level tokens by the synthesis rule. None if there is no value at all."""
    allt = set()
    for s in token_sets:
        allt |= s
    if not allt:
        return None
    if 'LoF' in allt and 'GoF' in allt:
        return 'Mixed'
    if 'LoF' in allt:
        return 'LoF'
    if 'GoF' in allt:
        return 'GoF'
    return 'Non-specific'


PARAMS = ('current_density', 'window_current', 'v_half_activation', 'v_half_inactivation', 'inactivation_tau', 'recovery_inactivation')
PARAM_LABEL = {'current_density': 'Current density', 'window_current': 'Window current', 'v_half_activation': 'Activation curve',
               'v_half_inactivation': 'Inactivation curve', 'inactivation_tau': 'Inactivation tau', 'recovery_inactivation': 'Recovery from inactivation',
               'current_density_het': 'Current density (heterozygous)', 'v_half_activation_het': 'Activation V1/2 (heterozygous)',
               'activation_kinetics': 'Activation kinetics', 'gaba_sensitivity': 'GABA sensitivity', 'max_current': 'Maximal current'}
EXTRA = ('current_density_het', 'v_half_activation_het', 'activation_kinetics', 'gaba_sensitivity', 'max_current')


def row_params(row):
    """Parameters used for a row, by gene family. GABA-A: GABA sensitivity + max current. Kv (KCNQ2): heterozygous first, else homozygous. Otherwise Nav list."""
    if getattr(row, 'gaba_sensitivity', None) or getattr(row, 'max_current', None):
        return ['gaba_sensitivity', 'max_current']
    het = [p for p in ('current_density_het', 'v_half_activation_het') if getattr(row, p, None)]
    if het:
        return het + (['activation_kinetics'] if getattr(row, 'activation_kinetics', None) else [])
    if getattr(row, 'activation_kinetics', None) or getattr(row, 'het_class', None):
        return ['current_density', 'v_half_activation', 'activation_kinetics']
    return list(PARAMS)


def row_result(row):
    """Result of one paper (one FunctionalAssayInfo row). Author overall call wins (rule 1)."""
    oc = tokens(getattr(row, 'overall_call', None))
    if oc:
        return combine([oc])
    return combine([tokens(getattr(row, p, None)) for p in row_params(row)])


def is_human(species):
    return (not species) or ('homo sapiens' in str(species).lower())


def pathogenicity(revel, am, cadd):
    """-> (call, number of tools at or above the threshold, number of tools with a value)"""
    vals = [('REVEL', revel), ('AlphaMissense', am), ('CADD', cadd)]
    avail = [(n, v) for n, v in vals if v is not None]
    if not avail:
        return 'No data', 0, 0
    above = sum(1 for n, v in avail if v >= TH[n][0] and not (n == 'AlphaMissense' and v == TH[n][0]))
    benign = sum(1 for n, v in avail if (v <= TH[n][1] if n == 'REVEL' else v < TH[n][1]))
    k = len(avail)
    if above * 3 >= 2 * k and above >= 1:
        return 'Likely damaging', above, k
    if benign * 3 >= 2 * k and benign >= 1:
        return 'Likely benign', above, k
    return 'Uncertain', above, k


def insilico_direction(scion, funncion):
    """GoF probability < 0.5 -> LoF, > 0.5 -> GoF. 'Conflicting' if the two tools disagree, None if there is no value. Returns (direction, near the boundary, strong agreement)."""
    dirs, probs = [], []
    for p in (scion, funncion):
        if p is not None:
            probs.append(p)
            dirs.append('GoF' if p > 0.5 else 'LoF')
    if not dirs:
        return None, False, False
    if len(set(dirs)) > 1:
        return 'Conflicting', True, False
    near = any(abs(p - 0.5) < 0.1 for p in probs)
    strong = len(probs) >= 2 and all(abs(p - 0.5) >= 0.2 for p in probs)
    return dirs[0], near, strong


def dedup_rows(rows):
    """Every sample row of the same variant carries the same evidence, so rows with identical content are counted once."""
    seen, out = set(), []
    for r in rows:
        key = (r.pmid, getattr(r, 'source', None), getattr(r, 'species', None), getattr(r, 'cell_system', None), getattr(r, 'overall_call', None)) + tuple(getattr(r, p, None) for p in PARAMS + EXTRA) + (getattr(r, 'persistent_current', None),)
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def exp_summary(rows, limit=4):
    """Experiment summary text and PMID list: one short 'PMID x: items with a direction' entry per paper (row)."""
    parts, pmids = [], []
    for r in rows[:limit]:
        items = []
        for p in row_params(r):
            tk = tokens(getattr(r, p, None))
            if tk - {'Non-specific'}:
                items.append('%s %s' % (PARAM_LABEL[p], '/'.join(sorted(tk - {'Non-specific'}, key=lambda x: ('LoF', 'GoF').index(x)))))
        res = row_result(r)
        pm = str(r.pmid or '').strip() or 'PMID not recorded'
        label = ('PMID ' + pm) if str(r.pmid or '').strip() else pm
        sp = getattr(r, 'species', None)
        if sp and 'sapiens' not in str(sp).lower():
            label += ' [%s channel]' % str(sp).split(',')[0].strip()
        parts.append('%s: %s' % (label, (', '.join(items) if items else 'all parameters Non-specific')))
        for t in str(r.pmid or '').split('/'):
            t = t.strip()
            if t and t not in pmids:
                pmids.append(t)
    more = len(rows) - limit
    text = '; '.join(parts) + ('; +%d more studies' % more if more > 0 else '')
    return text, pmids


DIR_MEANING = {'GoF': 'increased channel activity', 'LoF': 'reduced channel function'}


def interpretation(exp_effect, in_dir, conc, nonhuman_only=False, papers_disagree=False, population=False, approx=False):
    """Describes only the biological meaning of the result (calls, individual parameters and PMIDs are in the Evaluation cells and the detail area)."""
    pred = in_dir if in_dir in ('LoF', 'GoF') else None
    if exp_effect == 'Mixed':
        s = 'The variant shows both loss- and gain-of-function features across electrophysiological parameters, suggesting a complex functional effect rather than a uniform change in channel activity.'
        if pred:
            s += ' Computational predictions favor a %s effect, but the overall impact on neuronal excitability remains uncertain.' % pred
        else:
            s += ' The overall impact on neuronal excitability cannot be inferred from these parameters alone.'
    elif exp_effect in ('LoF', 'GoF'):
        s = 'Experimental data indicate a %s effect, i.e. %s.' % (exp_effect, DIR_MEANING[exp_effect])
        if conc == 'Concordant':
            s += ' In silico prediction points in the same direction, which strengthens this interpretation.'
        elif conc == 'Discordant':
            s += ' In silico prediction does not agree; the experimental data take precedence and the prediction should be interpreted with caution.'
        elif conc == 'Prediction disagreement':
            s += ' The two in silico tools disagree with each other, so the prediction does not cross-check this result.'
        else:
            s += ' No in silico direction model applies to this gene, so the experimental result is not cross-checked.'
    elif exp_effect == 'Non-specific':
        s = 'The reported parameters show no consistent gain- or loss-of-function direction, so a functional effect is not established by these experiments.'
        if pred:
            s += ' In silico prediction tends toward %s.' % pred
    elif pred:
        s = 'No experimental data are available. The in silico prediction suggests %s (%s), which awaits experimental confirmation.' % (pred, DIR_MEANING[pred])
    else:
        s = 'No functional data are available for this variant yet.'
    if exp_effect and papers_disagree:
        s += ' Results differ between studies.'
    if nonhuman_only and exp_effect:
        s += ' The evidence comes from a non-human channel only.'
    if population:
        s += ' This is a gnomAD population variant; a functional change does not by itself indicate disease association.'
    if exp_effect and approx:
        s += ' The experimental call was read approximately from a figure.'
    return '%s %s' % (s, FIXED_END)


def basis(evaluation, scores, assay_rows):
    """Basis text and details (per-paper parameters) shown below the four Evaluation cells. For display only; it does not change any call."""
    names = {'revel': 'REVEL', 'am': 'AlphaMissense', 'cadd': 'CADD'}
    above, below = [], []
    for k, n in names.items():
        v = scores.get(k)
        if v is None:
            continue
        hit = v >= TH[n][0] and not (n == 'AlphaMissense' and v == TH[n][0])
        (above if hit else below).append(n)
    path = ''
    if above or below:
        path = ('%s above threshold' % ', '.join(above)) if above else 'none above threshold'
        path += ' (%d/%d)' % (len(above), len(above) + len(below))
        if above and below:
            path += '; not above: ' + ', '.join(below)
    rows = dedup_rows(assay_rows)
    human = [r for r in rows if is_human(getattr(r, 'species', None))]
    use = human or rows
    detail, lof, gof = [], [], []
    for r in use:
        items = []
        for p in row_params(r):
            tk = tokens(getattr(r, p, None))
            if tk:
                lab = PARAM_LABEL[p]
                items.append((lab, '/'.join(sorted(tk, key=lambda x: ('LoF', 'GoF', 'Non-specific').index(x)))))
                if 'LoF' in tk and lab not in lof:
                    lof.append(lab)
                if 'GoF' in tk and lab not in gof:
                    gof.append(lab)
        detail.append({'pmid': str(getattr(r, 'pmid', '') or '').strip(), 'species': getattr(r, 'species', None) or '',
                       'source': getattr(r, 'source', None) or '', 'items': items, 'result': row_result(r) or '-'})
    func = ''
    if evaluation.function_source == 'experimental':
        bits = []
        if lof:
            bits.append('LoF %d (%s)' % (len(lof), ', '.join(lof)))
        if gof:
            bits.append('GoF %d (%s)' % (len(gof), ', '.join(gof)))
        func = '; '.join(bits) if bits else 'no directional parameter'
        func += ' - %d %s; each parameter is judged separately, not summed' % (len(use), 'study' if len(use) == 1 else 'studies')
    elif evaluation.function_source == 'in silico':
        func = 'In silico only: SCION / funNCion'
    exp = evaluation.eval_function if evaluation.function_source == 'experimental' else None
    conc = ''
    if exp or evaluation.insilico_direction:
        conc = 'Experimental: %s | Predicted: %s' % (exp or '-', evaluation.insilico_direction or '-')
        if exp == 'Mixed' and evaluation.insilico_direction in ('LoF', 'GoF'):
            conc += ' (Mixed includes the predicted direction: partial agreement)'
        elif evaluation.insilico_direction == 'Conflicting':
            conc += ' (SCION and funNCion disagree)'
    kinds = [k for k in ('experimental' if exp else None, 'in silico' if evaluation.insilico_direction else None) if k]
    conf = 'Functional-effect call from ' + (' + '.join(kinds) if kinds else 'none')
    if exp and evaluation.concordance == 'Discordant':
        conf += '; experiment and prediction disagree'
    elif exp and evaluation.concordance == 'Concordant':
        conf += '; experiment and prediction agree'
    elif exp and evaluation.concordance == 'Partial agreement':
        conf += '; prediction matches one of the mixed directions'
    elif exp and evaluation.concordance == 'Prediction disagreement':
        conf += '; the two prediction tools disagree'
    if exp and not human and rows:
        conf += '; non-human channel only'
    # Confidence rule (same as in evaluate): experiment + agreeing prediction + human channel + not read approximately from a figure = High; other experimental evidence = Moderate; in silico only = Moderate for a strong prediction.
    if exp:
        conf += '. Rule: High needs agreement with prediction, a human channel and non-approximated values'
    elif evaluation.insilico_direction in ('LoF', 'GoF'):
        conf += '. Rule: in silico only, Moderate only for a strong prediction'
    return {'path': path, 'func': func, 'conc': conc, 'conf': conf, 'detail': detail}


def evaluate(gene, scores, assay_rows, clinvar):
    """scores: dict(revel, am, cadd, scion, funncion). assay_rows: list of FunctionalAssayInfo. -> dict of values to store"""
    path, n_above, n_avail = pathogenicity(scores.get('revel'), scores.get('am'), scores.get('cadd'))
    assay_rows = dedup_rows(assay_rows)
    human_rows = [r for r in assay_rows if is_human(getattr(r, 'species', None))]
    use_rows = human_rows or list(assay_rows)
    nonhuman_only = bool(assay_rows) and not human_rows
    per_paper = [row_result(r) for r in use_rows]
    per_paper = [x for x in per_paper if x]
    exp_effect = combine([{x} if x != 'Mixed' else {'LoF', 'GoF'} for x in per_paper]) if per_paper else None
    papers_disagree = len({x for x in per_paper if x in ('LoF', 'GoF', 'Mixed')}) > 1

    in_dir, near, strong = insilico_direction(scores.get('scion'), scores.get('funncion')) if gene in INSILICO_GENES else (None, False, False)
    if exp_effect:
        func, source = exp_effect, 'experimental'
    elif in_dir in ('LoF', 'GoF'):
        func, source = in_dir, 'in silico'
    else:
        func, source = 'No data', None

    # Concordance
    if not exp_effect:
        conc = 'Not assessable'
    elif in_dir is None:
        conc = 'Not assessable'
    elif in_dir == 'Conflicting':
        conc = 'Prediction disagreement'  # the two tools disagree (the same whichever agrees with the experiment)
    elif exp_effect in ('LoF', 'GoF') and exp_effect == in_dir:
        conc = 'Concordant'
    elif exp_effect == 'Mixed':
        conc = 'Partial agreement'  # the experiment shows both LoF and GoF and the in silico direction is one of them
    else:
        conc = 'Discordant'  # directions differ, or the experiment is Mixed / Non-specific while in silico predicts one direction

    approx = bool(use_rows) and all(getattr(r, 'approximate', False) for r in use_rows)
    population = any(str(getattr(r, 'variant_set', '') or '').startswith('Population') for r in use_rows)

    # Confidence
    if exp_effect:
        if conc == 'Concordant' and not nonhuman_only and not approx:
            conf = 'High'
        else:
            conf = 'Moderate'
    elif in_dir in ('LoF', 'GoF'):
        conf = 'Moderate' if strong else 'Low'
    else:
        conf = 'Low'

    # Biological interpretation: values already shown in the four cells are not repeated; only the meaning of the result is written.
    takeaway = interpretation(exp_effect, in_dir, conc, nonhuman_only, papers_disagree, population, approx)

    return {
        'eval_pathogenicity': path, 'n_above': n_above, 'n_available': n_avail,
        'eval_function': func, 'function_source': source, 'insilico_direction': in_dir,
        'concordance': conc, 'confidence': conf, 'takeaway_auto': takeaway, 'rule_version': RULE_VERSION,
    }
