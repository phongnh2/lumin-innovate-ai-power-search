import { LANGUAGES } from 'constants/language';

export const AGREEMENT_GEN_TOOLS = {
  AGREEMENT_GEN: 'agreementGen',
};

export const AGREEMENT_GEN_KEYWORDS = {
  [AGREEMENT_GEN_TOOLS.AGREEMENT_GEN]: {
    [LANGUAGES.EN]: ['generate', 'agreement', 'contract', 'generate agreement', 'ai draft', 'create', 'convert'],
    [LANGUAGES.ES]: ['generar', 'acuerdo', 'contrato', 'generar acuerdo', 'borrador IA', 'crear', 'convertir'],
    [LANGUAGES.FR]: ['générer', 'accord', 'contrat', 'générer accord', 'brouillon IA', 'créer', 'convertir'],
    [LANGUAGES.PT]: ['gerar', 'acordo', 'contrato', 'gerar acordo', 'rascunho IA', 'criar', 'converter'],
    [LANGUAGES.VI]: ['tạo', 'thỏa thuận', 'hợp đồng', 'tạo thỏa thuận', 'bản nháp AI', 'tạo mới', 'chuyển đổi'],
  },
};
