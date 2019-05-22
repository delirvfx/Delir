import { ComponentContext } from '@fleur/fleur'

import * as HistoryOps from '../domain/History/operations'
import { GlobalEvent, GlobalEvents } from '../views/AppView/GlobalEvents'

const isSelectionInputElement = (el: Element) => {
    return (
        (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) && el.selectionStart !== el.selectionEnd
    )
}

export const uiActionCopy = () => {
    const { activeElement } = document

    if (isSelectionInputElement(activeElement!)) {
        document.execCommand('copy')
    } else {
        GlobalEvents.emit(GlobalEvent.copyViaApplicationMenu, {})
    }
}

export const uiActionCut = () => {
    const { activeElement } = document

    if (isSelectionInputElement(activeElement!)) {
        document.execCommand('cut')
    } else {
        GlobalEvents.emit(GlobalEvent.cutViaApplicationMenu, {})
    }
}

export const uiActionPaste = () => {
    const { activeElement } = document

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        document.execCommand('paste')
    } else {
        GlobalEvents.emit(GlobalEvent.pasteViaApplicationMenu, {})
    }
}

export const uiActionUndo = (context: ComponentContext) => {
    const { activeElement } = document

    if (isSelectionInputElement(activeElement!)) {
        document.execCommand('undo')
    } else {
        context.executeOperation(HistoryOps.doUndo, {})
    }
}

export const uiActionRedo = (context: ComponentContext) => {
    const { activeElement } = document

    if (isSelectionInputElement(activeElement!)) {
        document.execCommand('redo')
    } else {
        context.executeOperation(HistoryOps.doRedo, {})
    }
}
