import { action, actions } from '@fleur/fleur'

import { Command } from './HistoryStore'

export const HistoryActions = actions('History', {
  pushHistory: action<{ command: Command }>(),
  clearHistory: action<{}>(),
  undoing: action<{}>(),
  redoing: action<{}>(),
})
