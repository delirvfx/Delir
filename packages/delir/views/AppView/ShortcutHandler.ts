import { useFleurContext } from '@fleur/fleur-react'
import Mousetrap from 'mousetrap'
import React, { useCallback, useMemo } from 'react'
import EditorStore from '../../domain/Editor/EditorStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'
import { makeMousetrapIgnoreInputHandler } from '../../utils/makeMousetrapHandler'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

export const ShortcutHandler = () => {
    const context = useFleurContext()

    const trap = useMemo(() => new Mousetrap(document.body), [])

    const handleShortCutPreviewToggle = useCallback((e: KeyboardEvent) => {
        if (
            e.target instanceof HTMLTextAreaElement ||
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLSelectElement
        ) {
            return
        }

        const activeComp = context.getStore(EditorStore).getActiveComposition()
        const { previewPlaying } = context.getStore(RendererStore)

        if (!activeComp) return

        if (previewPlaying) {
            context.executeOperation(RendererOps.stopPreview)
        } else {
            context.executeOperation(RendererOps.startPreview, {
                compositionId: activeComp.id,
            })
        }
    }, [])

    const handleShortCutCopy = useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionCopy()
    }, [])

    const handleShortcutCut = useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionCut()
    }, [])

    const handleShortcutPaste = useCallback((e: KeyboardEvent) => {
        e.preventDefault()
        uiActionPaste()
    }, [])

    // tslint:disable-next-line: member-ordering
    const handleShortCutUndo = useCallback(
        makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
            e.preventDefault()
            uiActionUndo(context.executeOperation)
        }),
        [],
    )

    // tslint:disable-next-line: member-ordering
    const handleShortCutRedo = useCallback(
        makeMousetrapIgnoreInputHandler((e: KeyboardEvent) => {
            e.preventDefault()
            uiActionRedo(context.executeOperation)
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
