import { connectToStores } from '@ragg/fleur-react'
import * as React from 'react'

import EditorStateStore from '../../stores/EditorStateStore'
import Pane from '../components/pane'

interface ConnectedProps {
    stateText: string
}

export default connectToStores([EditorStateStore], (context) => ({
    stateText: context.getStore(EditorStateStore).getState().processingState
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
