import I18n from '../../utils/I18n'
import { isMacOS } from '../../utils/platform'

export default I18n({
    ja: {
        saved: '保存しました！',
        letsSave: `そろそろプロジェクトを保存しましょう (${isMacOS() ? 'Command' : 'Ctrl'}+S)`,
        autoSaved: 'プロジェクトを自動保存しました (:fileName)',
    },
    en: {
        saved: 'Project saved.',
        letsSave: `Let\'s save the project soon. (${isMacOS() ? 'Command' : 'Ctrl'}+S)`,
        autoSaved: 'Project auto saved. (:fileName)',
    }
})
