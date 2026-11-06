# -*- coding: utf-8 -*-
"""Mapping of the original Phenotype value (PrgssInfo.phenotype_review_category) to its group (PrgssInfo.phenotype_group): 7 groups.
The original value is kept and only the group is stored in a separate column. When a new spelling appears, add it to the table below
and fill the groups again with scripts/fill_phenotype_group.py --apply.
"""
GROUPS = [
    ('Other / unspecified epilepsy', [
        'Other epilepsy', 'Epilepsy', '(Autosomal dominant) Nocturnal frontal lobe epilepsy',
        'Other epilepsy - Unknowned seizure type', 'Other epilepsy - epileptic spasms', 'Other epilepsy - focal seizure']),
    ('Dravet syndrome', ['Dravet syndrome']),
    ('Epileptic encephalopathy (DEE group)', [
        'Epileptic encephalopathy / developmental and epileptic encephalopathy / early infantile epileptic encephalopathy / Ohtahara syndrome',
        'Epileptic encephalopathy or developmental epileptic encephalopathy',
        'Epilepsy of infancy with migrating focal seizures (onset before 12 months)',
        'West syndrome or infantile spasms syndrome or infantile spasms',
        'Early infantile epileptic encephalopathy or Ohtahara syndrome (onset before 1 month)',
        'West syndrome / infantile spasms',
        'Epileptic encephalopathy or developmental epileptic encephalopathy (excluding Dravet syndrome)',
        'Developmental epileptic encephalopathy', 'Lennox-Gastaut syndrome', 'West syndrome',
        'developmental and epileptic encephalopathy', 'Epileptic encephalopathy', 'early infantile epileptic encephalopathy', 'DEE without IESS']),
    ('Benign / self-limited epilepsy', ['Benign epilepsy / self-limited epilepsy', 'Benign epilepsy or self-limited epilepsy', 'SeLNE']),
    ('GEFS+', ['GEFS+ (Generalized epilepsy with febrile seizure plus)']),
    ('No seizure', ['Non-seizure, seizure never reported', 'Non-seizure (seizure never reported)', 'Non-seizure types',
                    'Non-seizure / seizure never reported', 'No epilepsy', 'Non-seizure type']),
    ('Generalized epilepsy', ['Generalized epilepsy', 'Generalized epilepsy - Myoclonic astatic/atonic epilepsy', 'Generalized epilepsy - Early onset absence epilepsy']),
]
# Short names for the list table (the full name is shown as a tooltip)
SHORT = {
    'Other / unspecified epilepsy': 'Other', 'Dravet syndrome': 'Dravet', 'Epileptic encephalopathy (DEE group)': 'DEE',
    'Benign / self-limited epilepsy': 'Benign', 'GEFS+': 'GEFS+', 'No seizure': 'No seizure', 'Generalized epilepsy': 'Generalized',
}
GROUP_NAMES = [g for g, _ in GROUPS]
VALUE_TO_GROUP = {v: g for g, vs in GROUPS for v in vs}


def phenotype_group(value):
    """original value -> group. None if empty, or if the value is not in the table (the script reports it)."""
    return VALUE_TO_GROUP.get((value or '').strip()) if value else None


# Display labels that unify only clearly equivalent expressions (original value -> display value). Values not listed here are shown as they are.
LABELS = {
    'Non-seizure, seizure never reported': 'Non-seizure (seizure never reported)',
    'Non-seizure types': 'Non-seizure (seizure never reported)',
    'Non-seizure / seizure never reported': 'Non-seizure (seizure never reported)',
    'Non-seizure type': 'Non-seizure (seizure never reported)',
    'Benign epilepsy or self-limited epilepsy': 'Benign epilepsy / self-limited epilepsy',
    'West syndrome or infantile spasms syndrome or infantile spasms': 'West syndrome / infantile spasms',
    'developmental and epileptic encephalopathy': 'Developmental epileptic encephalopathy',
    'early infantile epileptic encephalopathy': 'Early infantile epileptic encephalopathy',
    'Other epilepsy - Unknowned seizure type': 'Other epilepsy - unknown seizure type',
}


def phenotype_label(value):
    """original value -> display label. None if empty."""
    v = (value or '').strip()
    return LABELS.get(v, v) if v else None
