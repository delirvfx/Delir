import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import { remote } from 'electron'
import * as path from 'path'
import * as React from 'react'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'

import Pane from '../../components/pane'

import * as s from './style.styl'

interface ConnectedProps {
    editor: EditorState
}

type Props = ConnectedProps & ContextProp

export default withComponentContext(
    connectToStores([EditorStore], context => ({
        editor: context.getStore(EditorStore).getState(),
    }))(
        class NavigationView extends React.Component<Props> {
            public render() {
                const { project, projectPath, previewPlayed } = this.props.editor
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
                                <li onClick={this.onClickPause}>
                                    <i className='fa fa-pause' />
                                </li>
                            ) : (
                                <li onClick={this.onClickPlay}>
                                    <i className='fa fa-play' />
                                </li>
                            )}
                            <li onClick={this.onClickDest}>
                                <i className='fa fa-film' />
                            </li>
                        </ul>
                    </Pane>
                )
            }
            private onClickPlay = () => {
                const { activeComp } = this.props.editor
                if (!activeComp) return

                this.props.context.executeOperation(EditorOps.startPreview, {
                    compositionId: activeComp.id!,
                })
            }

            private onClickPause = (e: React.MouseEvent<HTMLLIElement>) => {
                this.props.context.executeOperation(EditorOps.stopPreview, {})
            }

            private onClickDest = () => {
                const { activeComp } = this.props.editor
                activeComp &&
                    this.props.context.executeOperation(EditorOps.renderDestinate, {
                        compositionId: activeComp.id!,
                    })
            }

            private titleBarDoubleClicked = () => {
                const browserWindow = remote.getCurrentWindow()
                browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize()
            }
        },
    ),
)
