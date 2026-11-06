from django.urls import path
from . import views

app_name = 'epilepsy'

urlpatterns = [
    path('', views.epilepsy_main, name='main'),
    path('main', views.epilepsy_main, name='main'),
    path('prdctn_result/<str:gene_nm>/<str:vrat_info_letter>', views.prdctn_result, name='prdctn_result'),
    path('prdctn_rmsd/<str:gene_nm>/<str:vrat_info_letter>', views.prdctn_rmsd, name='prdctn_rmsd'),
    path('prdctn_result_download/<str:gene_nm>/<str:vrat_info_letter>', views.prdctn_result_download, name='prdctn_result_download'),
    path('filedownload', views.file_download, name='filedownnload'),
    path('pae_heatmap', views.pae_heatmap, name='pae_heatmap'),
    path('variant_suggest', views.variant_suggest, name='variant_suggest'),
    path('searchList', views.searchList, name='searchList'),
    path('tutorial', views.tutorial, name='tutorial'),
    path('credits', views.credits, name='credits'),
    path('report/<int:eplp_anl_info_seq>', views.report, name='report'),
    path('report/<int:eplp_anl_info_seq>/pdf', views.report_pdf, name='report_pdf'),
    path('clinicalInfo/<int:eplp_anl_info_seq>', views.clinicalInfo, name='clinicalInfo'),
    path('variantEffects/<int:eplp_anl_info_seq>', views.variantEffects, name='variantEffects'),
]
