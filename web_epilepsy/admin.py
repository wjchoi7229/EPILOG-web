from django.contrib import admin

from .models import VariantEvaluation


class VariantEvaluationAdmin(admin.ModelAdmin):
    """Curators can edit takeaway_curated, curator and curated_date."""
    search_fields = ['gene_nm', 'variant']
    list_display = ('gene_nm', 'variant', 'eval_pathogenicity', 'eval_function', 'function_source',
                    'concordance', 'confidence', 'rule_version')
    list_filter = ('gene_nm', 'eval_function', 'concordance', 'confidence')


admin.site.register(VariantEvaluation, VariantEvaluationAdmin)
