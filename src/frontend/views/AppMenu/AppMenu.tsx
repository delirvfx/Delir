import * as Electron from 'electron'
import { remote } from 'electron'
import * as React from 'react'
import * as Platform from '../../utils/platform'

import AppActions from '../../actions/App'
import * as AboutModal from '../../modules/AboutModal'
import {default as EditorStateStore, EditorState } from '../../stores/EditorStateStore'
import connectToStores from '../../utils/Flux/connectToStores'

import t from './AppMenu.i18n'

interface Props {
    editor: EditorState
}

@connectToStores([EditorStateStore], () => ({
    editor: EditorStateStore.getState()
}))
export default class AppMenu extends React.PureComponent<Props>
{

    public render()
    {
        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(this._buildMenu())
        )

        return null
    }
    private openAbout = () => {
        AboutModal.show()
    }

    private _buildMenu(): Electron.MenuItemConstructorOptions[]
    {
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
                        click: () => AppActions.openPluginDirectory()
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
                    click: () => AppActions.newProject()
                },
                {type: 'separator'},
                {
                    label: t('file.openProject'),
                    accelerator: 'CmdOrCtrl+O',
                    click: () => AppActions.openProject()
                },
                {type: 'separator'},
                {
                    label: t('file.save'),
                    accelerator: 'CmdOrCtrl+S',
                    click: () => AppActions.overwriteProject()
                },
                {
                    label: t('file.saveAs'),
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => AppActions.saveProject()
                },
                {type: 'separator'},
                {
                    label: t('file.rendering'),
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click() {
                        const comp = EditorStateStore.getState().get('activeComp')
                        if (!comp) return
                        AppActions.renderDestinate(comp.id!)
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
                            ? AppActions.stopPreview()
                            : AppActions.startPreview(activeComp!.id, currentPreviewFrame)
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
                        click: () => AppActions.openPluginDirectory()
                    },
                ],
            })
        }

        return menu
    }
}
