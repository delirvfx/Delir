import I18n from '../../utils/I18n'
import { isMacOS } from '../../utils/platform'

export default I18n({
  ja: {
    saved: '保存しました！',
    letsSave: `そろそろプロジェクトを保存しましょう (${isMacOS() ? 'Command' : 'Ctrl'}+S)`,
    autoSaved: 'プロジェクトを自動保存しました (:fileName)',
    packageExporting: 'プロジェクトパッケージを作成中です',
    packageExportCompleted: 'プロジェクトパッケージを保存しました',
  },
  en: {
    saved: 'Project saved.',
    letsSave: `Let\'s save the project soon. (${isMacOS() ? 'Command' : 'Ctrl'}+S)`,
    autoSaved: 'Project auto saved. (:fileName)',
    packageExporting: 'Project package saving now in progressing',
    packageExportCompleted: 'Project package saving completed',
  },
})
