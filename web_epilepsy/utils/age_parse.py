"""Age at seizure onset (free text) -> days (pure Python, independent of Django).

Shared by searchlist_stats.py / main_summary_stats.py (charts) and the import check scripts.

Supported formats (CRF free text):
- plain number "720"                       : legacy format (days)
- "5 months", "< 1 month", "2-3 days"      : number [range] unit
- "19-20 days", "3 to 5 days"              : en-dash / "to" ranges
- "between 4 and 8 months"                 : range
- "8 months (age at epilepsy onset)"       : trailing parenthetical is dropped
- "approximately 36 months", "~36 mo"      : approximation prefixes are dropped
- "Neonatal", "from birth", "first days of life", ... -> 14 days
  (neonatal = within 28 days of birth, so it falls into the same bin in month-based and clinical-category charts)

Deliberately not handled (None, because a number would have to be invented):
category words such as "Infancy" or "Childhood", and one-sided or compound expressions such as
"30 days or less", "6 months or more", "before 3 years", "1 month 2 days" (see the extended rules below for the numeric ones).
"""
import re

_NUM = r'(\d+(?:\.\d+)?)'
_UNIT = r'(day|days|d|week|weeks|wk|wks|month|months|mo|mos|m|year|years|yr|yrs|y)'
# Applied to the string with all whitespace removed.
_AGE_RANGE_RE = re.compile(r'^[<>~]?' + _NUM + r'(?:-' + _NUM + r')?' + _UNIT + r's?\.?$')

_AGE_UNIT_TO_DAYS = {
    'day': 1, 'days': 1, 'd': 1,
    'week': 7, 'weeks': 7, 'wk': 7, 'wks': 7,
    'month': 30, 'months': 30, 'mo': 30, 'mos': 30, 'm': 30,
    'year': 365, 'years': 365, 'yr': 365, 'yrs': 365, 'y': 365,
}

_NA = {'na', 'n/a', 'no seizure', 'not specified', 'unknown', 'not applicable', 'none', ''}

# Expressions that clearly denote the neonatal period (within 28 days of birth). "first month" is excluded because it can exceed 28 days.
_NEONATAL_RE = re.compile(
    r'neonat|newborn|(?:^|\W)birth|first\s+(?:few\s+)?(?:days|hours|week)|hours?\s+after\s+birth|'
    r'few\s+hours|fourth\s+week\s+of\s+life', re.I)
NEONATAL_DAYS = 14.0

_LEAD_WORDS_RE = re.compile(r'^(?:approximately|approx\.?|about|around|circa|ca\.?|at|age)\s+', re.I)


def onset_age_to_days(raw):
    if not raw:
        return None
    s = str(raw).strip().lower()
    if s in _NA:
        return None
    try:
        return float(s)
    except ValueError:
        pass

    # Drop a trailing parenthetical: "8 months (age at epilepsy onset)" -> "8 months"
    t = re.sub(r'\s*[\(\[].*$', '', s).strip()
    t = t.replace('–', '-').replace('—', '-')
    t = _LEAD_WORDS_RE.sub('', t)
    m_bt = re.match(r'^between\s+' + _NUM + r'\s+and\s+' + _NUM + r'\s*' + _UNIT + r's?\.?$', t)
    if m_bt:
        t = '%s-%s%s' % (m_bt.group(1), m_bt.group(2), m_bt.group(3))
    t = re.sub(r'\s+to\s+', '-', t)
    t = t.replace(' ', '')
    try:
        return float(t)
    except ValueError:
        pass

    m = _AGE_RANGE_RE.match(t)
    if m:
        lo = float(m.group(1))
        hi = float(m.group(2)) if m.group(2) else lo
        unit_days = _AGE_UNIT_TO_DAYS.get(m.group(3))
        if unit_days is not None:
            return (lo + hi) / 2 * unit_days

    if _NEONATAL_RE.search(s):
        return NEONATAL_DAYS
    return _extended_age_to_days(s)


# ---------------------------------------------------------------------------------------------
# Extended rules: expressions that do contain a number but were not read by the basic rules are converted to days.
#  - compound units ("2 years 3 months", "1 month 2 days", "1y5m") are summed
#  - hours ("24 hours", "18 h of life") are divided by 24
#  - one-sided expressions ("within 12 months", "30 days or less", "6 months or more", "3+ months") use the boundary value itself,
#    as the basic rules already read "< 1 month" as 1 month
#  - "3 or 4 days" uses the midpoint; "first month of life" / "first year of life" use the boundary (30 / 365 days)
# Category words without a number (Infancy, Childhood, several days, ...) and expressions mixing two different onset times
# remain None (numbers are not invented).
# ---------------------------------------------------------------------------------------------
_U = r'(?:years?|yrs?|y|months?|mos?|m|weeks?|wks?|days?|d|hours?|hrs?|h)'
_UD = {'y': 365, 'yr': 365, 'yrs': 365, 'year': 365, 'years': 365,
       'm': 30, 'mo': 30, 'mos': 30, 'month': 30, 'months': 30,
       'w': 7, 'wk': 7, 'wks': 7, 'week': 7, 'weeks': 7,
       'd': 1, 'day': 1, 'days': 1,
       'h': 1 / 24.0, 'hr': 1 / 24.0, 'hrs': 1 / 24.0, 'hour': 1 / 24.0, 'hours': 1 / 24.0}
_PREFIX_RE = (r'^(?:during\s+the\s+first|within\s+the\s+first|within\s+first|within|less\s+than|before|under|'
              r'nearly|probably\s+within\s+the\s+first|probably|first)\s+')
_SUFFIX_RE = r'(?:\s*(?:\+|or\s+less|or\s+more|of\s+(?:post-?natal\s+)?life|after\s+birth|old))?$'


def _unit_days(u):
    return _UD[u.lower()]


def _extended_age_to_days(s):
    if ';' in s:  # different onset times written together (e.g. febrile + afebrile seizures) cannot be reduced to one value
        return None
    t = re.sub(r'\s*[\(\[].*$', '', s).strip().replace('–', '-').replace('—', '-')
    t = re.sub(r"\s*\((?:.*)\)$", '', t)
    # compound: 1 year 5 months / 1y5m / 2 months 23 days / 1 month 2 days
    m = re.match(r'^(\d+)\s*(years?|yrs?|y|months?|mos?|m)\s*(\d+)\s*(months?|mos?|m|days?|d)$', t)
    if m:
        return int(m.group(1)) * _unit_days(m.group(2)) + int(m.group(3)) * _unit_days(m.group(4))
    # "day 3 of life", "day 1"
    m = re.match(r'^(?:around\s+)?day\s*(\d+)(?:\s+of\s+life)?$', t)
    if m:
        return float(m.group(1))
    # one of two values: "3 or 4 days", "2 or 3 days", "5,6 year"
    m = re.match(r'^(\d+)\s*or\s*(\d+)\s*(' + _U + r')$', t)
    if m:
        return (int(m.group(1)) + int(m.group(2))) / 2.0 * _unit_days(m.group(3))
    m = re.match(r'^(\d+)\+\s*(' + _U + r')$', t)       # 3+ months
    if m:
        return int(m.group(1)) * _unit_days(m.group(2))
    # single value with prefix/suffix: within 12 months / less than 8 hours / 30 days or less / 3+ months / 24 hours of life
    body = re.sub(_PREFIX_RE, '', t, flags=re.I)
    m = re.match(r'^(\d+(?:\.\d+)?)\s*(' + _U + r')' + _SUFFIX_RE, body)
    if m and (body != t or m.group(0) != t or True):
        return float(m.group(1)) * _unit_days(m.group(2))
    # "first month/year of life", "second week of life"
    if re.match(r'^(?:during\s+the\s+)?(?:probably\s+within\s+the\s+)?first\s+month(?:\s+of\s+life)?$', t):
        return 30.0
    if re.match(r'^(?:during\s+the\s+|within\s+the\s+|probably\s+within\s+the\s+)?first\s+year(?:\s+of\s+life)?$', t):
        return 365.0
    if re.match(r'^second\s+week(?:\s+of\s+life)?$', t):
        return 10.5  # midpoint of days 8-14 after birth
    if re.match(r'^1st\s+week(?:\s+of\s+life)?$', t):
        return NEONATAL_DAYS
    m = re.match(r'^first\s+(\d+)\s*(' + _U + r')(?:\s+of\s+life)?$', t)
    if m:
        return int(m.group(1)) * _unit_days(m.group(2))
    return None
