# Field descriptions for the Clinical Info table, sourced from
# "Phenotype Review items per gene" (per-gene Phenotype Review criteria).
# Keyed by gene_nm; each entry is an ordered list of (label, description) tuples
# matching the rows shown in templates/epilepsy/clinicalInfo.html.

_COMMON_FIELDS_HEAD = [
    ("Patient ID", "Unique patient identifier."),
    ("Contained Korea Cohort", "O if the patient belongs to the Korea cohort (race/ethnicity recorded as KOR), X otherwise."),
    ("Sex", "male or female."),
    ("Variant cDNA change", "Variant at cDNA level, e.g. c.xxxx."),
    ("Variant Protein change", "Variant at protein level, e.g. p.xxxx."),
    ("Mutation Type", "Point mutation (small mutation) or CNV (large copy number variant)."),
    ("Ensembl Transcript ID", "Ensembl transcript ID (ENST) of the transcript the variant was checked against."),
    ("ClinVar pathogenicity", "ClinVar pathogenicity classification."),
    ("ClinVar ID", "ClinVar ID."),
]

_COMMON_FIELDS_TAIL = [
    ("Age at last follow-up", "Enter in years."),
    ("Source in PMID", "Source of clinical information as PMID."),
    ("LitVar<sup>2</sup>", "Literature search results for this variant on NCBI LitVar2."),
]

_AGE_ONSET_DAYS_OR_MONTHS = (
    "Age at seizure onset",
    "Before 30 days enter in days (e.g. 5 days, 20 days); otherwise enter in months (e.g. 25 months, 49 months).",
)
_AGE_ONSET_MONTHS_ONLY = ("Age at seizure onset", "Enter in months.")

GENE_FIELD_DESCRIPTIONS = {
    "SCN1A": _COMMON_FIELDS_HEAD + [
        ("Age at seizure onset", "Enter in months, e.g. 25 months, 49 months."),
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype",
         "Dravet syndrome / GEFS+ (Generalized epilepsy with febrile seizure plus) / "
         "Other epilepsy / Non-seizure (seizure never reported)."),
        ("Response to targeted ASM",
         "If a response or aggravation is reported, note it together with the drug (treatment) name."),
    ],
    "SCN2A": _COMMON_FIELDS_HEAD + [
        _AGE_ONSET_DAYS_OR_MONTHS,
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype",
         "Epileptic encephalopathy / Developmental and epileptic encephalopathy / "
         "Early infantile epileptic encephalopathy / Ohtahara syndrome / Benign (self-limited) "
         "epilepsy / Other epilepsy / Non-seizure."),
        ("Response to targeted ASM",
         "If a response is reported, note it together with the drug name."),
    ],
    "KCNQ2": _COMMON_FIELDS_HEAD + [
        _AGE_ONSET_DAYS_OR_MONTHS,
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype",
         "Epileptic encephalopathy / Developmental and epileptic encephalopathy / "
         "Early infantile epileptic encephalopathy / Ohtahara syndrome / West syndrome "
         "(infantile spasms) / Benign (self-limited) epilepsy / Other epilepsy / Non-seizure."),
        ("Response to targeted ASM",
         "If a response is reported, note it together with the drug name."),
    ],
    "CDKL5": _COMMON_FIELDS_HEAD + [
        _AGE_ONSET_MONTHS_ONLY,
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype", "Epilepsy / Non-seizure."),
        ("Response to targeted ASM",
         "If a response is reported, note it together with the treatment name."),
    ],
    "SYNGAP1": _COMMON_FIELDS_HEAD + [
        _AGE_ONSET_MONTHS_ONLY,
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype",
         "Generalized epilepsy / Myoclonic astatic epilepsy / Myoclonic atonic epilepsy / "
         "Early onset absence epilepsy / Other epilepsy / Non-seizure."),
        ("Response to targeted ASM",
         "If a response is reported, note it together with the drug name."),
    ],
    "EEF1A2": _COMMON_FIELDS_HEAD + [
        _AGE_ONSET_MONTHS_ONLY,
    ] + _COMMON_FIELDS_TAIL + [
        ("Phenotype",
         "Developmental epileptic encephalopathy / Lennox-Gastaut syndrome / West syndrome / "
         "Dravet syndrome / Epileptic encephalopathy / Other epilepsy / Non-seizure."),
        ("Response to targeted ASM",
         "If a response is reported, note it together with the drug name."),
    ],
}


_AGE_ONSET_FREE = ("Age at seizure onset",
                   "Age at seizure onset as reported in the source (e.g. 3 days, 5 months, 2 years).")
_ASM_GENERIC = ("Response to targeted ASM",
                "If a response is reported, note it together with the drug (treatment) name.")


def _new_gene(phenotype_text):
    return _COMMON_FIELDS_HEAD + [_AGE_ONSET_FREE] + _COMMON_FIELDS_TAIL + [
        ("Phenotype", phenotype_text), _ASM_GENERIC,
    ]


# Further genes: the allowed Phenotype lists of the CRF template are shown as they are.
GENE_FIELD_DESCRIPTIONS.update({
    "SMC1A": _new_gene("Epileptic encephalopathy or developmental epileptic encephalopathy / "
                       "Other epilepsy / Non-seizure (seizure never reported)."),
    "FOXG1": _new_gene("Epileptic encephalopathy or developmental epileptic encephalopathy / "
                       "Other epilepsy / Non-seizure (seizure never reported)."),
    "GABRA1": _new_gene("Dravet syndrome / Epileptic encephalopathy or developmental epileptic encephalopathy "
                        "(excluding Dravet syndrome) / Other epilepsy / Non-seizure (seizure never reported)."),
    "KCNT1": _new_gene("Epilepsy of infancy with migrating focal seizures (onset before 12 months) / "
                       "(Autosomal dominant) Nocturnal frontal lobe epilepsy / Other epilepsy / "
                       "Non-seizure (seizure never reported)."),
    "PCDH19": _new_gene("Dravet syndrome / Other epilepsy / Non-seizure (seizure never reported)."),
    "STXBP1": _new_gene("Early infantile epileptic encephalopathy or Ohtahara syndrome (onset before 1 month) / "
                        "West syndrome or infantile spasms syndrome or infantile spasms / Other epilepsy / "
                        "Non-seizure (seizure never reported)."),
    "SCN8A": _new_gene("Benign epilepsy or self-limited epilepsy / Epileptic encephalopathy or developmental "
                       "epileptic encephalopathy / Non-seizure (seizure never reported)."),
})


# Descriptions of the items linked to the same patient in the literature-extraction database (shown only when such patient information exists)
_LITERATURE_FIELDS = [
    ("ASM response", "Overall response to anti-seizure medication as reported in the source paper (e.g., Controlled, Refractory)."),
    ("ASM used", "Anti-seizure medications the patient received, as written in the source paper."),
    ("Responsive ASM", "Medications reported to be effective for this patient."),
    ("Seizure presence", "Whether seizures were reported for this patient."),
    ("Seizure types", "Seizure types reported for this patient."),
    ("Epilepsy type", "Epilepsy type reported for this patient (e.g., focal, generalized)."),
    ("Other phenotypes", "Other clinical features reported for this patient."),
]


def get_field_descriptions(gene_nm):
    """Per-gene field descriptions. The literature-link item descriptions are inserted after the 'Response to targeted ASM' description (same order as the rows on screen)."""
    out = []
    for item in GENE_FIELD_DESCRIPTIONS.get(gene_nm, []):
        out.append(item)
        if item[0] == "Response to targeted ASM":
            out.extend(_LITERATURE_FIELDS)
    return out
