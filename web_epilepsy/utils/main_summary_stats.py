from collections import Counter

from web_epilepsy.models import AtonsetInfo, EplpAnlInfo, PrgssInfo
from web_epilepsy.utils.phenotype_groups import GROUP_NAMES, SHORT

BUCKETS = ['Missense', 'Synonymous', 'Frame shift', 'Stop codon', 'Intronic', 'Unspecified']

# Data-source switch for the Summary section (three Summary bars / Variant Summary donut).
# 'real'   -> aggregated live from the database
# 'static' -> hard-coded legacy values
# Both implementations are kept below, so this value alone switches between them.
SUMMARY_DATA_SOURCE = 'real'


def variant_bucket(vrat_tp):
    if vrat_tp in ('Missense', 'Synonymous', 'Frame shift', 'Stop codon', 'Intronic'):
        return vrat_tp
    return 'Unspecified'


def _bucket_counts(queryset):
    return Counter(variant_bucket(v) for v in queryset.values_list('vrat_tp', flat=True))


def _get_gene_counts():
    counts = Counter(EplpAnlInfo.objects.values_list('gene_nm', flat=True))
    return [{'country': gene, 'value': n} for gene, n in counts.most_common()]


# Bucket onset_selzure_age (days) into labelled month ranges. Ages of 5 years or more are also given in months ("60mo+") so that one label unit is used throughout.
_AGE_MONTH_BUCKET_ORDER = ['0-1mo', '1-3mo', '3-6mo', '6-12mo', '12-24mo', '24-60mo', '60mo+']


def _age_month_bucket(days):
    if days < 30:
        return '0-1mo'
    if days < 90:
        return '1-3mo'
    if days < 180:
        return '3-6mo'
    if days < 365:
        return '6-12mo'
    if days < 730:
        return '12-24mo'
    if days < 1825:
        return '24-60mo'
    return '60mo+'


def _get_age_month_counts():
    from web_epilepsy.utils.searchlist_stats import onset_age_to_days
    counter = Counter()
    for raw in AtonsetInfo.objects.values_list('onset_selzure_age', flat=True):
        days = onset_age_to_days(raw)
        if days is None:
            continue
        counter[_age_month_bucket(days)] += 1
    return [{'country': b, 'value': counter[b]} for b in _AGE_MONTH_BUCKET_ORDER if counter[b] > 0]


# The CRF has no onset_cl (free-text onset class) column, so the onset period classification is rebuilt from onset_selzure_age
# with the existing parser onset_age_to_days into clinically common categories. It uses the same source column as the
# "Sample count by age (months)" chart, but that chart shows fine month bins whereas this one is a clinical classification.
# Seven categories are used, matching the actual value distribution, because three (neonate/infant/child) were too coarse.
# Labels use only short numeric ranges, in the style of the "Sample count by age (months)" chart (0-1mo, 1-3mo, ...),
# so that the plot width is similar to the neighbouring charts without wrapping.
_ONSET_CL_BUCKETS = [
    (28, '≤28d'),
    (180, '29d-6mo'),
    (365, '6-12mo'),
    (730, '1-2y'),
    (1825, '2-5y'),
    (4380, '5-12y'),
    (None, '>12y'),
]
_ONSET_CL_BUCKET_ORDER = [label for _, label in _ONSET_CL_BUCKETS]


def _onset_cl_bucket(days):
    for max_days, label in _ONSET_CL_BUCKETS:
        if max_days is None or days <= max_days:
            return label


def _get_onset_cl_counts():
    from web_epilepsy.utils.searchlist_stats import onset_age_to_days
    counter = Counter()
    for raw in AtonsetInfo.objects.values_list('onset_selzure_age', flat=True):
        days = onset_age_to_days(raw)
        if days is None:
            continue
        counter[_onset_cl_bucket(days)] += 1
    return [{'country': b, 'value': counter[b]} for b in _ONSET_CL_BUCKET_ORDER if counter[b] > 0]


# Counts of the seven Phenotype groups (PrgssInfo.phenotype_group), sorted by frequency; rows without a value are counted separately.
def _get_phenotype_counts():
    counts = Counter(PrgssInfo.objects.values_list('phenotype_group', flat=True))
    missing = counts.pop(None, 0) + counts.pop('', 0)
    rows = [{'country': SHORT.get(g, g), 'full': g, 'value': counts.get(g, 0)} for g in GROUP_NAMES]
    rows.sort(key=lambda r: -r['value'])
    return rows, missing


# Sex distribution (EplpAnlInfo.sex: F / M / not stated), returned in the donut data format ({country, sales}).
def _get_sex_counts():
    c = Counter(EplpAnlInfo.objects.values_list('sex', flat=True))
    other = sum(n for k, n in c.items() if k not in ('F', 'M'))
    return [{'country': 'Female', 'sales': c.get('F', 0)}, {'country': 'Male', 'sales': c.get('M', 0)}, {'country': 'Not recorded', 'sales': other}]


def _get_real_summary_context():
    base_qs = EplpAnlInfo.objects.all()
    variant_counts = _bucket_counts(base_qs)
    chart_variant = [{'country': b, 'sales': variant_counts.get(b, 0)} for b in BUCKETS]

    chart_phenotype, phenotype_missing = _get_phenotype_counts()

    return {
        'main_summary_total': base_qs.count(),
        'chart_phenotype': chart_phenotype,
        'phenotype_missing': phenotype_missing,
        'chart_sex': _get_sex_counts(),
        'chart_gene_counts': _get_gene_counts(),
        'chart_age_months': _get_age_month_counts(),
        'chart_onset_cl': _get_onset_cl_counts(),
        'chart_variant': chart_variant,
    }


# Static values.
def _get_static_summary_context():
    chart_gene_counts = [
        {'country': 'SCN2A', 'value': 1047},
        {'country': 'EEF1A2', 'value': 76},
        {'country': 'KCNQ2', 'value': 47},
        {'country': 'SCN1A', 'value': 38},
        {'country': 'CDKL5', 'value': 32},
        {'country': 'SYNGAP1', 'value': 14},
    ]
    chart_age_months = [
        {'country': '0-1mo', 'value': 253},
        {'country': '1-3mo', 'value': 46},
        {'country': '3-6mo', 'value': 78},
        {'country': '6-12mo', 'value': 78},
        {'country': '12-24mo', 'value': 56},
        {'country': '24-60mo', 'value': 30},
        {'country': '60mo+', 'value': 16},
    ]
    chart_onset_cl = [
        {'country': '<30 days', 'value': 280},
        {'country': 'Infancy', 'value': 204},
        {'country': '>1yr', 'value': 110},
        {'country': '4month', 'value': 14},
        {'country': '3days', 'value': 12},
        {'country': 'Unknown', 'value': 12},
        {'country': 'Other', 'value': 182},
    ]
    chart_variant = [
        {'country': 'Missense', 'sales': 859},
        {'country': 'Frame shift', 'sales': 61},
        {'country': 'Stop codon', 'sales': 58},
        {'country': 'Intronic', 'sales': 19},
        {'country': 'Unspecified', 'sales': 257},
    ]

    return {
        'main_summary_total': 1254,
        'chart_gene_counts': chart_gene_counts,
        'chart_age_months': chart_age_months,
        'chart_onset_cl': chart_onset_cl,
        'chart_variant': chart_variant,
        'chart_phenotype': _get_phenotype_counts()[0],
        'chart_sex': _get_sex_counts(),
        'phenotype_missing': _get_phenotype_counts()[1],
    }


# Data used only by the Summary section of the main page (three Summary bars / Variant Summary donut).
def get_main_summary_context():
    if SUMMARY_DATA_SOURCE == 'static':
        return _get_static_summary_context()
    return _get_real_summary_context()
