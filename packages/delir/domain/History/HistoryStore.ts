import { listen, OperationContext, Store } from '@ragg/fleur'

import { HistoryActions } from './actions'

export interface HistoryCommand {
    undo(context: OperationContext<any>): void
    redo(context: OperationContext<any>): void
}

interface State {
    undoStack: HistoryCommand[]
    redoStack: HistoryCommand[]
}

export default class HistoryStore extends Store<State> {
    public static storeName = 'HistoryStore'

    public state: State = {
        undoStack: [],
        redoStack: [],
    }

    private handleChangeProject = listen

    private handlePushHistory = listen(HistoryActions.pushHistory, ({ command }) => {
        this.updateWith(draft => {
            draft.redoStack = []
            draft.undoStack.push(command)
        })
    })

    private handleUndoing = listen(HistoryActions.undoing, () => {
        this.updateWith(draft => {
            const command = draft.undoStack.pop()
            command && draft.redoStack.push(command)
        })
    })

    private handleRedoing = listen(HistoryActions.redoing, () => {
        this.updateWith(draft => {
            const command = draft.redoStack.pop()
            command && draft.undoStack.push(command)
        })
    })

    public getUndoCommand(): HistoryCommand | void {
        return this.state.undoStack[this.state.undoStack.length - 1]
    }

    public getRedoCommand(): HistoryCommand | void {
        return this.state.redoStack[this.state.redoStack.length - 1]
    }
}
