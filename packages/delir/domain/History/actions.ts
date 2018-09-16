import { action } from '@ragg/fleur'

import { Command } from './HistoryStore'

export const HistoryActions = {
    pushHistory: action<{ command: Command }>(),
    undoing: action<{}>(),
    redoing: action<{}>(),
}
