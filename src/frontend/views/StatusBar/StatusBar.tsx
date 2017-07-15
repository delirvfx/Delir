import React from 'react'
import * as PropTypes from 'prop-types'
import {remote} from 'electron'

import EditorStateStore from '../stores/EditorStateStore'
import AppActions from '../actions/App'

import Pane from './components/pane'

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

    openFeedback = (e) =>
    {
        remote.shell.openExternal('https://goo.gl/forms/dDy7HWgPuAiOFaSn1')
        e.preventDefault()
    }

    render()
    {
        return (
            <Pane className='view-status' resizable={false} allowFocus={false}>
                <style scoped>
                    {`
                        a {
                            color:white;
                            textDecoration:none;
                            float:right;
                            padding: 0 4px;
                        }
                        a:hover {
                            background-color: rgba(255, 255, 255, .2);
                        }
                    `}
                </style>
                <div>{this.state.stateText}</div>
                <div>
                    <a href='#' target='_blank' onClick={this.openFeedback}>Feedback</a>
                </div>
            </Pane>
        )
    }
}
