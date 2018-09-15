import { action } from '@ragg/fleur'

import { HistoryCommand } from './HistoryStore'

export const HistoryActions = {
    pushHistory: action<{ command: HistoryCommand }>(),
    undoing: action<{}>(),
    redoing: action<{}>(),
}
