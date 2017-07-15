import {remote} from 'electron'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as path from 'path'
import connectToStores from '../../utils/connectToStores'

import {default as EditorStateStore, EditorState} from '../../stores/EditorStateStore'
import EditorStateActions from '../../actions/editor-state-actions'

import Pane from '../components/pane'

import * as s from './style.styl'

interface NavigationViewProps {
    editor: EditorState,
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState()
}))
export default class NavigationView extends React.Component<NavigationViewProps, null>
{
    public static propTypes = {
        editor: PropTypes.object.isRequired,
    }

    private onClickPlay = action =>
    {
        const {activeComp} = this.props.editor

        if (! activeComp) return
        EditorStateActions.startPreview(activeComp.id!)
    }

    private onClickPause = (e: React.MouseEvent<HTMLLIElement>) => {
        EditorStateActions.stopPreview()
    }

    private onClickDest = action =>
    {
        const {activeComp} = this.props.editor
        activeComp && EditorStateActions.renderDestinate(activeComp.id!)
    }

    private titleBarDoubleClicked = e =>
    {
        const browserWindow = remote.getCurrentWindow()
        browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize()
    }

    public render()
    {
        const {project, projectPath, previewPlayed} = this.props.editor
        const projectName = project
            ? 'Delir - ' + (projectPath ? path.basename(projectPath) : 'New Project')
            : 'Delir'

        document.title = projectName

        return (
            <Pane className={s.navigationView} resizable={false}>
                <ul className={s.titleBar} onDoubleClick={this.titleBarDoubleClicked}>
                    {projectName}
                </ul>
                <ul className={s.navigationList}>
                    {previewPlayed ? (
                            <li onClick={this.onClickPause}><i className='fa fa-pause' /></li>
                        ) : (
                            <li onClick={this.onClickPlay}><i className='fa fa-play' /></li>
                        )
                    }
                    <li onClick={this.onClickDest}><i className='fa fa-film' /></li>
                </ul>
            </Pane>
        )
    }
}
