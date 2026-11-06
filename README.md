# EPILOG web application

Web application of **EPILOG** (EPILepsy solution On Genome data portal), an integrated
genotype–phenotype–function database for epilepsy-associated variants that incorporates a Korean patient cohort.

- Public web resource: <https://epilog.info/>
- Source code (this repository): <https://github.com/wjchoi7229/EPILOG-web>

This repository contains the code of the web application only. The database and the predicted structure files are not part of
the repository (see [Data availability](#data-availability)).

## What the application provides

| Page | URL | Content |
|---|---|---|
| Main | `/` | Gene / variant search with autocomplete (one- and three-letter amino-acid notation, HGVS protein or cDNA notation) and database summary charts |
| Search list | `/searchList` | Variants of a gene with patient-level summaries, column filters and sorting, gene structure diagram and gene-level charts |
| Clinical info | `/clinicalInfo/<id>` | Patient-level clinical and genetic information of one record (seizure features, age at onset, course, treatment response, literature links, ClinVar / LitVar links) |
| Variant effects | `/variantEffects/<id>` | Experimental functional evidence (patch-clamp parameters with source publications), pathogenicity predictions (REVEL, AlphaMissense, CADD PHRED) and functional-direction predictions (SCION, funNCion) |
| 3D structure | `/prdctn_result/<gene>/<variant>` | Interactive wild-type and variant AlphaFold 3 models (iCn3D), pLDDT / PAE charts, RMSD, TM-score and local structural metrics |
| Report | `/report/<id>` | One-page integrated variant report: evaluation (pathogenicity, functional effect, concordance, confidence), structural assessment and an interpretation text |
| Tutorial / Credits | `/tutorial`, `/credits` | Usage slides; data sources, tool versions and licenses |

The decision rules of the variant evaluation are implemented in `web_epilepsy/utils/evaluation_rules.py`; the structural metrics
in `web_epilepsy/utils/local_structure.py` and `web_epilepsy/utils/rmsd_utils.py`.

## Repository layout

```
manage.py
prj_epilepsy/        Django project (settings, URLs, WSGI/ASGI)
web_epilepsy/        Application: models, views, URL routes, utilities
  utils/             Evaluation rules, structure metrics (RMSD, TM-score, DSSP), PAE down-sampling, statistics, parsers
  migrations/        Database schema
templates/epilepsy/  HTML templates
static/              CSS, JavaScript, fonts, images, bundled third-party libraries
docs/                Deployment notes
```

## Requirements

- Python 3.9 – 3.11
- Django 4.1, numpy, pandas (see `requirements.txt`)
- A SQLite database in the EPILOG schema and, optionally, predicted structure files (see below)

## Quick start

```bash
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt

export DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(50))')"
export DJANGO_DEBUG=true            # development only
python manage.py migrate            # creates an empty database with the EPILOG schema
python manage.py runserver
```

With an empty database the pages render without records. To use a populated database, point `EPILOG_DB_PATH` to it.

### Configuration (environment variables)

| Variable | Default | Meaning |
|---|---|---|
| `DJANGO_SECRET_KEY` | development placeholder | Secret key; **must be set in production** |
| `DJANGO_DEBUG` | `false` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated host names |
| `EPILOG_DB_PATH` | `./epilepsy_db.sqlite3` | SQLite database file |
| `EPILOG_STRUCTURE_DIR` | `./data/af2result` | Root of the structure files (below) |

Further Django settings can be overridden in an untracked `prj_epilepsy/local_settings.py`.

### Structure files (optional)

The 3D pages read the top-ranked AlphaFold 3 model of each wild-type and variant protein:

```
<EPILOG_STRUCTURE_DIR>/<GENE>/<GENE>_wild/ranked_0.pdb
<EPILOG_STRUCTURE_DIR>/<GENE>/<GENE>_<VARIANT>/ranked_0.pdb
                                               ranked_0_plddt.csv
                                               ranked_0_pae_downsampled_t200.json
```

Pre-generated one-page report PDFs can be placed in `data/report_pdf/<record id>.pdf`; without them the report page offers an
in-browser PDF export.

### Highcharts (not included)

The charts use [Highcharts](https://www.highcharts.com/) v10.3.1, which is not distributed in this repository because of its license
terms (free for non-commercial use only). Download it from the Highcharts website and place the following files in
`static/js/hichart/` (they are ignored by git):

```
highcharts.js  highcharts-more.js  highcharts-3d.js
modules/accessibility.js  modules/boost-canvas.js  modules/boost.js  modules/exporting.js
modules/heatmap.js  modules/series-label.js  modules/stock.js  modules/xrange.js
```

Without Highcharts the charts are not drawn; the rest of the pages still work.

### Admin

`/admin/` provides the Django admin, where curators can edit the takeaway text of the variant evaluations
(`takeaway_curated`, `curator`, `curated_date`). Create an administrator with `python manage.py createsuperuser`.

### Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a gunicorn / nginx example.

## Data availability

The EPILOG web resource is freely available at <https://epilog.info/>, and the source code of the web application is available in
this repository. Data that are not provided through the web interface, including the original source data and AlphaFold 3 outputs
other than the top-ranked (ranked_0) models, are not publicly hosted because of their size and are available from the
corresponding authors on reasonable request.

## Third-party resources and terms

EPILOG integrates predictions and annotations from third-party resources (e.g. REVEL, AlphaMissense, CADD, SCION, funNCion,
ThermoMPNN, AlphaFold 3, ClinVar, LitVar, gnomAD, neXtProt). Their versions, licenses and citations are listed on the
Credits & Licenses page of the web resource (`/credits`). In particular:

- AlphaFold 3 outputs are provided under the AlphaFold 3 Output Terms of Use (non-commercial use only; do not share them with
  commercial organizations). For this reason structure files are not distributed in this repository.
- REVEL and CADD scores are freely available for non-commercial use.

The JavaScript libraries and fonts bundled in `static/` keep their own licenses, and Highcharts must be obtained separately; see [NOTICE](NOTICE).

## License

The code of this repository is released under the Apache License 2.0 (see [LICENSE](LICENSE)). Bundled third-party components are
excluded from this license and are listed in [NOTICE](NOTICE).

## Disclaimer

EPILOG provides computational predictions and curated literature evidence for research use only. The evaluations are not a clinical
classification and have not been validated for clinical use.
