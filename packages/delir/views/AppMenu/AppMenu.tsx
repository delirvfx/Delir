import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as Electron from 'electron'
import { remote } from 'electron'
import * as React from 'react'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as HistoryOps from '../../domain/History/operations'
import * as AboutModal from '../../modules/AboutModal'
import * as Platform from '../../utils/platform'

import t from './AppMenu.i18n'

interface ConnectedProps {
    editor: EditorState
}

type Props = ConnectedProps & ContextProp

export default withComponentContext(connectToStores([EditorStore], (context) => ({
    editor: context.getStore(EditorStore).getState()
}))(class AppMenu extends React.Component<Props> {
    public componentDidMount() {
        this.setApplicationMenu()
    }

    public componentDidUpdate() {
        this.setApplicationMenu()
    }

    public shouldComponentUpdate(nextProps: Props) {
        return nextProps.editor.previewPlayed !== this.props.editor.previewPlayed
            || nextProps.editor.activeComp !== this.props.editor.activeComp
    }

    public render()
    {
        return null
    }

    private openAbout = () => {
        AboutModal.show()
    }

    private handleOpenPreference = () => {
        this.props.context.executeOperation(EditorOps.changePreferenceOpenState, { open: true })
    }

    private setApplicationMenu()
    {
        const {context} = this.props
        const {previewPlayed, activeComp} = this.props.editor
        const menu: Electron.MenuItemConstructorOptions[] = []

        menu.push({
            label: 'Delir',
            submenu: [
                {
                    label: t('appMenu.about'),
                    click: this.openAbout,
                },
                {type: 'separator'},
                {
                    label: t('appMenu.preference'),
                    accelerator: 'CmdOrCtrl+,',
                    click: this.handleOpenPreference,
                },
                {type: 'separator'},
                {
                    label: t('appMenu.openPluginDir'),
                    click: () => context.executeOperation(EditorOps.openPluginDirectory, {})
                },
                {type: 'separator'},
                {
                    label: t('appMenu.quit'),
                    accelerator: 'CmdOrCtrl+Q',
                    role: 'quit',
                }
            ],
        })

        menu.push({
            label: t('file.label'),
            submenu: [
                {
                    label: t('file.newProject'),
                    accelerator: 'CmdOrCtrl+N',
                    click: () => context.executeOperation(EditorOps.newProject, {})
                },
                {type: 'separator'},
                {
                    label: t('file.openProject'),
                    accelerator: 'CmdOrCtrl+O',
                    click: () => context.executeOperation(EditorOps.openProject, {})
                },
                {type: 'separator'},
                {
                    label: t('file.save'),
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        const state = context.getStore(EditorStore).getState()
                        let path: string | null = state.projectPath

                        if (!path) {
                            path = remote.dialog.showSaveDialog({
                                title: t('modals.saveAs.title'),
                                buttonLabel: t('modals.saveAs.save'),
                                filters: [
                                    {
                                        name: 'Delir Project File',
                                        extensions: ['delir']
                                    }
                                ],
                            })

                            // cancelled
                            if (!path) return
                        }

                        context.executeOperation(EditorOps.saveProject, { path })
                    }
                },
                {
                    label: t('file.saveAs'),
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => {
                        const path = remote.dialog.showSaveDialog({
                            title: t('modals.saveAs.title'),
                            buttonLabel: t('modals.saveAs.save'),
                            filters: [
                                {
                                    name: 'Delir Project File',
                                    extensions: ['delir']
                                }
                            ],
                        })

                        // cancelled
                        if (!path) return

                        context.executeOperation(EditorOps.saveProject, { path })
                    }
                },
                {type: 'separator'},
                {
                    label: t('file.rendering'),
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click() {
                        const comp = context.getStore(EditorStore).getState().activeComp
                        if (!comp) return
                        context.executeOperation(EditorOps.renderDestinate, { compositionId: comp.id! })
                    }
                },
                ...(Platform.isWindows() ? [
                    {type: 'separator'} as any,
                    {
                        label: t('appMenu.quit'),
                        accelerator: 'CmdOrCtrl+Q',
                        role: 'quit',
                    },
                ] : [])
            ]
        }, {
            label: t('edit.label'),
            submenu: [
                {
                    label: t('edit.undo'),
                    role: 'undo'
                },
                {
                    label: t('edit.redo'),
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: t('edit.cut'),
                    role: 'cut'
                },
                {
                    label: t('edit.copy'),
                    role: 'copy'
                },
                {
                    label: t('edit.paste'),
                    role: 'paste'
                },
                {
                    label: t('edit.selectAll'),
                    role: 'selectall'
                },
            ],
        })

        menu.push({
            label: t('preview.label'),
            submenu: [
                {
                    label: previewPlayed ? t('preview.pause') : t('preview.play'),
                    enabled: !!activeComp,
                    click: () => {
                        previewPlayed
                            ? context.executeOperation(EditorOps.stopPreview, {})
                            : context.executeOperation(EditorOps.startPreview, {
                                compositionId: activeComp!.id,
                                // Delayed get for rendering performance
                                beginFrame: context.getStore(EditorStore).getState().currentPreviewFrame,
                            })
                    } ,
                },
            ]
        })

        menu.push({
            label: t('develop.label'),
            submenu: [
                {
                    label: t('develop.reload'),
                    accelerator: 'CmdOrCtrl+R',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.reload()
                    }
                },
                {
                    label: t('develop.toggleDevTool'),
                    accelerator: 'CmdOrCtrl+Alt+I',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                    },
                }
            ]
        })

        remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menu))
    }
}))
