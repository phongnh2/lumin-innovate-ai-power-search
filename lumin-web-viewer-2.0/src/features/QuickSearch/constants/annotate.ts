/* eslint-disable prettier/prettier */
import { LANGUAGES } from 'constants/language';

export const ANNOTATE_TOOLS = {
  ADD_COMMENT: 'addComment',
  MEASURE: 'measure',
  TYPE: 'type',
  DRAW: 'draw',
  TEXT_HIGHLIGHT: 'textHighlight',
  FREEHAND_HIGHLIGHT: 'freehandHighlight',
  SHAPE: 'shape',
  TEXT_TOOLS: 'textTools',
  ERASER: 'eraser',
  IMAGE: 'image',
};

export const ANNOTATE_KEYWORDS = {
  [ANNOTATE_TOOLS.ADD_COMMENT]: {
    [LANGUAGES.EN]: ['add', 'comment', 'note', 'feedback', 'annotation'],
    [LANGUAGES.ES]: ['agregar', 'comentario', 'nota', 'retroalimentación', 'anotación'],
    [LANGUAGES.FR]: ['ajouter', 'commentaire', 'note', 'retour', 'annotation'],
    [LANGUAGES.PT]: ['adicionar', 'comentário', 'nota', 'feedback', 'anotação'],
    [LANGUAGES.VI]: ['thêm', 'bình luận', 'ghi chú', 'phản hồi', 'chú thích'],
  },
  [ANNOTATE_TOOLS.MEASURE]: {
    [LANGUAGES.EN]: ['measure', 'ruler', 'distance', 'dimensions'],
    [LANGUAGES.ES]: ['medir', 'regla', 'distancia', 'dimensiones'],
    [LANGUAGES.FR]: ['mesurer', 'règle', 'distance', 'dimensions'],
    [LANGUAGES.PT]: ['medir', 'régua', 'distância', 'dimensões'],
    [LANGUAGES.VI]: ['đo', 'thước', 'khoảng cách', 'kích thước'],
  },
  [ANNOTATE_TOOLS.TYPE]: {
    [LANGUAGES.EN]: ['insert', 'type', 'add', 'text', 'add text', 'input', 'fill', 'form'],
    [LANGUAGES.ES]: ['insertar', 'escribir', 'agregar', 'texto', 'agregar texto', 'entrada', 'llenar', 'formulario'],
    [LANGUAGES.FR]: ['insérer', 'taper', 'ajouter', 'texte', 'ajouter texte', 'saisie', 'remplir', 'formulaire'],
    [LANGUAGES.PT]: ['inserir', 'digitar', 'adicionar', 'texto', 'adicionar texto', 'entrada', 'preencher', 'formulário'],
    [LANGUAGES.VI]: ['chèn', 'gõ', 'thêm', 'văn bản', 'thêm văn bản', 'nhập', 'điền', 'biểu mẫu'],
  },
  [ANNOTATE_TOOLS.DRAW]: {
    [LANGUAGES.EN]: ['draw', 'sketch', 'pen', 'freehand', 'scribble'],
    [LANGUAGES.ES]: ['dibujar', 'bosquejar', 'lápiz', 'mano alzada', 'garabatear'],
    [LANGUAGES.FR]: ['dessiner', 'esquisser', 'stylo', 'main levée', 'griffonner'],
    [LANGUAGES.PT]: ['desenhar', 'esboçar', 'caneta', 'mão livre', 'rabiscar'],
    [LANGUAGES.VI]: ['vẽ', 'phác thảo', 'bút', 'vẽ tay', 'nguệch ngoạc'],
  },
  [ANNOTATE_TOOLS.TEXT_HIGHLIGHT]: {
    [LANGUAGES.EN]: ['highlight', 'mark', 'mark text', 'emphasize'],
    [LANGUAGES.ES]: ['resaltar', 'marcar', 'marcar texto', 'enfatizar'],
    [LANGUAGES.FR]: ['surligner', 'marquer', 'marquer texte', 'mettre en évidence'],
    [LANGUAGES.PT]: ['destacar', 'marcar', 'marcar texto', 'enfatizar'],
    [LANGUAGES.VI]: ['đánh dấu', 'tô', 'tô văn bản', 'nhấn mạnh'],
  },
  [ANNOTATE_TOOLS.FREEHAND_HIGHLIGHT]: {
    [LANGUAGES.EN]: ['highlight', 'mark', 'freehand', 'mark manually'],
    [LANGUAGES.ES]: ['resaltar', 'marcar', 'mano alzada', 'marcar manualmente'],
    [LANGUAGES.FR]: ['surligner', 'marquer', 'main levée', 'marquer manuellement'],
    [LANGUAGES.PT]: ['destacar', 'marcar', 'mão livre', 'marcar manualmente'],
    [LANGUAGES.VI]: ['đánh dấu', 'tô', 'vẽ tay', 'đánh dấu thủ công'],
  },
  [ANNOTATE_TOOLS.SHAPE]: {
    [LANGUAGES.EN]: ['insert', 'draw', 'shape', 'rectangle', 'ellipse', 'arrow', 'polyline', 'polygon', 'cloud', 'star', 'cross', 'tick', 'circle', 'line'],
    [LANGUAGES.ES]: ['insertar', 'dibujar', 'forma', 'rectángulo', 'elipse', 'flecha', 'polilínea', 'polígono', 'nube', 'estrella', 'cruz', 'marca', 'círculo', 'línea'],
    [LANGUAGES.FR]: ['insérer', 'dessiner', 'forme', 'rectangle', 'ellipse', 'flèche', 'polyligne', 'polygone', 'nuage', 'étoile', 'croix', 'coche', 'cercle', 'ligne'],
    [LANGUAGES.PT]: ['inserir', 'desenhar', 'forma', 'retângulo', 'elipse', 'seta', 'polilinha', 'polígono', 'nuvem', 'estrela', 'cruz', 'marca', 'círculo', 'linha'],
    [LANGUAGES.VI]: ['chèn', 'vẽ', 'hình', 'hình chữ nhật', 'hình elip', 'mũi tên', 'đường gấp khúc', 'đa giác', 'đám mây', 'ngôi sao', 'dấu chéo', 'dấu tích', 'hình tròn', 'đường thẳng'],
  },
  [ANNOTATE_TOOLS.TEXT_TOOLS]: {
    [LANGUAGES.EN]: ['edit', 'format', 'text tools', 'underline', 'strikeout', 'squiggly'],
    [LANGUAGES.ES]: ['editar', 'formatear', 'herramientas de texto', 'subrayar', 'tachar', 'ondulado'],
    [LANGUAGES.FR]: ['éditer', 'formater', 'outils texte', 'souligner', 'barrer', 'ondulé'],
    [LANGUAGES.PT]: ['editar', 'formatar', 'ferramentas de texto', 'sublinhar', 'riscar', 'ondulado'],
    [LANGUAGES.VI]: ['chỉnh sửa', 'định dạng', 'công cụ văn bản', 'gạch chân', 'gạch ngang', 'gạch lượn sóng'],
  },
  [ANNOTATE_TOOLS.ERASER]: {
    [LANGUAGES.EN]: ['erase', 'remove', 'eraser', 'delete', 'remove drawing'],
    [LANGUAGES.ES]: ['borrar', 'eliminar', 'goma', 'suprimir', 'eliminar dibujo'],
    [LANGUAGES.FR]: ['effacer', 'supprimer', 'gomme', 'supprimer', 'supprimer dessin'],
    [LANGUAGES.PT]: ['apagar', 'remover', 'borracha', 'excluir', 'remover desenho'],
    [LANGUAGES.VI]: ['xóa', 'gỡ bỏ', 'tẩy', 'xóa', 'xóa hình vẽ'],
  },
  [ANNOTATE_TOOLS.IMAGE]: {
    [LANGUAGES.EN]: ['insert', 'add', 'image', 'insert image', 'add picture'],
    [LANGUAGES.ES]: ['insertar', 'agregar', 'imagen', 'insertar imagen', 'agregar foto'],
    [LANGUAGES.FR]: ['insérer', 'ajouter', 'image', 'insérer image', 'ajouter photo'],
    [LANGUAGES.PT]: ['inserir', 'adicionar', 'imagem', 'inserir imagem', 'adicionar foto'],
    [LANGUAGES.VI]: ['chèn', 'thêm', 'hình ảnh', 'chèn hình ảnh', 'thêm ảnh'],
  },
};
