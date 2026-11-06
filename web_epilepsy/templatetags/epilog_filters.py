import re

from django import template

register = template.Library()

# Removes only short abbreviation parentheses after a drug name, e.g. '(CBZ)', '(KBr)'. Explanatory ones such as '(vitamin B6)', '(Epidiolex)', '(AEDs)' are kept.
_ABBR = re.compile(r'\s*\((?:[A-Z][A-Z0-9]{1,5}|KBr)\)')


@register.filter
def strip_abbr(value):
    """'Carbamazepine (CBZ), Clobazam (CLB)' -> 'Carbamazepine, Clobazam' (for the report page)"""
    return _ABBR.sub('', value) if value else value
