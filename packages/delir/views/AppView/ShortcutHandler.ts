import { useFleurContext } from '@fleur/fleur-react'
import * as Mousetrap from 'mousetrap'
import * as React from 'react'
import EditorStore from '../../domain/Editor/EditorStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'
import { makeMousetrapIgnoreInputHandler } from '../../utils/makeMousetrapHandler'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

export const ShortcutHandler = () => {
    const context = useFleurContext()

    const trap = React.useMemo(() => new Mousetrap(document.body), [])

    const handleShortCutPreviewToggle = React.useCallback((e: KeyboardEvent) => {
        if (
            e.target instanceof HTMLTextAreaElement ||
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLSelectElement
        ) {
            return
        }

        const activeComp = context.getStore(EditorStore).getActiveComposition()
        const { previewPlaying } = context.getStore(RendererStore).previewPlaying

        if (!activeComp) return

        if (previewPlaying) {
            context.executeOperation(RendererOps.stopPreview, {})
        } else {
            context.executeOperation(RendererOps.startPreview, {
                compositionId: activeComp.id,
            })
        }
    }, [])

    const handleShortCutCopy = React.useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionCopy()
    }, [])

    const handleShortcutCut = React.useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionCut()
    }, [])

    const handleShortcutPaste = React.useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionPaste()
    }, [])

    // tslint:disable-next-line: member-ordering
    const handleShortCutUndo = React.useCallback(
        makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
            e.preventDefault()
            uiActionUndo(context)
        }),
        [],
    )

    // tslint:disable-next-line: member-ordering
    const handleShortCutRedo = React.useCallback(
        makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
            e.preventDefault()
            uiActionRedo(context)
        }),
        [],
    )

    React.useEffect(() => {
        trap.bind('space', handleShortCutPreviewToggle)
        trap.bind(['mod+c'], handleShortCutCopy)
        trap.bind(['mod+x'], handleShortcutCut)
        trap.bind(['mod+v'], handleShortcutPaste)
        trap.bind(['mod+z'], handleShortCutUndo)
        trap.bind(['mod+shift+z'], handleShortCutRedo)
    }, [])

    return null
}
