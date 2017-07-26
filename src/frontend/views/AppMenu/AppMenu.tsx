import * as React from 'react'
import * as Electron from 'electron'
import {remote} from 'electron'
import * as Platform from '../../utils/platform'

import AppActions from '../../actions/App'
import EditorStateStore from '../../stores/EditorStateStore'

import t from './AppMenu.i18n'

export default class AppMenu extends React.Component<any, any>
{
    public render()
    {
        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(this._buildMenu())
        )

        return null
    }

    private _buildMenu(): Electron.MenuItemConstructorOptions[]
    {
        const menu = []

        if (Platform.isMacOS()) {
            menu.push({
                label: remote.app.getName(),
                submenu: [
                    {
                        label: t('appMenu.about'),
                        role: 'about',
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

        return menu
    }
}
