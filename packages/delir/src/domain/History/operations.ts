import { operation } from '@fleur/fleur'
import { HistoryActions } from './actions'
import HistoryStore, { Command } from './HistoryStore'

export const pushHistory = operation((context, { command }: { command: Command }) => {
  context.dispatch(HistoryActions.pushHistory, { command })
})

export const doUndo = operation(context => {
  const command = context.getStore(HistoryStore).getUndoCommand()

  if (command) {
    command.undo(context)
    context.dispatch(HistoryActions.undoing, {})
  }
})

export const doRedo = operation(context => {
  const command = context.getStore(HistoryStore).getRedoCommand()

  if (command) {
    command.redo(context)
    context.dispatch(HistoryActions.redoing, {})
  }
})
