import React from 'react'
import * as PropTypes from 'prop-types'
import {remote} from 'electron'

import EditorStateStore from '../../stores/EditorStateStore'
import AppActions from '../../actions/App'

import Pane from '../components/pane'

interface State {
    stateText: string
}

export default class StatusBar extends React.Component<null, State>
{
    constructor(...args)
    {
        super(...args)
        this.state = {
            stateText: EditorStateStore.getState().get('processingState'),
        }

        EditorStateStore.addListener(() => {
            this.setState({
                stateText: EditorStateStore.getState().get('processingState'),
            })
        })
    }

    public render()
    {
        return (
            <Pane className='view-status' resizable={false} allowFocus={false}>
                <div>{this.state.stateText}</div>
            </Pane>
        )
    }
}
