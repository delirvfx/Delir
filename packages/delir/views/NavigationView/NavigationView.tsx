import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
import { remote } from 'electron'
import * as path from 'path'
import * as React from 'react'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as PreferenceOps from '../../domain/Preference/operations'
import PreferenceStore from '../../domain/Preference/PreferenceStore'

import Pane from '../../components/pane'

import * as s from './style.styl'

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

const mapStoresToProps = (getStore: StoreGetter) => ({
    editor: getStore(EditorStore).getState(),
    audioVolume: getStore(PreferenceStore).audioVolume,
})

export default withComponentContext(
    connectToStores([EditorStore, PreferenceStore], mapStoresToProps)(
        class NavigationView extends React.Component<Props> {
            public render() {
                const {
                    audioVolume,
                    editor: { project, projectPath, previewPlayed },
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
                            <li className={s.icon} onClick={this.onClickPause}>
                                {previewPlayed ? <i className="fa fa-pause" /> : <i className="fa fa-play" />}
                            </li>
                            <li className={s.icon} onClick={this.onClickDest}>
                                <i className="fa fa-film" />
                            </li>
                            <li className={s.volume}>
                                <i className="fa fa-volume-up" />
                                <input
                                    type="range"
                                    onChange={this.handleChangeVolume}
                                    value={audioVolume}
                                    min={0}
                                    max={100}
                                />
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

            private handleChangeVolume = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                this.props.context.executeOperation(PreferenceOps.setAudioVolume, currentTarget.valueAsNumber)
            }

            private titleBarDoubleClicked = () => {
                const browserWindow = remote.getCurrentWindow()
                browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize()
            }
        },
    ),
)
