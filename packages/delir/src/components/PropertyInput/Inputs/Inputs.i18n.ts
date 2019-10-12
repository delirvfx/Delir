import I18n from 'utils/I18n'
import { Platform } from 'utils/platform'

export default I18n({
  ja: {
    ok: `更新`,
    okWithShortcutKey: `更新 (${Platform.cmdOrCtrl}+Enter)`,
    discard: 'キャンセル',
  },
  en: {
    ok: `Change`,
    okWithShortcutKey: `Change (${Platform.cmdOrCtrl}+Enter)`,
    discard: 'Cancel',
  },
})
