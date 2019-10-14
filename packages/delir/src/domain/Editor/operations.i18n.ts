import I18n from '../../utils/I18n'
import { Platform } from '../../utils/platform'

export default I18n({
  ja: {
    saved: '保存しました！',
    letsSave: `そろそろプロジェクトを保存しましょう (${Platform.cmdOrCtrl}+S)`,
    autoSaved: 'プロジェクトを自動保存しました (:fileName)',
    packageExporting: 'プロジェクトパッケージを作成中です',
    packageExportCompleted: 'プロジェクトパッケージを保存しました',
  },
  en: {
    saved: 'Project saved.',
    letsSave: `Let\'s save the project soon. (${Platform.cmdOrCtrl}+S)`,
    autoSaved: 'Project auto saved. (:fileName)',
    packageExporting: 'Project package saving now in progressing',
    packageExportCompleted: 'Project package saving completed',
  },
})
