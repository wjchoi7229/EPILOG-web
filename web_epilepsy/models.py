from django.db import models







# EPILEPSY_ANL_INFO (clinical indicators)
class EplpAnlInfo(models.Model):
    eplp_anl_info_seq = models.AutoField(primary_key=True)
    trnscr_nm = models.CharField(max_length=200)
    vrat_tp = models.CharField(max_length=40)
    patient_no = models.CharField(max_length=40)
    gene_nm = models.CharField(max_length=40) 
    vrat_info = models.CharField(max_length=40)
    vrat_info_letter = models.CharField(max_length=40)
    rpt_vrat_yn = models.CharField(max_length=6) 
    cytognt_lc = models.CharField(max_length=20)
    grch38_chr = models.CharField(max_length=20)
    grch38_lc = models.CharField(max_length=40)
    grch37_chr = models.CharField(max_length=20)
    grch37_lc = models.CharField(max_length=40)
    pdb_retnt_yn = models.CharField(max_length=1, null=True)

    # Fields from the common header classification table; empty until filled.
    sex = models.CharField(max_length=10, null=True, blank=True)
    variant_c = models.CharField(max_length=200, null=True, blank=True)
    clinvar_pathogenicity = models.CharField(max_length=100, null=True, blank=True)
    clinvar_id = models.CharField(max_length=40, null=True, blank=True)

    # Common fields for all genes (per-gene phenotype CRF integration).
    mutation_type = models.CharField(max_length=40, null=True, blank=True)

    # Ethnicity/race of the patient (shown in the Patient ID row of Clinical info).
    race = models.CharField(max_length=40, null=True, blank=True)

    # VUS flag: variants classified as VUS/Conflicting in a paper or in ClinVar (e.g. "VUS (ClinVar)", "Conflicting (ClinVar)", "VUS (paper); VUS (ClinVar)").
    vus_flag = models.CharField(max_length=200, null=True, blank=True)

    # LitVar2 literature search link. LitVar2 needs a normalized variant ID obtained from its autocomplete API, so complete links are precomputed by a backfill script instead of being resolved per request.
    litvar_link = models.CharField(max_length=500, null=True, blank=True)

    # Pathogenicity predictors:
    # REVEL and AlphaMissense are the main meta-predictors, filled by coordinate lookup in their genome-wide score files.
    revel_score = models.FloatField(null=True, blank=True)
    alphamissense_score = models.FloatField(null=True, blank=True)
    alphamissense_class = models.CharField(max_length=20, null=True, blank=True)  # likely_benign / ambiguous / likely_pathogenic

    # Functional-direction (GoF/LoF/mixed) prediction tools: the name of the tool that was run and its result are stored together.
    func_direction_pred = models.CharField(max_length=20, null=True, blank=True)  # GOF / LOF / mixed
    func_direction_tool = models.CharField(max_length=20, null=True, blank=True)  # SCION / MissION / funNCion

    # Per-tool values for the Variant effects view. Direction tools store the GoF probability (0-1) separately from the call: close to 0 = LoF, close to 1 = GoF. NULL if the gene is outside the tool scope or not yet computed.
    # Reference-sequence check: result text and the Ensembl transcript ID used for the check (not displayed).
    ref_check_note = models.TextField(null=True, blank=True)
    ensembl_transcript = models.CharField(max_length=40, null=True, blank=True)
    scion_gof_prob = models.FloatField(null=True, blank=True)
    funncion_gof_prob = models.FloatField(null=True, blank=True)
    mission_score = models.FloatField(null=True, blank=True)  # (unused: MissION is not displayed; the column is kept empty)
    cadd_phred = models.FloatField(null=True, blank=True)  # CADD PHRED score

    # gnomAD population frequency (overall and East Asian (EAS) frequency stored separately).
    gnomad_af = models.FloatField(null=True, blank=True)
    gnomad_af_eas = models.FloatField(null=True, blank=True)

    # Experimental functional data (patch clamp) have several parameters per variant and are kept in a separate table (FunctionalAssayInfo).

    def __str__(self):
        return self.eplp_anl_info_seq
    

# ATONSET_INFO (age at onset) information
class AtonsetInfo(models.Model):
    occr_info_seq = models.AutoField(primary_key=True)
    eplp_anl_info_seq = models.ForeignKey(EplpAnlInfo, related_name='atonsetinfo', on_delete=models.CASCADE)
    onset_devlop_code = models.CharField(max_length=6) 
    onset_selzure_age = models.CharField(max_length=40)
    onset_cl = models.CharField(max_length=40)
    onset_selzure_tp_code = models.CharField(max_length=6)
    onset_asm_respns_code = models.CharField(max_length=6)
    na_blcker_respns = models.CharField(max_length=40) 
    asm_respns = models.CharField(max_length=40) 
    # Age at onset converted to a decimal number of years. Ranges, inequalities and descriptive values that cannot be given as a number are left empty.
    onset_age_years = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.occr_info_seq
    
    def onset_devlop_code_nm(self):
        if self.onset_devlop_code == "1":
            return "apparently normal"
        elif self.onset_devlop_code == "2":
            return "apparently delayed"
        elif self.onset_devlop_code == "3":
            return "undetermined"
        
    def onset_selzure_tp_code_nm(self):
        if self.onset_selzure_tp_code == "1":
            return "tonic (Ohtaharra syndrome)"
        elif self.onset_selzure_tp_code == "2":
            return "focal  including focal clonic, autonomic……."
        elif self.onset_selzure_tp_code == "3.1":
            return "hemiclonic"
        elif self.onset_selzure_tp_code == "3.2":
            return "bilateral clonic"
        elif self.onset_selzure_tp_code == "4":
            return "spasms"
        elif self.onset_selzure_tp_code == "5":
            return "myoclonic seizure"
        elif self.onset_selzure_tp_code == "6":
            return "absence seizure"
        
    def onset_asm_respns_code_nm(self):
        if self.onset_asm_respns_code == "1":
            return "seizure free"
        elif self.onset_asm_respns_code == "2":
            return "seizure >90% reduction"
        elif self.onset_asm_respns_code == "3":
            return "undetermined"
        elif self.onset_asm_respns_code == "4":
            return "seizure aggravation"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['occr_info_seq','eplp_anl_info_seq'],
                name='ATONSET_INFO Unique IDX 1',
            ),
        ]


# PRGSS_INFO (course) information
class PrgssInfo(models.Model):
    prgss_info_seq = models.AutoField(primary_key=True)
    eplp_anl_info_seq = models.ForeignKey(EplpAnlInfo, related_name='prgssinfo', on_delete=models.CASCADE)
    last_flup_age = models.CharField(max_length=40) 
    prgss_selzure_tp_code = models.CharField(max_length=6)
    prgss_asm_respns_code = models.CharField(max_length=6)
    asm_respns = models.CharField(max_length=40) 
    prgss_devlop_code = models.CharField(max_length=6)
    last_flup_selzure_code = models.CharField(max_length=6)
    main_phtype_code = models.CharField(max_length=6)
    phtype_code = models.CharField(max_length=6)

    # Fields following the per-gene Phenotype Review items; empty until filled.
    # main_phtype_code/phtype_code are gene-common codes and are kept separate from this per-gene field.
    phenotype_review_category = models.CharField(max_length=200, null=True, blank=True)
    # Phenotype group (7 groups). The original value (phenotype_review_category) is kept; the group is filled from the mapping table in web_epilepsy/utils/phenotype_groups.py.
    phenotype_group = models.CharField(max_length=60, null=True, blank=True)
    # Age at last follow-up as a decimal number of years; empty when it cannot be determined.
    last_flup_age_years = models.FloatField(null=True, blank=True)
    # Phenotype label shown in Clinical info: the original value (phenotype_review_category) is kept and only clearly equivalent expressions are unified.
    phenotype_label = models.CharField(max_length=200, null=True, blank=True)
    # Clinical information linked to the same patient in the literature-extraction database. Values keep the original wording; normalization is separate.
    # lit_link holds the linking method and the original mention number.
    lit_asm_response = models.CharField(max_length=200, null=True, blank=True)  # response_to_asm (Controlled/Refractory, etc.)
    lit_asm_used = models.TextField(null=True, blank=True)                           # asm_used
    lit_responsive_asm = models.TextField(null=True, blank=True)                     # responsive_asm
    lit_seizure_presence = models.CharField(max_length=100, null=True, blank=True)   # seizure_presence
    lit_seizure_types = models.TextField(null=True, blank=True)                      # seizure_types
    lit_epilepsy_type = models.CharField(max_length=300, null=True, blank=True)      # epilepsy_type
    lit_other_phenotypes = models.TextField(null=True, blank=True)                   # other_phenotypes
    lit_link = models.CharField(max_length=200, null=True, blank=True)  # linking method | original mention
    # Normalized versions of the lit_* fields (only clearly equivalent expressions are unified). If empty, the original value is shown.
    lit_asm_response_norm = models.CharField(max_length=100, null=True, blank=True)
    lit_asm_used_norm = models.TextField(null=True, blank=True)
    lit_responsive_asm_norm = models.TextField(null=True, blank=True)
    lit_seizure_types_norm = models.TextField(null=True, blank=True)
    lit_epilepsy_type_norm = models.CharField(max_length=300, null=True, blank=True)
    targeted_treatment_response = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.prgss_info_seq
    
    def prgss_selzure_tp_code_nm(self):
        if self.prgss_selzure_tp_code == "1":
            return "tonic (Ohtaharra syndrome)"
        elif self.prgss_selzure_tp_code == "2":
            return "focal"
        elif self.prgss_selzure_tp_code == "3.1":
            return "hemiclonic"
        elif self.prgss_selzure_tp_code == "3.2":
            return "bilateral clonic"
        elif self.prgss_selzure_tp_code == "4":
            return "spasms"
        elif self.prgss_selzure_tp_code == "5":
            return "myoclonic seizure"
        elif self.prgss_selzure_tp_code == "6":
            return "absence seizure"
        
    def prgss_asm_respns_code_nm(self):
        if self.prgss_asm_respns_code == "1":
            return "seizure free"
        elif self.prgss_asm_respns_code == "2":
            return "seizure >90% reduction"
        elif self.prgss_asm_respns_code == "3":
            return "undetermined"
        elif self.prgss_asm_respns_code == "4":
            return "seizure aggravation"
    
    def prgss_devlop_code_nm(self):
        if self.prgss_devlop_code == "1":
            return "Delay"
        elif self.prgss_devlop_code == "2":
            return "Normal"
        elif self.prgss_devlop_code == "3":
            return "undetermined"
        
    def main_phtype_code_nm(self):
        if self.main_phtype_code == "1":
            return "DEE early onset"
        elif self.main_phtype_code == "2":
            return "DEE late onset"
        elif self.main_phtype_code == "3":
            return "BFINS/Self limiting"
        elif self.main_phtype_code == "4":
            return "ID/ASD/Schizophrenia"
        elif self.main_phtype_code == "5":
            return "Episodic ataxia without seizure"
        elif self.main_phtype_code == "6":
            return "Unknown"
        elif self.main_phtype_code == "7":
            return "NA"
        elif self.main_phtype_code == "8":
            return "DEE without IESS"
        elif self.main_phtype_code == "9":
            return "SeLNE"
        elif self.main_phtype_code == "10":
            return "ID with epilepsy"
        elif self.main_phtype_code == "11":
            return "ID without epilepsy"
        elif self.main_phtype_code == "12":
            return "DEE"
        elif self.main_phtype_code == "13":
            return "Other epilepsy"
        elif self.main_phtype_code == "14":
            return "Non-seizure type"
        elif self.main_phtype_code == "15":
            return "seizure"
        elif self.main_phtype_code == "16":
            return "DEE with IESS"
        
    def phtype_code_nm(self):
        if self.phtype_code == "1":
            return "ID/ASD and seizure"
        elif self.phtype_code == "2":
            return "ID/ASD without seizure"
        elif self.phtype_code == "3":
            return "Episodic ataxia without seizure"
        elif self.phtype_code == "4":
            return "Schizophrenia without seizure"
        elif self.phtype_code == "5":
            return "BFNIE"
        elif self.phtype_code == "9999":
            return "Not available"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['prgss_info_seq','eplp_anl_info_seq'],
                name='PRGSS_INFO Unique IDX 1',
            ), 
        ]



# Literature (LTRTRE_INFO) information
class LtrtreInfo(models.Model):
    ltrtre_info_seq = models.AutoField(primary_key=True)
    eplp_anl_info_seq = models.ForeignKey(EplpAnlInfo, related_name='ltrtreinfo', on_delete=models.CASCADE)
    pblcate_link = models.CharField(max_length=4000)
    invitrotest_link_code = models.CharField(max_length=6)
    invitrotest_link = models.CharField(max_length=4000)

    # Fields following the common header classification table; empty until filled.
    # For sources without a plain numeric PMID the original URL is stored, so max_length matches the other link fields (pblcate_link etc.).
    pmid = models.CharField(max_length=4000, null=True, blank=True)

    def __str__(self):
        return self.ltrtre_info_seq
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['ltrtre_info_seq','eplp_anl_info_seq'],
                name='LTRTRE_INFO Unique IDX 1',
            ),
        ]

# Experimental functional data (patch clamp etc.). One variant can have several measurements by paper and condition, so they are stored in a 1:N table instead of columns of EplpAnlInfo.
class FunctionalAssayInfo(models.Model):
    func_assay_info_seq = models.AutoField(primary_key=True)
    # EplpAnlInfo has a legacy schema with no real PK/UNIQUE constraint on eplp_anl_info_seq, so SQLite cannot validate a database-level foreign key. Like the other linked tables (AtonsetInfo etc.), only an ORM-level relation is used.
    eplp_anl_info_seq = models.ForeignKey(EplpAnlInfo, related_name='funcassayinfo', on_delete=models.CASCADE, db_constraint=False)

    assay_type = models.CharField(max_length=40, null=True, blank=True)  # e.g. whole-cell patch clamp
    # Some GoF/LoF/mixed calls rest on partly subjective criteria, so the call and its basis are stored together.
    # Result of one paper (row): its parameters combined by the rule set into LOF / GOF / Mixed / Non-specific (shown in the Result column).
    gof_lof_mixed = models.CharField(max_length=20, null=True, blank=True)
    classification_note = models.TextField(null=True, blank=True)

    # Measured parameters (current density, V1/2, inactivation time constant, ...). They differ between papers, so all are nullable.
    # Stored as text so that the call (GoF / LoF / Non-specific) of the source table is kept as is.
    current_density = models.CharField(max_length=40, null=True, blank=True)
    window_current = models.CharField(max_length=40, null=True, blank=True)
    v_half_activation = models.CharField(max_length=40, null=True, blank=True)
    v_half_inactivation = models.CharField(max_length=40, null=True, blank=True)
    inactivation_tau = models.CharField(max_length=40, null=True, blank=True)
    # Additional Nav channel fields and source/experimental-system information.
    recovery_inactivation = models.CharField(max_length=40, null=True, blank=True)   # Recovery from inactivation
    persistent_current = models.CharField(max_length=40, null=True, blank=True)  # Persistent current (Altered = direction not stated)
    other_findings = models.TextField(null=True, blank=True)
    overall_call = models.CharField(max_length=20, null=True, blank=True)  # overall call given by the authors in the paper (only if present)
    source = models.CharField(max_length=60, null=True, blank=True)                  # Supplementary Table 1 / neXtProt / Manual curation
    species = models.CharField(max_length=60, null=True, blank=True)  # channel species (Homo sapiens / Rattus norvegicus / Mus musculus ...)
    cell_system = models.CharField(max_length=100, null=True, blank=True)  # e.g. tsA201, HEK293, Oocyte
    experimental_details = models.TextField(null=True, blank=True)
    # Gene-family-specific fields (KCNQ2 = potassium channel: homo-/heterozygous; GABRA1 = GABA-A receptor: GABA sensitivity / maximal current).
    current_density_het = models.CharField(max_length=40, null=True, blank=True)  # KCNQ2 heterozygous (WT:variant 1:1) current density
    v_half_activation_het = models.CharField(max_length=40, null=True, blank=True)  # KCNQ2 heterozygous activation V1/2
    activation_kinetics = models.CharField(max_length=40, null=True, blank=True)  # KCNQ2 activation kinetics
    het_class = models.CharField(max_length=60, null=True, blank=True)               # DN / pR / fR / Reduced(DN or pR) / Increased
    gaba_sensitivity = models.CharField(max_length=40, null=True, blank=True)  # GABRA1 GABA sensitivity call
    gaba_delta_pec50 = models.FloatField(null=True, blank=True)  # GABRA1 dpEC50 (relative to WT)
    max_current = models.CharField(max_length=40, null=True, blank=True)  # GABRA1 maximal current call
    max_current_rel = models.FloatField(null=True, blank=True)  # GABRA1 maximal current (WT = 1)
    variant_set = models.CharField(max_length=80, null=True, blank=True)  # e.g. Population, gnomAD (Fig 4) -> population-variant badge
    approximate = models.BooleanField(default=False)  # call read approximately from a figure (confidence capped at Moderate)

    pmid = models.CharField(max_length=4000, null=True, blank=True)

    def __str__(self):
        return str(self.func_assay_info_seq)


# Variant-level evaluation: one row per (gene, variant) with the four-part call and the takeaway sentence.
# Kept separate from EplpAnlInfo, which has one row per sample, to avoid duplication. The automatic sentence is takeaway_auto; the curator-edited text is takeaway_curated.
class VariantEvaluation(models.Model):
    gene_nm = models.CharField(max_length=20)
    variant = models.CharField(max_length=40)  # e.g. D343H (vrat_info_letter)
    eval_pathogenicity = models.CharField(max_length=20, null=True, blank=True)   # Likely damaging / Uncertain / Likely benign / No data
    n_above = models.IntegerField(null=True, blank=True)  # number of predictors at or above the threshold
    n_available = models.IntegerField(null=True, blank=True)  # number of predictors with a value
    eval_function = models.CharField(max_length=20, null=True, blank=True)        # LoF / GoF / Mixed / Non-specific / No data
    function_source = models.CharField(max_length=20, null=True, blank=True)      # experimental / in silico
    insilico_direction = models.CharField(max_length=20, null=True, blank=True)  # LoF / GoF / (none)
    concordance = models.CharField(max_length=20, null=True, blank=True)          # Concordant / Partial agreement / Prediction disagreement / Discordant / Not assessable
    confidence = models.CharField(max_length=20, null=True, blank=True)           # High / Moderate / Low
    takeaway_auto = models.TextField(null=True, blank=True)
    takeaway_curated = models.TextField(null=True, blank=True)
    curator = models.CharField(max_length=60, null=True, blank=True)
    curated_date = models.DateField(null=True, blank=True)
    rule_version = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        unique_together = (('gene_nm', 'variant'),)

    def __str__(self):
        return '%s %s' % (self.gene_nm, self.variant)


class VariantStructureMetrics(models.Model):
    """Precomputed comparison metrics between the wild-type and variant AF3 structures (ranked_0).
    The 3D page and the report read these values and compute them on the fly only when absent.
    Per-residue distance arrays are not stored because of their size.
    """
    gene_nm = models.CharField(max_length=20)
    variant = models.CharField(max_length=40)
    n_common = models.IntegerField(null=True, blank=True)
    n_wild = models.IntegerField(null=True, blank=True)
    n_variant = models.IntegerField(null=True, blank=True)
    rmsd_all = models.FloatField(null=True, blank=True)
    rmsd_ss = models.FloatField(null=True, blank=True)
    n_ss = models.IntegerField(null=True, blank=True)
    tm_score = models.FloatField(null=True, blank=True)
    local_rmsd = models.FloatField(null=True, blank=True)
    site_disp = models.FloatField(null=True, blank=True)
    n_local = models.IntegerField(null=True, blank=True)
    plddt_site_wild = models.FloatField(null=True, blank=True)
    plddt_site_var = models.FloatField(null=True, blank=True)
    plddt_local_wild = models.FloatField(null=True, blank=True)
    plddt_local_var = models.FloatField(null=True, blank=True)
    contacts_wild = models.IntegerField(null=True, blank=True)
    contacts_var = models.IntegerField(null=True, blank=True)
    contacts_gained = models.IntegerField(null=True, blank=True)
    contacts_lost = models.IntegerField(null=True, blank=True)
    hb_wild = models.IntegerField(null=True, blank=True)
    hb_var = models.IntegerField(null=True, blank=True)
    clash_wild = models.IntegerField(null=True, blank=True)
    clash_var = models.IntegerField(null=True, blank=True)
    polar_wild = models.IntegerField(null=True, blank=True)
    polar_var = models.IntegerField(null=True, blank=True)
    salt_wild = models.IntegerField(null=True, blank=True)
    salt_var = models.IntegerField(null=True, blank=True)
    hydro_wild = models.IntegerField(null=True, blank=True)
    hydro_var = models.IntegerField(null=True, blank=True)
    clashscore_wild = models.FloatField(null=True, blank=True)
    clashscore_var = models.FloatField(null=True, blank=True)
    pae_site_wild = models.FloatField(null=True, blank=True)
    pae_site_var = models.FloatField(null=True, blank=True)
    ref_aa = models.CharField(max_length=3, null=True, blank=True)  # three-letter wild-type residue at the variant position (e.g. ASP)
    position = models.IntegerField(null=True, blank=True)
    method_version = models.CharField(max_length=20, null=True, blank=True)
    ddg = models.FloatField(null=True, blank=True)  # stability change ddG (kcal/mol, positive = destabilizing); predicted by ThermoMPNN from the wild-type AF3 structure
    local_fit_rmsd = models.FloatField(null=True, blank=True)  # C-alpha RMSD after aligning only the residues within 10 A of the variant (A); not affected by the global alignment
    local_fit_site = models.FloatField(null=True, blank=True)  # C-alpha displacement at the variant position in the same alignment (A)

    class Meta:
        unique_together = (('gene_nm', 'variant'),)

    def __str__(self):
        return '%s %s' % (self.gene_nm, self.variant)
