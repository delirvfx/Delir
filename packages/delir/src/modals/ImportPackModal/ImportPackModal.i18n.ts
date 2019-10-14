import I18n from '../../utils/I18n'

export default I18n({
  ja: {
    title: 'プロジェクトパッケージを開く',
    importing: '開くパッケージファイルを選択 (.delirpp)',
    extracting: '展開先フォルダを選択',
    buttons: {
      continue: '開く',
      cancel: 'キャンセル',
    },
    errors: {
      requireImportFile: 'パッケージファイルを選択してください',
      requireExportDir: '展開先フォルダを選択',
    },
  },
  en: {
    title: 'Import　project package',
    importing: 'Select importing project package (.delirpp)',
    extracting: 'Select where to extract the project',
    buttons: {
      continue: 'Open',
      cancel: 'Cancel',
    },
    errors: {
      requireImportFile: 'Require to select importing package file',
      requireExportDir: 'Require to select extract directory',
    },
  },
})
