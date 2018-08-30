import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as Electron from 'electron'
import { remote } from 'electron'
import * as React from 'react'

import * as AppActions from '../../actions/App'
import * as AboutModal from '../../modules/AboutModal'
import {default as EditorStateStore, EditorState } from '../../stores/EditorStateStore'
import * as Platform from '../../utils/platform'

import t from './AppMenu.i18n'

interface ConnectedProps {
    editor: EditorState
}

type Props = ConnectedProps & ContextProp

export default withComponentContext(connectToStores([EditorStateStore], (context) => ({
    editor: context.getStore(EditorStateStore).getState()
}))(class AppMenu extends React.PureComponent<Props> {
    public componentDidUpdate() {
        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(this._buildMenu())
        )
    }

    public render()
    {
        return null
    }

    private openAbout = () => {
        AboutModal.show()
    }

    private _buildMenu(): Electron.MenuItemConstructorOptions[]
    {
        const {context} = this.props
        const {previewPlayed, activeComp, currentPreviewFrame} = this.props.editor
        const menu: Electron.MenuItemConstructorOptions[] = []

        if (Platform.isMacOS()) {
            menu.push({
                label: remote.app.getName(),
                submenu: [
                    {
                        label: t('appMenu.about'),
                        click: this.openAbout,
                    },
                    {type: 'separator'},
                    {
                        label: t('appMenu.openPluginDir'),
                        click: () => context.executeOperation(AppActions.openPluginDirectory, {})
                    },
                    {type: 'separator'},
                    {
                        label: t('appMenu.quit'),
                        accelerator: 'CmdOrCtrl+Q',
                        role: 'quit',
                    }
                ],
            })
        }

        menu.push({
            label: t('file.label'),
            submenu: [
                {
                    label: t('file.newProject'),
                    accelerator: 'CmdOrCtrl+N',
                    click: () => context.executeOperation(AppActions.newProject, {})
                },
                {type: 'separator'},
                {
                    label: t('file.openProject'),
                    accelerator: 'CmdOrCtrl+O',
                    click: () => context.executeOperation(AppActions.openProject, {})
                },
                {type: 'separator'},
                {
                    label: t('file.save'),
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        const state = context.getStore(EditorStateStore).getState()
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

                        context.executeOperation(AppActions.saveProject, { path })
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

                        context.executeOperation(AppActions.saveProject, { path })
                    }
                },
                {type: 'separator'},
                {
                    label: t('file.rendering'),
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click() {
                        const comp = context.getStore(EditorStateStore).getState().activeComp
                        if (!comp) return
                        context.executeOperation(AppActions.renderDestinate, { compositionId: comp.id! })
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
                            ? context.executeOperation(AppActions.stopPreview, {})
                            : context.executeOperation(AppActions.startPreview, {
                                compositionId: activeComp!.id,
                                beginFrame: currentPreviewFrame
                            })
                    } ,
                },
            ]
        })

        if (/* __DEV__ */ true) {
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
        }

        if (Platform.isWindows()) {
            menu.push({
                label: t('help.label'),
                submenu: [
                    {
                        label: t('appMenu.about'),
                        click: this.openAbout,
                    },
                    {type: 'separator'},
                    {
                        label: t('appMenu.openPluginDir'),
                        click: () => context.executeOperation(AppActions.openPluginDirectory, {})
                    },
                ],
            })
        }

        return menu
    }
}))
