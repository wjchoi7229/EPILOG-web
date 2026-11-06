from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.http import HttpResponse, HttpResponseNotAllowed, FileResponse, Http404
from django.http import JsonResponse
from django.shortcuts import render
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage

from django.db import transaction
from django.db.models import Q, Case, When, Value, IntegerField
from django.conf import settings
from django.contrib.staticfiles import finders

from web_epilepsy.models import FunctionalAssayInfo, EplpAnlInfo, AtonsetInfo, PrgssInfo, LtrtreInfo, VariantEvaluation
from web_epilepsy.utils.af2_result_utils import Af2ResultUtils
from web_epilepsy.utils.clinical_field_info import get_field_descriptions
from web_epilepsy.utils.main_summary_stats import get_main_summary_context
from web_epilepsy.utils.pae_utils import get_downsampled_pae
from web_epilepsy.utils.searchlist_stats import get_search_gene_summary
from web_epilepsy.utils.phenotype_groups import GROUP_NAMES, SHORT as PHENOTYPE_SHORT
from datetime import datetime

import math
from io import BytesIO
import re
import json
import os
import zipfile
import pandas as pd

_epilepsy_dir = settings.EPILEPSY_DIR[settings.EPILEPSY_ENV]

# Main page.
def epilepsy_main(request):
    return render(request, 'epilepsy/epilepsy_main.html', get_main_summary_context())

    


        

# 3D structure page of a variant (wild-type reference and variant).
def prdctn_result(request, gene_nm, vrat_info_letter): 
    # Look up the stored structure files.
    af2_result_utils = Af2ResultUtils()
    af2_result_info = af2_result_utils.get_af2_result(gene_nm, vrat_info_letter)
    
    context = {
                'gene_nm' : gene_nm,
                'vrat_info_letter': vrat_info_letter,
               'af2_result_info':af2_result_info,
               'devEnv':settings.EPILEPSY_ENV,
               }
    
    result_page = 'epilepsy/prdctn_result_cv2.html'

    rank_result = []

    avg_plddt_info = ['0','0','0','0','0']

    # Per-rank information (the wild-type of the searched gene itself is used as the reference).
    for rank in range(0, getattr(settings, 'AF2_MODELS_TO_SERVE', 5)):
        tmp_result = {
            'aa_seq_knd' : '{}_wild'.format(gene_nm),
            'avg_plddt' : avg_plddt_info[rank],
            'pdb_file' : '{}/{}_wild/ranked_{}.pdb'.format(gene_nm,gene_nm,rank),
            'PAE_json_file' : '{}/{}_wild/pae_model_{}_ptm_pred_0.json'.format(gene_nm, gene_nm, rank+1),
            'pae_csv_file' : '{}/{}_wild/ranked_{}_pae.csv'.format(gene_nm, gene_nm, rank),
            'pLDDT_cvs_file' : '{}/{}_wild/ranked_{}_plddt.csv'.format(gene_nm, gene_nm, rank),
        }
        rank_result.append(tmp_result)

    # The reference list is passed as is: the reference is always the wild-type of the gene being viewed,
    # so it does not need to be wrapped in a gene-name key.
    context['wuhan_result'] = rank_result
    return render(request, result_page, context)



# Serves only the structure files (pdb, csv, json) read by the 3D viewer and the charts.
# Requests outside the allowed folder or with a non-allowed extension are rejected with 404,
# and files are returned for inline display, not as attachments.
_AF2_ALLOWED_EXT = ('.pdb', '.csv', '.json')


def _safe_af2_path(base_dir, file_name):
    base = os.path.realpath(base_dir)
    if not file_name or not file_name.lower().endswith(_AF2_ALLOWED_EXT):
        raise Http404('not allowed')
    path = os.path.realpath(os.path.join(base, file_name))
    if os.path.commonpath([base, path]) != base or not os.path.isfile(path):
        raise Http404('not found')
    return path


def _af2_base_dir(file_type):
    # "{gene}_wild" is the wild-type folder; anything else is a variant result folder
    if file_type and file_type.endswith('_wild'):
        return _epilepsy_dir[5]
    return _epilepsy_dir[2]


def file_download(reqeust):
    file_name = reqeust.GET.get('file_name')
    file_type = reqeust.GET.get('file_type')
    file_path = _safe_af2_path(_af2_base_dir(file_type), file_name)
    # DSSP secondary structure (HELIX/SHEET records) is prepended to the pdb; otherwise iCn3D asks NCBI to compute it every time a structure is opened, which is slow.
    if file_path.lower().endswith('.pdb'):
        from web_epilepsy.utils import ss_records, rmsd_utils
        # The variant structure is served in the coordinate frame superposed on the wild structure, so that both structures start in the same orientation on the 3D page.
        transform = None
        parts = (file_name or '').split('/')
        if len(parts) == 3 and not parts[1].endswith('_wild'):
            try:
                wild_path = _safe_af2_path(_epilepsy_dir[5], '{0}/{0}_wild/ranked_0.pdb'.format(parts[0]))
                transform = rmsd_utils.alignment(wild_path, file_path)
            except Http404:
                transform = None
        return HttpResponse(ss_records.pdb_with_ss(file_path, transform), content_type='chemical/x-pdb')
    return FileResponse(open(file_path, 'rb'), as_attachment=False)

# C-alpha RMSD / per-residue displacement between the wild-type and variant structures (ranked_0), returned as JSON for the 3D page.
def prdctn_rmsd(request, gene_nm, vrat_info_letter):
    if not re.fullmatch(r'[A-Za-z0-9]{2,15}', gene_nm or '') or not re.fullmatch(r'[A-Za-z0-9_]{1,40}', vrat_info_letter or ''):
        raise Http404('invalid')
    from web_epilepsy.utils import rmsd_utils
    var_pdb = _safe_af2_path(_epilepsy_dir[2], '{0}/{0}_{1}/ranked_0.pdb'.format(gene_nm, vrat_info_letter))
    wild_pdb = _safe_af2_path(_epilepsy_dir[5], '{0}/{0}_wild/ranked_0.pdb'.format(gene_nm))
    stored = _stored_structure_metrics(gene_nm, vrat_info_letter)
    # If precomputed values exist (database), TM-score (slow) and the local metrics are taken from them and only the per-residue distances are computed on the fly.
    res = rmsd_utils.compare(wild_pdb, var_pdb, tm=stored is None)
    if res is None:
        raise Http404('no common residues')
    out = rmsd_utils.public_result(res)
    if stored:
        if stored[0].get('tm') is not None:
            out['tm'] = stored[0]['tm']
        if stored[0].get('ddg') is not None:
            out['ddg'] = stored[0]['ddg']
        out['local'] = stored[1]
    else:
        try:
            from web_epilepsy.utils import local_structure
            out['local'] = local_structure.analyze(wild_pdb, var_pdb, vrat_info_letter, res)
        except Exception:
            out['local'] = None
    return JsonResponse(out)

# Result download: only the ranked_0 (top-ranked model) files of the variant folder and the wild-type folder are zipped.
# Only files with an allowed extension are read from the folder layout {gene}/{gene}_{variant} and {gene}/{gene}_wild.
_AF2_RANK0_FILES = ('ranked_0.pdb', 'ranked_0_plddt.csv', 'ranked_0_pae_downsampled_t200.json')


_AF3_TERMS_TEXT = (
    'These files are AlphaFold 3 outputs, provided under and subject to the AlphaFold 3 Output Terms of Use.\r\n'
    'By using this information, you agree to AlphaFold 3 Output Terms of Use found at\r\n'
    'https://github.com/google-deepmind/alphafold3/blob/main/OUTPUT_TERMS_OF_USE.md\r\n'
    'Use is limited to non-commercial purposes; do not share the output with any commercial organization.\r\n'
    'Citation: Abramson J, et al. Accurate structure prediction of biomolecular interactions with AlphaFold 3. Nature 2024.\r\n')


def prdctn_result_download(request, gene_nm, vrat_info_letter):
    if not re.fullmatch(r'[A-Za-z0-9]{2,15}', gene_nm or '') or not re.fullmatch(r'[A-Za-z0-9_]{1,40}', vrat_info_letter or ''):
        raise Http404('invalid')
    folders = [('{}_{}'.format(gene_nm, vrat_info_letter), _epilepsy_dir[2]), ('{}_wild'.format(gene_nm), _epilepsy_dir[5])]
    # If the top-ranked model of the variant does not exist (including the case where only wild exists), the result is treated as not found.
    _safe_af2_path(_epilepsy_dir[2], '{}/{}/ranked_0.pdb'.format(gene_nm, folders[0][0]))
    buf = BytesIO()
    n_files = 0
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('AlphaFold3_OUTPUT_TERMS.txt', _AF3_TERMS_TEXT)
        for folder, base in folders:
            for fname in _AF2_RANK0_FILES:
                try:
                    path = _safe_af2_path(base, '{}/{}/{}'.format(gene_nm, folder, fname))
                except Http404:
                    continue
                zf.write(path, '{}/{}'.format(folder, fname))
                n_files += 1
    if n_files == 0:
        raise Http404('no result')
    buf.seek(0)
    return FileResponse(buf, as_attachment=True, filename='{}_{}_ranked_0.zip'.format(gene_nm, vrat_info_letter))


# Returns the PAE (Predicted Aligned Error) matrix downsampled by grid averaging.
# The original matrix is thousands x thousands, which is heavy to transfer and render,
# so it is reduced to about the target grid size (default 200x200, about 40,000 points) and can be drawn
# by the front end as plain SVG without GPU (WebGL boost) acceleration.
# The downsampled result is cached next to the original CSV as *_downsampled_t{target}.json and reused;
# with the cache file alone the response is possible without the heavy original CSV (see pae_utils.get_downsampled_pae).
def pae_heatmap(request):
    file_name = request.GET.get('file_name')
    file_type = request.GET.get('file_type')
    target = int(request.GET.get('target', 200))

    base = os.path.realpath(_af2_base_dir(file_type))
    file_path = os.path.realpath(os.path.join(base, file_name or ''))
    # Paths outside the allowed folder (.. etc.) are rejected. The PAE may exist only as a cache json without the original csv, so existence is not checked separately.
    if os.path.commonpath([base, file_path]) != base or not file_path.lower().endswith(_AF2_ALLOWED_EXT):
        raise Http404('not allowed')

    result = get_downsampled_pae(file_path, target)

    return JsonResponse(result)





# EPILOG user tutorial: shows static/img/tutorial/slide01.png ... slideNN.png one by one
def tutorial(request):
    tut_dir = os.path.join(settings.BASE_DIR, 'static', 'img', 'tutorial')
    n = len([f for f in os.listdir(tut_dir) if re.fullmatch(r'slide\d+\.png', f)]) if os.path.isdir(tut_dir) else 0
    return render(request, 'epilepsy/tutorial.html', {'slides': ['img/tutorial/slide%02d.png' % i for i in range(1, n + 1)]})


# Data sources, tool versions and licenses (Credits & Licenses page). The one-line source note at the bottom of the report links here.
def credits(request):
    return render(request, 'epilepsy/credits.html', {})





# jinhee add views page

# Default-sort "information richness" score: samples with more Clinical info / Protein 3D / Variant effects / Report content come first.
# The data does not change while the server is running, so it is computed once per process.
_RICHNESS = {}


def _filled(obj, skip):
    names = [f.name for f in obj._meta.concrete_fields if f.name not in skip and not f.primary_key and not f.is_relation]
    n = sum(1 for nm in names if getattr(obj, nm) not in (None, '', ' '))
    return n / len(names) if names else 0.0


def _richness_scores():
    if _RICHNESS:
        return _RICHNESS
    from django.db.models import Exists, OuterRef
    clin = {}
    for model in (AtonsetInfo, PrgssInfo, LtrtreInfo):
        seen = set()
        for o in model.objects.all().iterator():
            k = o.eplp_anl_info_seq_id
            if k in seen:
                continue
            seen.add(k)
            clin[k] = clin.get(k, 0.0) + _filled(o, set())
    assay = set(FunctionalAssayInfo.objects.values_list('eplp_anl_info_seq_id', flat=True).distinct())
    basic = ('sex', 'clinvar_pathogenicity', 'clinvar_id', 'variant_c', 'ensembl_transcript', 'litvar_link')  # race (Korean cohort marker) is not counted in the information richness
    pred = ('revel_score', 'alphamissense_score', 'cadd_phred')
    for e in EplpAnlInfo.objects.all().iterator():
        c = clin.get(e.eplp_anl_info_seq, 0.0) / 3.0 + sum(1 for b in basic if getattr(e, b)) / len(basic)   # Clinical info (0~2)
        p3 = 1.0 if e.pdb_retnt_yn == 'Y' else 0.0                                                          # Protein 3D structure
        ve = sum(1 for b in pred if getattr(e, b) is not None) / 3.0 + (1.0 if e.eplp_anl_info_seq in assay else 0.0)   # Variant effects / Report (0~2)
        _RICHNESS[e.eplp_anl_info_seq] = round(c + 2 * p3 + ve, 3)
    return _RICHNESS


# Variant autocomplete (main search box, Variants filter of the Search list): amino-acid substitutions only, one- or three-letter notation
def variant_suggest(request):
    from web_epilepsy.utils.variant_suggest import suggest
    return JsonResponse({'items': suggest(request.GET.get('q', ''), request.GET.get('gene') or None)})


# Search list page.
def searchList(request):
    # prdctnForm = PrdctnForm()
    params = request.POST if request.method == 'POST' else request.GET
    totalSch = params.get('totalSch')
    # current page requested
    page = params.get('page',1)
  # print(page)
    currentPage = int(page)
    
    # Fetch the model data.
    # Returns all matching rows as a list.
    # Besides the gene name / one-letter variant code (R19K), candidates are built so that the three-letter HGVS protein notation
    # ("Arg19Lys" or "p.Arg19Lys") and the cDNA change ("56G>A" or "c.56G>A") also match
    # (with or without the "p." / "c." prefix).
    searchQ = Q(gene_nm=totalSch) | Q(vrat_info_letter__iexact=totalSch)
    if totalSch:
        stripped = totalSch.strip()
        protein_candidates = {stripped}
        if stripped[:2].lower() == 'p.':
            protein_candidates.add(stripped[2:])
        else:
            protein_candidates.add('p.' + stripped)
        for pc in protein_candidates:
            searchQ |= Q(trnscr_nm__iexact=pc)

        cdna_candidates = {stripped}
        if stripped[:2].lower() == 'c.':
            cdna_candidates.add(stripped[2:])
        else:
            cdna_candidates.add('c.' + stripped)
        for cc in cdna_candidates:
            searchQ |= Q(variant_c__iexact=cc)

    # "SCN2A R1319Q" form chosen from the autocomplete (gene + variant; three-letter notation is also accepted)
    if totalSch and len(totalSch.split()) == 2:
        from web_epilepsy.utils import variant_suggest as _vs
        _g, _rest = _vs.split_query(totalSch)
        _p = _vs.parse(_rest)
        if _g and _p and _p[2]:
            searchQ |= Q(gene_nm=_g, vrat_info_letter__iexact=_p[0] + _p[1] + _p[2])
    baseEplpInfo = EplpAnlInfo.objects.filter(searchQ)

    # The gene structure diagram (SVG) is looked up by the gene name of the search result. totalSch may be an amino-acid code,
    # so the gene_nm of the actually matched records is used instead of the query. A default image is used if the file does not exist.
    # The diagram and summary charts are taken from the result before the column filters are applied,
    # so that they stay based on the original query even if a column filter yields zero rows.
    firstResult = baseEplpInfo.first()
    searchedGene = firstResult.gene_nm if firstResult else None

    # --- column filters / sorting of the list table (submitted from the header UI) ---
    filter_mutation = params.get('filter_mutation', '')
    filter_variant = params.get('filter_variant', '').strip()
    filter_protein3d = params.get('filter_protein3d', '')
    filter_exp = params.get('filter_exp', '')
    filter_phenotype = params.get('filter_phenotype', '')
    sort_by = params.get('sort_by', '')
    sort_dir = params.get('sort_dir', 'asc')

    resultEplpInfo = baseEplpInfo
    if filter_mutation:
        resultEplpInfo = resultEplpInfo.filter(mutation_type=filter_mutation)
    if filter_variant:
        resultEplpInfo = resultEplpInfo.filter(
            Q(vrat_info_letter__icontains=filter_variant) | Q(trnscr_nm__icontains=filter_variant)
        )
    if filter_protein3d == 'yes':
        resultEplpInfo = resultEplpInfo.filter(pdb_retnt_yn='Y')
    elif filter_protein3d == 'no':
        resultEplpInfo = resultEplpInfo.exclude(pdb_retnt_yn='Y')
    # Variant effects column: only samples that have Experimental Functional Evidence (measured functional data)
    if filter_exp == 'yes':
        resultEplpInfo = resultEplpInfo.filter(funcassayinfo__isnull=False).distinct()
    # Phenotype column: filtered by the group (PrgssInfo.phenotype_group)
    if filter_phenotype in GROUP_NAMES:
        resultEplpInfo = resultEplpInfo.filter(prgssinfo__phenotype_group=filter_phenotype).distinct()

    SORT_FIELD_MAP = {
        'sample': 'patient_no',
        'genes': 'gene_nm',
        'mutation_type': 'mutation_type',
        'variant': 'vrat_info_letter',
        'protein3d': 'pdb_retnt_yn',
    }
    # Mutation Type order: Point mutation (small mutation) -> CNV (large CNV) -> no value
    mt_order = Case(
        When(mutation_type='Small mutation', then=Value(0)),
        When(mutation_type='Large CNV', then=Value(1)),
        default=Value(2),
        output_field=IntegerField(),
    )
    if sort_by == 'mutation_type':
        resultEplpInfo = resultEplpInfo.annotate(mt_order=mt_order).order_by(
            '-mt_order' if sort_dir == 'desc' else 'mt_order', 'eplp_anl_info_seq')
    elif sort_by in SORT_FIELD_MAP:
        order_field = SORT_FIELD_MAP[sort_by]
        if sort_dir == 'desc':
            order_field = '-' + order_field
        resultEplpInfo = resultEplpInfo.order_by(order_field, 'eplp_anl_info_seq')
    else:
        # Default sort: samples whose patient_no starts with "KOR" first, then Point mutation before CNV (registration order kept within them).
        # Default sort: Point mutation first, and within it samples with more information (Clinical info / 3D / Variant effects / Report) first.
        scores = _richness_scores()
        mt_rank = {'Small mutation': 0, 'Large CNV': 1}
        resultEplpInfo = sorted(resultEplpInfo, key=lambda e: (mt_rank.get(e.mutation_type, 2), -scores.get(e.eplp_anl_info_seq, 0), e.eplp_anl_info_seq))
    geneDiagramPath = None
    if searchedGene:
        candidatePath = f'img/sub/gene_diagram/{searchedGene}_1112x151_vector.svg'
        if finders.find(candidatePath):
            geneDiagramPath = candidatePath

    # Only the four items that match the per-gene Phenotype Review specification are aggregated from real data
    # (Age at seizure onset / Age at last follow-up / Phenotype /
    # Source in PMID). For genes without data only the corresponding chart is shown empty.
    geneSummary = get_search_gene_summary(searchedGene) if searchedGene else None

    # 10 rows per page
    paginator = Paginator(resultEplpInfo, 10)

    try:
        # Page range calculation.
        startIdx = max(currentPage-2, 1)  # at least page 1
        endIdx = currentPage+2
        endIdx = endIdx + (4 - (endIdx - startIdx))
        endIdx = min(endIdx, paginator.num_pages)  # at most the last page
        print(endIdx)
        print(startIdx)
        if endIdx == paginator.num_pages and paginator.num_pages > 3: 
            mod5PageRange = range(paginator.num_pages-3, paginator.num_pages+1)
        else :    
            mod5PageRange = range(startIdx, endIdx+1)
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        # If the page number is not an integer, the first page is used.
        page_obj = paginator.page(1)
    except EmptyPage:
        # If the page is empty, the last page is used.
        page_obj = paginator.page(paginator.num_pages)

    # For each row of the current page, attach the Phenotype group (short name) and the original value (in a single query)
    ids = [r.eplp_anl_info_seq for r in page_obj]
    pheno = {sid: (grp, orig, lab) for sid, grp, orig, lab in PrgssInfo.objects.filter(eplp_anl_info_seq_id__in=ids).values_list('eplp_anl_info_seq_id', 'phenotype_group', 'phenotype_review_category', 'phenotype_label')}
    for r in page_obj:
        grp, orig, lab = pheno.get(r.eplp_anl_info_seq, (None, None, None))
        r.pheno_group, r.pheno_short, r.pheno_orig, r.pheno_label = grp, PHENOTYPE_SHORT.get(grp), orig, (lab or orig)

    context = {'resultEplpInfo': page_obj, 'mod5PageRange': mod5PageRange, 'totalSch': totalSch,
               'searchedGene': searchedGene, 'geneDiagramPath': geneDiagramPath, 'geneSummary': geneSummary,
               'filter_mutation': filter_mutation, 'filter_variant': filter_variant,
               'filter_protein3d': filter_protein3d, 'filter_exp': filter_exp, 'filter_phenotype': filter_phenotype,
               'phenotype_options': [(g, PHENOTYPE_SHORT[g]) for g in GROUP_NAMES],
               'sort_by': sort_by, 'sort_dir': sort_dir}
    return render(request, 'epilepsy/searchList.html', context)


# Clinical info page.
def clinicalInfo(request, eplp_anl_info_seq):
    # Look up the analysis data
    eplpInfo = EplpAnlInfo.objects.filter(eplp_anl_info_seq = eplp_anl_info_seq).first()
    # Look up the at-onset data
    atOnset = eplpInfo.atonsetinfo.first() if eplpInfo else []
    # Look up the during-the-course data
    duringCourse = eplpInfo.prgssinfo.first() if eplpInfo else []
    # Look up the literature data
    literature = eplpInfo.ltrtreinfo.first() if eplpInfo else []
    # Per-gene Clinical info field descriptions (based on the per-gene Phenotype Review items)
    fieldDescriptions = get_field_descriptions(eplpInfo.gene_nm) if eplpInfo else []

    # Source in PMID: a plain numeric PMID becomes a PubMed link, a URL is used as the link as it is,
    # and anything else (unclear original format) is shown as text without a link.
    pmidHref = None
    if literature and literature.pmid:
        pmid_val = literature.pmid.strip()
        if pmid_val.isdigit():
            pmidHref = f'https://pubmed.ncbi.nlm.nih.gov/{pmid_val}/'
        elif pmid_val.startswith('http://') or pmid_val.startswith('https://'):
            pmidHref = pmid_val

    # ClinVar ID: multiple IDs separated by '; ' are split into individual links
    clinvarIds = []
    if eplpInfo and eplpInfo.clinvar_id:
        clinvarIds = [x.strip() for x in eplpInfo.clinvar_id.replace(',', ';').split(';') if x.strip().isdigit()]

    context = {
        'eplpInfo': eplpInfo,
        'clinvarIds': clinvarIds,
        'atOnset': atOnset,
        'duringCourse': duringCourse,
        'literature': literature,
        'fieldDescriptions': fieldDescriptions,
        'pmidHref': pmidHref,
        }

    return render(request, 'epilepsy/clinicalInfo.html', context) 

# Variant effects page: Experimental evidence / Pathogenicity prediction / Functional-direction prediction
# Genes covered by each tool (according to tooltip/paper). Genes outside the scope are treated as "not shown", not as 0.
FUNC_TOOL_GENES = {
    'SCION': {'SCN1A', 'SCN2A', 'SCN8A'},                                   # voltage-gated sodium channel
    'funNCion': {'SCN1A', 'SCN2A', 'SCN8A'},  # SCN/CACNA family (only SCN applies among the 13 genes)
}


TOOL_INFO = {
    'REVEL': {
        'desc': 'REVEL is an ensemble predictor designed to estimate the pathogenicity of rare missense variants by integrating multiple sequence conservation and functional prediction features.',
        'interp': '0-1: higher scores indicate greater evidence for pathogenicity. >=0.75: pathogenic evidence; <=0.15: benign evidence; 0.15-0.75: uncertain.',
        'link': 'https://pubmed.ncbi.nlm.nih.gov/27666373/', 'link_label': 'PMID: 27666373',
        'link2': 'https://github.com/quinlan-lab/pathoscore/tree/master/score-sets/GRCh37/REVEL', 'link2_label': 'quinlan-lab/pathoscore (REVEL)',
        'link3': 'https://sites.google.com/site/revelgenomics/', 'link3_label': 'REVEL website'},
    'AlphaMissense': {
        'desc': 'AlphaMissense is a deep-learning-based predictor designed to estimate the pathogenicity of missense variants by integrating protein sequence, evolutionary conservation, and structural context.',
        'interp': '0-1: higher scores indicate greater predicted pathogenicity. <0.34: likely benign; 0.34-0.564: ambiguous; >0.564: likely pathogenic.',
        'link': 'https://pubmed.ncbi.nlm.nih.gov/37733863/', 'link_label': 'PMID: 37733863',
        'link2': 'https://github.com/google-deepmind/alphamissense', 'link2_label': 'google-deepmind/alphamissense'},
    'CADD PHRED': {
        'desc': 'CADD is an integrative framework that estimates the relative deleteriousness of genetic variants by combining diverse genomic annotations into a single score.',
        'interp': 'PHRED-scaled score: higher scores indicate greater predicted deleteriousness. >=10: top 10%; >=20: top 1%; >=30: top 0.1% of potentially deleterious variants.',
        'link': 'https://pubmed.ncbi.nlm.nih.gov/30371827/', 'link_label': 'PMID: 30371827',
        'link2': 'https://github.com/kircherlab/CADD-scripts', 'link2_label': 'kircherlab/CADD-scripts'},
    'SCION': {
        'desc': 'SCION is a machine-learning-based predictor designed to estimate the functional direction of missense variants in voltage-gated sodium channels based on features derived from experimentally characterized variants.',
        'interp': 'Predicts the functional effect of a variant as loss-of-function (LoF) or gain-of-function (GoF). The score shown is the model-derived GoF probability (0 = LoF, 1 = GoF).',
        'link': 'https://github.com/christianbosselmann/SCION', 'link_label': 'christianbosselmann/SCION'},
    'funNCion': {
        'desc': 'funNCion is a machine-learning-based framework designed to predict the functional consequences of missense variants in voltage-gated ion channels, particularly variants in SCN and CACNA gene families.',
        'interp': 'Predicts whether a variant is likely to have a functional effect and estimates its functional direction as loss-of-function (LoF) or gain-of-function (GoF). The score shown is the GoF probability (0 = LoF, 1 = GoF).',
        'link': 'https://github.com/heyhen/funNCion', 'link_label': 'heyhen/funNCion'},
}


def _call_tokens(value):
    """Turns a stored value such as 'GOF / Non-specific' into [(text, colour class), ...] for display."""
    out = []
    for t in str(value or '').split('/'):
        t = t.strip()
        if not t:
            continue
        u = t.upper().replace('-', ' ')
        if u == 'GOF':
            out.append(('GoF', 'gof'))
        elif u == 'LOF':
            out.append(('LoF', 'lof'))
        elif u == 'NON SPECIFIC':
            out.append(('Non-specific', 'ns'))
        elif u == 'MIXED':
            out.append(('Mixed', 'mixed'))
        else:
            out.append((t, 'other'))
    return out


# Experimental functional evidence columns per gene family (display name, field). Nav is the existing set.
FAMILY_COLS = {
    '_nav': [('Current density', 'current_density'), ('Window current', 'window_current'), ('Inactivation curve', 'v_half_inactivation'),
             ('Activation curve', 'v_half_activation'), ('Inactivation tau', 'inactivation_tau')],
    'KCNQ2': [('Current density (hom)', 'current_density'), ('Current density (het)', 'current_density_het'), ('Activation V1/2 (hom)', 'v_half_activation'),
              ('Activation V1/2 (het)', 'v_half_activation_het'), ('Activation kinetics', 'activation_kinetics')],
    'GABRA1': [('GABA sensitivity', 'gaba_sensitivity'), ('Maximal current', 'max_current')],
}


# Source label per experimental evidence source (FunctionalAssayInfo.source): each row shows "Reference: <name>"; neXtProt is merged into one line in the Data sources box at the bottom (creditsNote.html)
_OWN_SOURCES = {'Supplementary Table 1'}
_ASSAY_SOURCES = {
    # 'Supplementary Table 1' was compiled by the EPILOG team itself, so it is left out of the source/license notes. Rows show only the PMID of the original study.
    'Paper extraction': ('Paper extraction', 'electrophysiology results that EPILOG curators extracted from the cited papers.'),
    'KCNT1 paper extraction': ('Paper extraction', 'electrophysiology results that EPILOG curators extracted from the cited papers.'),
    'SCN Viewer 133': ('SCN Viewer', 'electrophysiology results for SCN1A / SCN2A / SCN8A variants compiled in the EPILOG SCN Viewer curation and re-checked against the original papers (human channels only).'),
}


def _credit_tools(info):
    """Text for the bottom Data sources line: prediction tools whose scores appear on this variant page and that have usage conditions (AlphaMissense: CC BY 4.0, REVEL/CADD: non-commercial use). Empty string if none."""
    if info is None:
        return ''
    parts = []
    if getattr(info, 'alphamissense_score', None) is not None:
        parts.append('AlphaMissense (CC BY 4.0)')
    nc = [n for n, f in (('REVEL', 'revel_score'), ('CADD', 'cadd_phred')) if getattr(info, f, None) is not None]
    if nc:
        parts.append(' and '.join(nc) + ' (non-commercial use)')
    return ', '.join(parts)


def _variant_effects_context(eplp_anl_info_seq):
    eplpInfo = EplpAnlInfo.objects.filter(eplp_anl_info_seq=eplp_anl_info_seq).first()
    gene = eplpInfo.gene_nm if eplpInfo else None
    # Predictor values exist only for single amino-acid substitutions (missense)
    isMissense = bool(eplpInfo and eplpInfo.mutation_type == 'Small mutation' and eplpInfo.vrat_info_letter
                      and re.match(r'^[A-Z]\d+[A-Z]$', eplpInfo.vrat_info_letter)
                      and eplpInfo.vrat_info_letter[0] != eplpInfo.vrat_info_letter[-1])

    def tool(name, value, genes=None, pending=False, scale=1.0, direction=False):
        if not isMissense:
            state, reason = 'na', 'Not a single amino-acid substitution (missense) variant.'
        elif genes is not None and gene not in genes:
            state, reason = 'na', '%s is not applicable to %s.' % (name, gene)
        elif value is not None:
            state, reason = 'value', ''
        elif pending:
            state, reason = 'pending', 'Data in preparation.'
        else:
            state, reason = 'empty', 'No score available for this variant.'
        call = None
        if state == 'value' and direction:
            call = 'GoF' if value > 0.5 else 'LoF'
        pct = None if value is None else round(max(0.0, min(1.0, value / scale)) * 100, 1)
        return {'name': name, 'value': value, 'state': state, 'reason': reason, 'pct': pct,
                'call': call, 'info': TOOL_INFO[name]}

    pathogenicity = []
    funcDirection = []
    assays = []
    fam_cols = FAMILY_COLS['_nav']
    fam_fields = [f for _, f in fam_cols]
    if eplpInfo:
        pathogenicity = [
            tool('REVEL', eplpInfo.revel_score),
            tool('AlphaMissense', eplpInfo.alphamissense_score),
            tool('CADD PHRED', eplpInfo.cadd_phred, pending=True, scale=40.0),
        ]
        funcDirection = [
            tool('SCION', eplpInfo.scion_gof_prob, FUNC_TOOL_GENES['SCION'], direction=True),
            tool('funNCion', eplpInfo.funncion_gof_prob, FUNC_TOOL_GENES['funNCion'], direction=True),
        ]
        assays = list(eplpInfo.funcassayinfo.all())
        fam_cols = FAMILY_COLS.get(eplpInfo.gene_nm, FAMILY_COLS['_nav'])
        fam_fields = [f for _, f in fam_cols]
        # PMID cell: a numeric ID becomes a PubMed link; other text (e.g. Korean study) is shown as it is
        for a in assays:
            parts = []
            for tok in [t.strip() for t in str(a.pmid or '').split('/') if t.strip()]:
                parts.append({'text': tok, 'href': ('https://pubmed.ncbi.nlm.nih.gov/%s/' % tok) if tok.isdigit() else None})
            a.pmid_parts = parts
            # For display: per-item [(text, colour class)], Result, source / species / experimental system
            a.d = {f: _call_tokens(getattr(a, f)) for f in ('current_density', 'window_current', 'v_half_inactivation', 'v_half_activation',
                                                             'inactivation_tau', 'recovery_inactivation', 'persistent_current',
                                                             'current_density_het', 'v_half_activation_het', 'activation_kinetics', 'gaba_sensitivity', 'max_current')}
            a.cells = [(lab, a.d[f]) for lab, f in fam_cols]
            vs = a.variant_set or ''
            a.population = vs.startswith('Population')
            a.res = _call_tokens(a.gof_lof_mixed)
            a.src = a.source or ''
            a.src_label = _ASSAY_SOURCES.get(a.src, (a.src,))[0] if a.src and a.src != 'neXtProt' else a.src
            a.src_show = bool(a.src) and a.src not in _OWN_SOURCES  # own compiled data get no 'Source:' line

    evaluation = None
    if eplpInfo and eplpInfo.vrat_info_letter:
        evaluation = VariantEvaluation.objects.filter(gene_nm=eplpInfo.gene_nm, variant=eplpInfo.vrat_info_letter).first()
    evaluation_basis = None
    if evaluation:
        from web_epilepsy.utils.evaluation_rules import basis as _ev_basis
        evaluation_basis = _ev_basis(evaluation, dict(revel=eplpInfo.revel_score, am=eplpInfo.alphamissense_score, cadd=eplpInfo.cadd_phred), assays)
    context = {
        'eplpInfo': eplpInfo,
        'isMissense': isMissense,
        'evaluation_basis': evaluation_basis,
        'pathogenicity': pathogenicity,
        'funcDirection': funcDirection,
        'assays': assays,
        'fam_cols': [l for l, _ in fam_cols],
        'fam_extra': eplpInfo.gene_nm == 'KCNQ2' if eplpInfo else False,
        'credit_tools': _credit_tools(eplpInfo),
        'has_nextprot': any((getattr(a, 'source', None) or '') == 'neXtProt' for a in assays),
        'credit_sources': [dict(name=_ASSAY_SOURCES[s][0], text=_ASSAY_SOURCES[s][1]) for s in dict.fromkeys((getattr(a, 'source', None) or '') for a in assays) if s in _ASSAY_SOURCES],
        'show_extra': fam_cols is FAMILY_COLS['_nav'] and any(getattr(a, 'recovery_inactivation', None) or getattr(a, 'persistent_current', None) for a in assays),
        'evaluation': evaluation,
        'takeaway': (evaluation.takeaway_curated or evaluation.takeaway_auto) if evaluation else None,
        'takeaway_curated': bool(evaluation and evaluation.takeaway_curated),
    }
    return context


def variantEffects(request, eplp_anl_info_seq):
    return render(request, 'epilepsy/variantEffects.html', _variant_effects_context(eplp_anl_info_seq))


# Per-sample report: patient/variant summary + the three Variant effects panels (number cards).
def _report_verdict(name, value):
    """Per-tool call text / colour class / criterion description. value is a number (None if missing)."""
    if value is None:
        return None
    if name == 'REVEL':
        if value >= 0.75: return ('Pathogenic evidence', 'path', 'threshold ≥ 0.75')
        if value <= 0.15: return ('Benign evidence', 'benign', 'threshold ≤ 0.15')
        return ('Uncertain', 'unc', 'between 0.15 and 0.75')
    if name == 'AlphaMissense':
        if value > 0.564: return ('Likely pathogenic', 'path', 'threshold > 0.564')
        if value < 0.34: return ('Likely benign', 'benign', 'threshold < 0.34')
        return ('Ambiguous', 'unc', 'between 0.34 and 0.564')
    if name == 'CADD PHRED':
        if value >= 30: return ('Top 0.1% deleterious', 'path', 'threshold ≥ 30')
        if value >= 20: return ('Top 1% deleterious', 'path', 'threshold ≥ 20')
        if value >= 10: return ('Top 10% deleterious', 'unc', 'threshold ≥ 10')
        return ('Below top 10%', 'benign', 'below 10')
    if name in ('SCION', 'funNCion'):
        return (('Leans GoF', 'gof', 'above 0.5') if value > 0.5 else ('Leans LoF', 'lof', 'below 0.5'))
    return None


def _stored_structure_metrics(gene_nm, variant):
    """Precomputed structure comparison metrics (VariantStructureMetrics) -> (dict in the compare() form, dict in the local_structure.analyze() form or None). None if absent."""
    from web_epilepsy.models import VariantStructureMetrics
    m = VariantStructureMetrics.objects.filter(gene_nm=gene_nm, variant=variant).first()
    if not m:
        return None
    rm = {'n': m.n_common, 'n_wild': m.n_wild, 'n_variant': m.n_variant, 'rmsd': m.rmsd_all, 'tm': m.tm_score}
    if m.ddg is not None:
        rm['ddg'] = m.ddg
    if m.rmsd_ss is not None:
        rm.update(rmsd_ss=m.rmsd_ss, n_ss=m.n_ss)
    L = None
    if m.position is not None and m.contacts_wild is not None:
        L = {'position': m.position, 'radius': 10.0, 'n_residues': m.n_local, 'local_rmsd': m.local_rmsd, 'site_displacement': m.site_disp, 'local_fit_rmsd': m.local_fit_rmsd, 'local_fit_site': m.local_fit_site,
             'plddt_site': [m.plddt_site_wild, m.plddt_site_var], 'plddt_local': [m.plddt_local_wild, m.plddt_local_var],
             'contacts': {'wild': m.contacts_wild, 'variant': m.contacts_var, 'gained': m.contacts_gained, 'lost': m.contacts_lost},
             'backbone_hbonds': [m.hb_wild, m.hb_var], 'clashes': [m.clash_wild, m.clash_var], 'residue_names': [m.ref_aa, None]}
        if m.polar_wild is not None:  # metrics computed with method v2 or later
            L.update(polar_contacts=[m.polar_wild, m.polar_var], salt_bridges=[m.salt_wild, m.salt_var], hydrophobic=[m.hydro_wild, m.hydro_var],
                     clashscore=[m.clashscore_wild, m.clashscore_var], pae_site=[m.pae_site_wild, m.pae_site_var])
    return rm, L


_NOISE_USABLE = 5.0  # Genes whose noise (95th percentile of the local-fit RMSD between variant and WT far from the variant) exceeds this value (A) are not evaluated, because a variant effect cannot be distinguished from noise
_NOISE_UNVERIFIED = set()  # genes excluded from the evaluation (empty: after recomputing with the full variant reference table all genes were within the normal range)
_noise_cache = {}


def _structure_noise(gene):
    """Per-gene structural-change noise (A). None if there is no value. Source: 95th percentile of the local-fit RMSD obtained by comparing variant structures with WT far from the variant (>= 15 A)."""
    if not _noise_cache:
        import csv
        try:
            with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'utils', 'structure_noise.csv'), encoding='utf-8') as f:
                for r in csv.DictReader(f):
                    _noise_cache[r['gene']] = float(r['abs_p95'])
        except OSError:
            _noise_cache['_'] = None
    return _noise_cache.get(gene)


def _structure_assess(gene, rm, L, ps, low):
    """Sentences to append to the three Structural evaluation cells and the Interpretation. Structural values are not used for the calls (Pathogenicity etc.)."""
    cells, parts = [], []
    # 1) Structure confidence (AlphaFold pLDDT bands)
    if ps and None not in ps:
        lo = min(ps)
        band = 'Very high' if lo > 90 else 'Confident' if lo >= 70 else 'Low' if lo >= 50 else 'Very low'
        cells.append({'k': 'Structural confidence', 'v': band, 'cls': {'Very high': 'pl-vh', 'Confident': 'pl-c', 'Low': 'pl-l'}.get(band, 'pl-vl'), 'basis': 'pLDDT at the site: wild %.1f / variant %.1f' % (ps[0], ps[1])})
    else:
        cells.append({'k': 'Structural confidence', 'v': 'Not available', 'cls': 'sd', 'basis': ''})
    # 2) Structural change: the local RMSD around the variant compared with the noise from WT predictions of the same gene
    noise = _structure_noise(gene)
    loc = L.get('local_fit_rmsd') if L else None
    if low:
        cells.append({'k': 'Structural change', 'v': 'Low confidence', 'cls': 'pl-l', 'basis': 'Site pLDDT < 70: structural change is not interpreted'})
    elif loc is None or noise is None:
        cells.append({'k': 'Structural change', 'v': 'Not available', 'cls': 'sd', 'basis': ''})
    elif gene in _NOISE_UNVERIFIED:
        cells.append({'k': 'Structural change', 'v': 'Not assessable', 'cls': 'sd', 'basis': 'Local Cα RMSD (local fit) %.2f Å; wild-type and variant prediction conditions for %s are under verification' % (loc, gene)})
    elif noise > _NOISE_USABLE:
        cells.append({'k': 'Structural change', 'v': 'Not assessable', 'cls': 'sd',
                      'basis': 'Local Cα RMSD (local fit) %.2f Å; prediction noise in %s is too large to tell (95th percentile %.1f Å)' % (loc, gene, noise)})
    elif loc > noise:
        cells.append({'k': 'Structural change', 'v': 'Beyond noise', 'cls': 'ch-out', 'basis': 'Local Cα RMSD (local fit) %.2f Å > prediction noise %.2f Å (95th percentile of variant-vs-WT differences away from the site)' % (loc, noise)})
        parts.append('The predicted structure shows a local change around the variant beyond prediction noise (local Cα RMSD %.2f Å)' % loc)
    else:
        cells.append({'k': 'Structural change', 'v': 'Within noise', 'cls': 'ch-in', 'basis': 'Local Cα RMSD (local fit) %.2f Å ≤ prediction noise %.2f Å (95th percentile of variant-vs-WT differences away from the site)' % (loc, noise)})
        parts.append('The predicted structure shows no local change around the variant beyond prediction noise')
    # 3) Stability change (ThermoMPNN ddG, kcal/mol, positive = destabilizing)
    d = rm.get('ddg')
    if d is None:
        cells.append({'k': 'Predicted stability', 'v': 'Not available', 'cls': 'sd', 'basis': ''})
    else:
        if d >= 1.0:
            lab, cls = 'Destabilizing', 'st-d'
        elif d >= 0.5:
            lab, cls = 'Mildly destabilizing', 'st-m'
        elif d > -0.5:
            lab, cls = 'Near neutral', 'sd'
        else:
            lab, cls = 'Stabilizing', 'st-s'
        cells.append({'k': 'Predicted stability', 'v': lab, 'cls': cls, 'basis': 'ΔΔG %+.2f kcal/mol (ThermoMPNN; positive = destabilizing; |ΔΔG| < 0.5 = near neutral)' % d})
        if not low:
            parts.append('the estimated effect on protein stability is %s (ΔΔG %+.2f kcal/mol)' % (lab.lower(), d))
    if low:
        text = 'Structure-based observations are not interpreted because the predicted structure has low confidence at this site (pLDDT < 70).'
    elif parts:
        text = parts[0] + (', and ' + parts[1] if len(parts) > 1 else '') + '. These structure-based values are exploratory and were not used in the evaluation above.'
        if not text[0].isupper():
            text = text[0].upper() + text[1:]
    else:
        text = ''
    return cells, text


def _report_structure(info):
    """Structure evaluation of the report: global and variant-neighbourhood comparison metrics of the wild-type and variant AF3 structures (ranked_0). None if there is no structure or it cannot be computed."""
    v = info.vrat_info_letter or ''
    if info.pdb_retnt_yn != 'Y' or not re.fullmatch(r'[A-Z]\d+[A-Z]', v):
        return None
    pair = _stored_structure_metrics(info.gene_nm, v)
    if pair is None:  # compute on the fly if there are no precomputed values
        try:
            from web_epilepsy.utils import rmsd_utils, local_structure
            var_pdb = _safe_af2_path(_epilepsy_dir[2], '{0}/{0}_{1}/ranked_0.pdb'.format(info.gene_nm, v))
            wild_pdb = _safe_af2_path(_epilepsy_dir[5], '{0}/{0}_wild/ranked_0.pdb'.format(info.gene_nm))
            rm = rmsd_utils.compare(wild_pdb, var_pdb)
            if rm is None:
                return None
            pair = (rm, local_structure.analyze(wild_pdb, var_pdb, v, rm))
        except Exception:
            return None
    rm, L = pair
    sg = lambda x: ('+' if x > 0 else '') + ('%.1f' % x if isinstance(x, float) else str(x))
    ps = L['plddt_site'] if L else None
    # Four summary cards: same look as the predictor cards (REVEL etc.). Structural metrics are not calls, so the value colour is a single one (blue),
    # and only the confidence card turns orange when the pLDDT at the variant position is below 70. Details such as local RMSD, displacement at the site, neighbourhood pLDDT and PAE are on the 3D page.
    low = bool(ps and None not in ps and min(ps) < 70)
    card = lambda title, num, unit='', verdict='', thr='', warn=False, desc='': {'title': title, 'num': num, 'unit': unit, 'verdict': verdict, 'thr': thr, 'warn': warn, 'desc': desc}
    if ps and None not in ps:
        lo = min(ps)
        band = 'Very high' if lo > 90 else 'Confident' if lo >= 70 else 'Low' if lo >= 50 else 'Very low'
        conf = card('Structural confidence', '%.1f / %.1f' % (ps[0], ps[1]), '', band, '', warn=low, desc='AlphaFold confidence (pLDDT) at the variant position, wild / variant.')
    else:
        conf = card('Structural confidence', '-', '', 'Not available', desc='AlphaFold confidence (pLDDT) at the variant position, wild / variant.')
    if L and L.get('polar_contacts'):
        pc, sb, hy = L['polar_contacts'], L['salt_bridges'], L['hydrophobic']
        side = card('Side-chain interactions', '%s / %s / %s' % (sg(pc[1] - pc[0]), sg(sb[1] - sb[0]), sg(hy[1] - hy[0])), '', 'Polar / salt / hydrophobic',
                    'contacts, wild→variant: %s→%s / %s→%s / %s→%s' % (pc[0], pc[1], sb[0], sb[1], hy[0], hy[1]),
                    desc='Change in polar, salt-bridge and hydrophobic contacts around the variant (wild → variant).')
    else:
        side = card('Side-chain interactions', '-', '', 'Not available', desc='Change in polar, salt-bridge and hydrophobic contacts around the variant (wild → variant).')
    if rm.get('ddg') is not None:
        d = rm['ddg']
        ddg = card('Predicted ΔΔG', '%+.2f' % d, 'kcal/mol', 'Destabilizing (> 0)' if d > 0 else 'Stabilizing (< 0)' if d < 0 else 'Neutral (0)', 'ThermoMPNN, from the wild-type structure', desc='Predicted change in protein stability; positive = destabilizing.')
    else:
        ddg = card('Predicted ΔΔG', '-', '', 'Not available', desc='Predicted change in protein stability; positive = destabilizing.')
    assess, interp = _structure_assess(info.gene_nm, rm, L, ps, low)
    # The structural-change card shows the same value (local-fit RMSD) and the same call as the Structural change cell of the Evaluation. The ddG card uses the same bands (assess).
    loc = L.get('local_fit_rmsd') if L else None
    desc_loc = 'Change in the 10 Å neighbourhood of the variant, judged against wild-type prediction noise.'
    back = card('Local structural change', '%.2f' % loc, 'Å', assess[1]['v'], 'Cα RMSD of residues within 10 Å, locally aligned', desc=desc_loc) if loc is not None         else card('Local structural change', '-', '', 'Not available', desc=desc_loc)
    if ddg['num'] != '-':
        ddg['verdict'] = assess[2]['v']
    return {'summary': [conf, back, side, ddg], 'low': low, 'assess': assess, 'interp': interp}


def report(request, eplp_anl_info_seq):
    context = _variant_effects_context(eplp_anl_info_seq)
    eplpInfo = context['eplpInfo']
    if not eplpInfo:
        raise Http404()
    for grp in (context['pathogenicity'], context['funcDirection']):
        for t in grp:
            vd = _report_verdict(t['name'], t['value']) if t['state'] == 'value' else None
            t['verdict'], t['vclass'], t['vthr'] = vd if vd else (None, None, None)
    atOnset = eplpInfo.atonsetinfo.first()
    duringCourse = eplpInfo.prgssinfo.first()
    literature = eplpInfo.ltrtreinfo.first()
    pmidHref = None
    if literature and literature.pmid and literature.pmid.strip().isdigit():
        pmidHref = 'https://pubmed.ncbi.nlm.nih.gov/%s/' % literature.pmid.strip()
    context['structure'] = _report_structure(eplpInfo)
    context['hide_evidence_details'] = True  # per-paper parameter details are shown only on the Variant effects page (the report contains the structure evaluation instead)
    context.update({'atOnset': atOnset, 'duringCourse': duringCourse, 'literature': literature, 'pmidHref': pmidHref,
                    'has_pdf': os.path.isfile(_report_pdf_path(eplp_anl_info_seq))})
    return render(request, 'epilepsy/report.html', context)


# Serves a precomputed one-page report PDF (selectable text). Files are created with the report-PDF generation script and stored in data/report_pdf/<number>.pdf.
def _report_pdf_path(seq):
    return os.path.join(settings.BASE_DIR, 'data', 'report_pdf', '%d.pdf' % int(seq))


def report_pdf(request, eplp_anl_info_seq):
    path = _report_pdf_path(eplp_anl_info_seq)
    info = EplpAnlInfo.objects.filter(eplp_anl_info_seq=eplp_anl_info_seq).first()
    if not info or not os.path.isfile(path):
        raise Http404()
    name = re.sub(r'[^A-Za-z0-9_.-]+', '_', 'EPILOG_%s_%s_%s.pdf' % (info.gene_nm, info.vrat_info_letter or 'variant', info.patient_no))
    return FileResponse(open(path, 'rb'), as_attachment=True, filename=name, content_type='application/pdf')






