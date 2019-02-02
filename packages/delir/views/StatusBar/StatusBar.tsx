import { useStore } from '@ragg/fleur-react'
import * as React from 'react'

import Pane from '../../components/pane'
import EditorStore from '../../domain/Editor/EditorStore'

export const StatusBar = () => {
    const { stateText } = useStore([EditorStore], getStore => ({
        stateText: getStore(EditorStore).getState().processingState,
    }))

    return (
        <Pane className="view-status" resizable={false} allowFocus={false}>
            <div>{stateText}</div>
        </Pane>
    )
}
