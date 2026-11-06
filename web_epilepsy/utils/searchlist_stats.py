import re
from collections import Counter

from web_epilepsy.models import EplpAnlInfo

# Phenotype code table (the "standardization" sheet of the review workbook).
# The code range used differs per gene (e.g. SCN2A 1-5, KCNQ2 8/9, EEF1A2 12-14), but the whole table is shared.
# main_phtype_code_nm() knows only the SCN2A codes 1-5 and returns an empty value for other genes,
# so all codes are handled here.
PHENOTYPE_CODE_MAP = {
    '1': 'DEE early onset',
    '2': 'DEE late onset',
    '3': 'BFINS/Self limiting',
    '4': 'ID/ASD/Schizophrenia',
    '5': 'Episodic ataxia without seizure',
    '6': 'Unknown',
    '7': 'NA',
    '8': 'DEE without IESS',
    '9': 'SeLNE',
    '10': 'ID with epilepsy',
    '11': 'ID without epilepsy',
    '12': 'DEE',
    '13': 'Other epilepsy',
    '14': 'Non-seizure type',
    '15': 'seizure',
}


def phenotype_label(code):
    if not code:
        return None
    code = code.strip()
    if code.upper() == 'NA':
        return None
    return PHENOTYPE_CODE_MAP.get(code, f'Other (code {code})')


# Parsing of onset_selzure_age (onset_age_to_days) lives in the Django-independent age_parse.py.
# The import path used here is unchanged.
from web_epilepsy.utils.age_parse import onset_age_to_days  # noqa: F401


# Split into clinically meaningful bins.
def onset_age_bucket(raw):
    days = onset_age_to_days(raw)
    if days is None:
        return None
    if days < 30:
        return '<30 days'
    if days < 90:
        return '1-3 months'
    if days < 365:
        return '3-12 months'
    if days < 365 * 2:
        return '1-2 years'
    if days < 365 * 5:
        return '2-5 years'
    return '5+ years'


_FU_COMBO_RE = re.compile(
    r'^(\d+(?:\.\d+)?)\s*y(?:r|rs|ear|ears)?\.?\s*(\d+(?:\.\d+)?)\s*m(?:o|os|onth|onths)?$'
)
_FU_SINGLE_RE = re.compile(
    r'^>?\s*~?\s*(\d+(?:\.\d+)?)\s*'
    r'(day|days|d|week|weeks|wk|wks|month|months|mo|mos|m|year|years|yr|yrs|y)\+?\.?$'
)


# last_flup_age is free text with mixed units such as "3y10m", "81m", ">4y", "6 week", "2.5 yrs".
# It is converted to years and binned. Unrecognised formats are skipped.
def followup_age_years(raw):
    if not raw:
        return None
    s = raw.strip().lower().replace('~', '').replace(' ', '')
    if s in ('na', 'n/a', ''):
        return None

    m = _FU_COMBO_RE.match(s)
    if m:
        years = float(m.group(1)) + float(m.group(2)) / 12
        return years

    m = _FU_SINGLE_RE.match(s)
    if m:
        val = float(m.group(1))
        unit = m.group(2)
        if unit in ('day', 'days', 'd'):
            return val / 365
        if unit in ('week', 'weeks', 'wk', 'wks'):
            return val * 7 / 365
        if unit in ('month', 'months', 'mo', 'mos', 'm'):
            return val / 12
        return val  # year variants
    return None


def followup_age_bucket(raw):
    years = followup_age_years(raw)
    if years is None:
        return None
    if years < 1:
        return '<1 year'
    if years < 2:
        return '1-2 years'
    if years < 5:
        return '2-5 years'
    if years < 10:
        return '5-10 years'
    return '10+ years'


def top_n_with_other(counter, n=8, other_label='Other'):
    items = counter.most_common()
    top = items[:n]
    rest_total = sum(c for _, c in items[n:])
    result = list(top)
    if rest_total > 0:
        result.append((other_label, rest_total))
    return result


# Real data for the four charts shown on the Search List page (between the chromosome image and the table).
# Only the four items that match the per-gene Phenotype Review specification are handled:
#Age at seizure onset / Age at last follow-up / Phenotype / Source in PMID(Publication link)
def _first_by_seq(queryset, *fields):
    """From the linked table, take only the first row per EplpAnlInfo (by pk) and build {eplp_seq: (field values...)}.
    (Calling .first() three times per row used to issue about 16,000 queries for 5,000 rows such as SCN1A, taking about 17 s; this takes three queries.)
    """
    out = {}
    for row in queryset.order_by('pk').values_list('eplp_anl_info_seq_id', *fields):
        out.setdefault(row[0], row[1:])
    return out


_SUMMARY_CACHE = {}


def _db_stamp():
    # The cache is invalidated automatically when the database file changes (e.g. after a data update script).
    try:
        from django.conf import settings
        import os
        return os.path.getmtime(str(settings.DATABASES['default']['NAME']))
    except Exception:
        return None


def get_search_gene_summary(gene_nm):
    stamp = _db_stamp()
    hit = _SUMMARY_CACHE.get(gene_nm)
    if hit and stamp is not None and hit[0] == stamp:
        return hit[1]
    result = _compute_search_gene_summary(gene_nm)
    if stamp is not None:
        _SUMMARY_CACHE[gene_nm] = (stamp, result)
    return result


def _compute_search_gene_summary(gene_nm):
    from web_epilepsy.models import AtonsetInfo, PrgssInfo, LtrtreInfo
    qs = EplpAnlInfo.objects.filter(gene_nm=gene_nm)

    onset_counter = Counter()
    fu_counter = Counter()
    phenotype_counter = Counter()
    pub_link_counter = Counter()

    seqs = list(qs.values_list('eplp_anl_info_seq', flat=True))
    at_map = _first_by_seq(AtonsetInfo.objects.filter(eplp_anl_info_seq__gene_nm=gene_nm), 'onset_selzure_age')
    pr_map = _first_by_seq(PrgssInfo.objects.filter(eplp_anl_info_seq__gene_nm=gene_nm),
                           'last_flup_age', 'main_phtype_code', 'phenotype_review_category')
    lt_map = _first_by_seq(LtrtreInfo.objects.filter(eplp_anl_info_seq__gene_nm=gene_nm), 'pblcate_link', 'pmid')

    for seq in seqs:
        at = at_map.get(seq)
        pr = pr_map.get(seq)
        lt = lt_map.get(seq)

        if at:
            b = onset_age_bucket(at[0])
            if b:
                onset_counter[b] += 1

        if pr:
            last_flup_age, main_phtype_code, phenotype_review_category = pr
            b = followup_age_bucket(last_flup_age)
            if b:
                fu_counter[b] += 1
            label = phenotype_label(main_phtype_code)
            if not label and phenotype_review_category:
                # Rows integrated from the 2026-09 CRF have only the free-text phenotype_review_category instead of the legacy code (main_phtype_code); fall back to it.
                label = phenotype_review_category.strip()
            if label:
                phenotype_counter[label] += 1

        pub_link_value = None
        if lt and lt[0]:
            pub_link_value = lt[0].strip()
        elif lt and lt[1]:
            # Rows integrated from the 2026-09 CRF have only pmid instead of pblcate_link.
            pub_link_value = lt[1].strip()
        if pub_link_value:
            pub_link_counter[pub_link_value] += 1

    onset_order = ['<30 days', '1-3 months', '3-12 months', '1-2 years', '2-5 years', '5+ years']
    fu_order = ['<1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years']

    chart_onset_age = [
        {'country': label, 'sales': onset_counter[label]}
        for label in onset_order if onset_counter[label] > 0
    ]
    chart_fu_age = [
        {'category': label, 'value': fu_counter[label]}
        for label in fu_order if fu_counter[label] > 0
    ]
    chart_phenotype = [
        {'category': label, 'value': count}
        for label, count in phenotype_counter.most_common()
    ]
    chart_pub_link = [
        {'country': label, 'sales': count}
        for label, count in top_n_with_other(pub_link_counter, n=8)
    ]

    return {
        'total': len(seqs),
        'chart_onset_age': chart_onset_age,
        'chart_fu_age': chart_fu_age,
        'chart_phenotype': chart_phenotype,
        'chart_pub_link': chart_pub_link,
    }
