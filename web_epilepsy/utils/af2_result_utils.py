from django.conf import settings


class Af2ResultUtils:
    """Builds the relative file names of the stored structure files (top-ranked model only)."""

    def get_af2_result(self, gene_nm, vrat_info_letter):
        rank_result = []
        for rank in range(0, getattr(settings, 'AF2_MODELS_TO_SERVE', 1)):
            rank_result.append({
                'avg_plddt': 0,
                'pdb_file': '{}/{}_{}/ranked_{}.pdb'.format(gene_nm, gene_nm, vrat_info_letter, rank),
                'PAE_json_file': '{}/{}_{}/pae_model_{}_ptm_pred_0.json'.format(gene_nm, gene_nm, vrat_info_letter, rank + 1),
                'pae_csv_file': '{}/{}_{}/ranked_{}_pae.csv'.format(gene_nm, gene_nm, vrat_info_letter, rank),
                'pLDDT_cvs_file': '{}/{}_{}/ranked_{}_plddt.csv'.format(gene_nm, gene_nm, vrat_info_letter, rank),
            })
        return {'MUT': rank_result}
