import { OperationContext } from '@fleur/fleur'
import { Command } from './HistoryStore'

export class HistoryGroup implements Command {
  constructor(private commands: Command[]) {}

  public undo(context: OperationContext) {
    for (const command of this.commands) {
      command.undo(context)
    }
  }

  public redo(context: OperationContext) {
    for (const command of this.commands) {
      command.redo(context)
    }
  }
}
