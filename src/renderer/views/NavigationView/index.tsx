import {remote} from 'electron'
import * as React from 'react'
import {PropTypes} from 'react'
import * as path from 'path'
import connectToStores from '../../utils/connectToStores'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import EditorStateActions from '../../actions/editor-state-actions'

import Pane from '../components/pane'

import s from './style.styl'

interface NavigationViewProps {
    editor: EditorState,
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState()
}))
export default class NavigationView extends React.Component<NavigationViewProps, null>
{
    static propTypes = {
        editor: PropTypes.object.isRequired,
    }

    onTitleDoubleClicked()
    {
    }

    onClickPlay = action =>
    {
        const {activeComp} = this.props.editor

        if (! activeComp) return
        EditorStateActions.togglePreview(activeComp.id!)
    }

    onClickDest = action =>
    {
        const {activeComp} = this.props.editor
        activeComp && EditorStateActions.renderDestinate(activeComp.id!)
    }

    titleBarDoubleClicked = e =>
    {
        const browserWindow = remote.getCurrentWindow()
        browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize()
    }

    render()
    {
        const {projectPath} = this.props.editor

        return (
            <Pane className={s.navigationView} resizable={false}>
                <ul className={s.titleBar} onDoubleClick={this.titleBarDoubleClicked}>
                    {projectPath && path.basename(projectPath)}
                </ul>
                <ul className={s.navigationList}>
                    <li onClick={this.onClickPlay}><i className='fa fa-play' /></li>
                    <li onClick={this.onClickDest}><i className='fa fa-film' /></li>
                </ul>
            </Pane>
        )
    }
}
