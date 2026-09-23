export const supportedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'zh'] as const;

export type Language = (typeof supportedLanguages)[number];

const english = {
  appName: 'PDF Editor Studio',
  tagline: 'Fill and sign your documents directly in your browser',
  dropTitle: 'Drop a PDF here',
  dropHint: 'or choose a file. Add fields exactly where you need them.',
  browse: 'Choose a PDF',
  text: 'Text',
  date: 'Date',
  check: 'Check',
  sign: 'Sign',
  place: 'Place',
  color: 'Color',
  export: 'Export',
  open: 'Open',
  undo: 'Undo',
  redo: 'Redo',
  drawSignature: 'Draw your signature',
  signatureHelp: 'Sign below, then click or drag on the document to place it.',
  signHere: 'Sign here…',
  clear: 'Clear',
  cancel: 'Cancel',
  useSignature: 'Use signature',
  placeSignature: 'Click or drag on the document to place your signature.',
  deleteField: 'Delete field',
  moveField: 'Move field',
  resizeField: 'Resize field',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  exportPdf: 'Export PDF',
  openAnother: 'Open another PDF',
  invalidPdf: 'Please choose a valid PDF file.',
  loadError: 'This PDF could not be opened. It may be damaged or protected by a password.',
  saveError: 'The edited PDF could not be exported. Please try again.',
  replaceConfirm: 'Opening another document will discard your unsaved changes. Continue?',
  leaveConfirm: 'You have unsaved changes. Leave this page anyway?',
  language: 'Language',
  privacy: 'Your document stays in your browser and is not sent for automatic analysis.',
} as const;

export type TranslationKey = keyof typeof english;
type TranslationTable = Partial<Record<TranslationKey, string>>;

const translations: Record<Language, TranslationTable> = {
  en: english,
  fr: {
    tagline: 'Remplissez et signez vos documents directement dans votre navigateur',
    dropTitle: 'Déposez un PDF ici', dropHint: 'ou choisissez un fichier. Ajoutez vos champs où vous le souhaitez.',
    browse: 'Choisir un PDF', text: 'Texte', date: 'Date', check: 'Case', sign: 'Signer', place: 'Placer', color: 'Couleur', export: 'Exporter', open: 'Ouvrir', undo: 'Annuler', redo: 'Rétablir',
    drawSignature: 'Dessinez votre signature', signatureHelp: 'Signez ci-dessous, puis cliquez ou dessinez sur le document pour la placer.', signHere: 'Signez ici…', clear: 'Effacer', cancel: 'Annuler', useSignature: 'Utiliser la signature', placeSignature: 'Cliquez ou dessinez sur le document pour placer votre signature.',
    deleteField: 'Supprimer le champ', moveField: 'Déplacer le champ', resizeField: 'Redimensionner le champ', zoomIn: 'Agrandir', zoomOut: 'Réduire', exportPdf: 'Exporter le PDF', openAnother: 'Ouvrir un autre PDF', invalidPdf: 'Veuillez choisir un fichier PDF valide.', loadError: 'Ce PDF ne peut pas être ouvert. Il est peut-être endommagé ou protégé par un mot de passe.', saveError: 'Le PDF modifié n’a pas pu être exporté. Veuillez réessayer.', replaceConfirm: 'Ouvrir un autre document supprimera les modifications non exportées. Continuer ?', leaveConfirm: 'Vous avez des modifications non exportées. Quitter cette page ?', language: 'Langue', privacy: 'Votre document reste dans votre navigateur et n’est pas envoyé pour une analyse automatique.',
  },
  es: {
    tagline: 'Rellena y firma tus documentos directamente en el navegador', dropTitle: 'Suelta un PDF aquí', dropHint: 'o elige un archivo. Añade campos donde los necesites.', browse: 'Elegir un PDF', text: 'Texto', date: 'Fecha', check: 'Casilla', sign: 'Firmar', place: 'Colocar', color: 'Color', export: 'Exportar', open: 'Abrir', undo: 'Deshacer', redo: 'Rehacer', drawSignature: 'Dibuja tu firma', signatureHelp: 'Firma abajo y después haz clic o arrastra sobre el documento para colocarla.', signHere: 'Firma aquí…', clear: 'Borrar', cancel: 'Cancelar', useSignature: 'Usar firma', placeSignature: 'Haz clic o arrastra sobre el documento para colocar tu firma.', deleteField: 'Eliminar campo', moveField: 'Mover campo', resizeField: 'Cambiar tamaño del campo', zoomIn: 'Acercar', zoomOut: 'Alejar', exportPdf: 'Exportar PDF', openAnother: 'Abrir otro PDF', invalidPdf: 'Elige un archivo PDF válido.', loadError: 'No se pudo abrir este PDF. Puede estar dañado o protegido con contraseña.', saveError: 'No se pudo exportar el PDF editado. Inténtalo de nuevo.', replaceConfirm: 'Abrir otro documento descartará los cambios sin exportar. ¿Continuar?', leaveConfirm: 'Tienes cambios sin exportar. ¿Salir de esta página?', language: 'Idioma', privacy: 'Tu documento permanece en el navegador y no se envía para análisis automático.',
  },
  de: {
    tagline: 'Dokumente direkt im Browser ausfüllen und unterschreiben', dropTitle: 'PDF hier ablegen', dropHint: 'oder eine Datei auswählen. Felder genau dort hinzufügen, wo sie gebraucht werden.', browse: 'PDF auswählen', text: 'Text', date: 'Datum', check: 'Feld', sign: 'Signieren', place: 'Platzieren', color: 'Farbe', export: 'Exportieren', open: 'Öffnen', undo: 'Rückgängig', redo: 'Wiederholen', drawSignature: 'Unterschrift zeichnen', signatureHelp: 'Unten unterschreiben und dann auf das Dokument klicken oder ziehen.', signHere: 'Hier unterschreiben…', clear: 'Löschen', cancel: 'Abbrechen', useSignature: 'Unterschrift verwenden', placeSignature: 'Auf das Dokument klicken oder ziehen, um die Unterschrift zu platzieren.', deleteField: 'Feld löschen', moveField: 'Feld verschieben', resizeField: 'Feldgröße ändern', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', exportPdf: 'PDF exportieren', openAnother: 'Anderes PDF öffnen', invalidPdf: 'Bitte eine gültige PDF-Datei auswählen.', loadError: 'Dieses PDF konnte nicht geöffnet werden. Es könnte beschädigt oder passwortgeschützt sein.', saveError: 'Das bearbeitete PDF konnte nicht exportiert werden. Bitte erneut versuchen.', replaceConfirm: 'Beim Öffnen eines anderen Dokuments gehen nicht exportierte Änderungen verloren. Fortfahren?', leaveConfirm: 'Nicht exportierte Änderungen vorhanden. Seite trotzdem verlassen?', language: 'Sprache', privacy: 'Ihr Dokument bleibt im Browser und wird nicht zur automatischen Analyse gesendet.',
  },
  pt: {
    tagline: 'Preencha e assine documentos diretamente no navegador', dropTitle: 'Solte um PDF aqui', dropHint: 'ou escolha um arquivo. Adicione campos onde precisar.', browse: 'Escolher um PDF', text: 'Texto', date: 'Data', check: 'Caixa', sign: 'Assinar', place: 'Colocar', color: 'Cor', export: 'Exportar', open: 'Abrir', undo: 'Desfazer', redo: 'Refazer', drawSignature: 'Desenhe sua assinatura', signatureHelp: 'Assine abaixo e clique ou arraste no documento para posicioná-la.', signHere: 'Assine aqui…', clear: 'Limpar', cancel: 'Cancelar', useSignature: 'Usar assinatura', placeSignature: 'Clique ou arraste no documento para posicionar sua assinatura.', deleteField: 'Excluir campo', moveField: 'Mover campo', resizeField: 'Redimensionar campo', zoomIn: 'Aumentar', zoomOut: 'Diminuir', exportPdf: 'Exportar PDF', openAnother: 'Abrir outro PDF', invalidPdf: 'Escolha um arquivo PDF válido.', loadError: 'Não foi possível abrir este PDF. Ele pode estar danificado ou protegido por senha.', saveError: 'Não foi possível exportar o PDF editado. Tente novamente.', replaceConfirm: 'Abrir outro documento descartará alterações não exportadas. Continuar?', leaveConfirm: 'Você tem alterações não exportadas. Sair desta página?', language: 'Idioma', privacy: 'Seu documento permanece no navegador e não é enviado para análise automática.',
  },
  zh: {
    tagline: '直接在浏览器中填写并签署文档', dropTitle: '将 PDF 拖到这里', dropHint: '或选择文件。可在需要的位置添加字段。', browse: '选择 PDF', text: '文本', date: '日期', check: '勾选', sign: '签名', place: '放置', color: '颜色', export: '导出', open: '打开', undo: '撤销', redo: '重做', drawSignature: '绘制签名', signatureHelp: '请在下方签名，然后单击或拖动到文档中放置。', signHere: '在此签名…', clear: '清除', cancel: '取消', useSignature: '使用签名', placeSignature: '在文档上单击或拖动以放置签名。', deleteField: '删除字段', moveField: '移动字段', resizeField: '调整字段大小', zoomIn: '放大', zoomOut: '缩小', exportPdf: '导出 PDF', openAnother: '打开其他 PDF', invalidPdf: '请选择有效的 PDF 文件。', loadError: '无法打开此 PDF。它可能已损坏或受密码保护。', saveError: '无法导出已编辑的 PDF，请重试。', replaceConfirm: '打开其他文档将丢失尚未导出的更改。继续吗？', leaveConfirm: '您有尚未导出的更改，仍要离开此页面吗？', language: '语言', privacy: '您的文档保留在浏览器中，不会被发送用于自动分析。',
  },
};

export function detectLanguage(languages: readonly string[]): Language {
  for (const language of languages) {
    const match = language.toLowerCase().split('-')[0] as Language;
    if (supportedLanguages.includes(match)) return match;
  }
  return 'en';
}

export function translate(language: Language, key: TranslationKey): string {
  return translations[language][key] ?? english[key];
}
