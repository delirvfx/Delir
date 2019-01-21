import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
import { remote } from 'electron'
import * as path from 'path'
import * as React from 'react'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import Pane from '../../components/pane'

import * as s from './style.styl'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

const mapStoresToProps = (getStore: StoreGetter) => ({
    editor: getStore(EditorStore).getState(),
    previewPlaying: getStore(RendererStore).previewPlaying,
})

export default withComponentContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class NavigationView extends React.Component<Props> {
            public render() {
                const {
                    previewPlaying,
                    editor: { project, projectPath },
                } = this.props
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
                            {previewPlaying ? (
                                <li onClick={this.onClickPause}>
                                    <i className="fa fa-pause" />
                                </li>
                            ) : (
                                <li onClick={this.onClickPlay}>
                                    <i className="fa fa-play" />
                                </li>
                            )}
                            <li onClick={this.onClickDest}>
                                <i className="fa fa-film" />
                            </li>
                        </ul>
                    </Pane>
                )
            }
            private onClickPlay = () => {
                const { activeComp } = this.props.editor
                if (!activeComp) return

                this.props.context.executeOperation(RendererOps.startPreview, {
                    compositionId: activeComp.id!,
                })
            }

            private onClickPause = (e: React.MouseEvent<HTMLLIElement>) => {
                this.props.context.executeOperation(RendererOps.stopPreview, {})
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
