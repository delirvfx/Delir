import React, {PropTypes} from 'react'

import EditorStateStore from '../stores/editor-state-store'
import EditorStateActions from '../actions/editor-state-actions'

import Pane from './components/pane'

export default class StatusView extends React.Component
{
    constructor(...args)
    {
        super(...args)
        this.state = {
            stateText: EditorStateStore.getState().processingState,
        }

        EditorStateStore.addListener(() => {
            this.setState({
                stateText: EditorStateStore.getState().processingState,
            })
        })
    }

    render()
    {
        return (
            <Pane className='view-status' resizable={false} allowFocus={false}>
                <div>{this.state.stateText}</div>
            </Pane>
        )
    }
}
