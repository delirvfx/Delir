import { connectToStores } from '@ragg/fleur-react'
import * as React from 'react'

import EditorStore from '../../domain/Editor/EditorStore'
import Pane from '../components/pane'

interface ConnectedProps {
    stateText: string
}

export default connectToStores([EditorStore], (context) => ({
    stateText: context.getStore(EditorStore).getState().processingState
}))(class StatusBar extends React.Component<ConnectedProps> {
    public render()
    {
        return (
            <Pane className='view-status' resizable={false} allowFocus={false}>
                <div>{this.props.stateText}</div>
            </Pane>
        )
    }
})
