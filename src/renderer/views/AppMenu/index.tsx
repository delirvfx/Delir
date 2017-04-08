import * as React from 'react'
import * as Electron from 'electron'
import {remote} from 'electron'
import * as Platform from '../../utils/platform'

import EditorStateActions from '../../actions/editor-state-actions'

export default class AppMenu extends React.Component<any, any>
{
    render()
    {
        remote.Menu.setApplicationMenu(
            remote.Menu.buildFromTemplate(this._buildMenu())
        )

        return null
    }

    private _buildMenu(): Electron.MenuItemOptions[]
    {
        const menu = []

        if (Platform.isMacOS()) {
            menu.push({
                label: remote.app.getName(),
                submenu: [
                    {
                        label: 'About Delir',
                        role: 'about',
                    },
                    {type: 'separator'},
                    {
                        label: 'Open plugins directory',
                        click: () => EditorStateActions.openPluginDirectory()
                    },
                    {type: 'separator'},
                    {
                        label: 'Quit Delir',
                        accelerator: 'CmdOrCtrl+Q',
                        role: 'quit',
                    }
                ],
            })
        }

        menu.push({
            label: 'File',
            submenu: [
                {
                    label: 'Open',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => EditorStateActions.openProject()
                },
                {
                    label: 'New Project',
                    click: () => EditorStateActions.newProject()
                },
                {type: 'separator'},
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => EditorStateActions.overwriteProject()
                },
                {
                    label: 'Save as ...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => EditorStateActions.saveProject()
                },
                {type: 'separator'},
                {
                    label: 'Rendering',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click(item, focusedWindow) {
                        const path = dialog.showSaveDialog({
                            title: 'Save as ...',
                            // defaultPath: '/Users/ragg/',
                            buttonLabel: 'Render',
                            filters: [
                                {
                                    name: 'Movie',
                                    extensions: ['mp4']
                                }
                            ],
                        })

                        if (!path) return
                        focusedWindow.webContents.send('action', {
                            type: 'RENDER_DESTINATE',
                            payload: {
                                path: path
                            }
                        })
                    }
                },
            ]
        }, {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'selectall'
                },
            ],
        })

        if (/* __DEV__ */ true) {
            menu.push({
                label: 'Develop',
                submenu: [
                    {
                        label: 'Reload',
                        accelerator: 'CmdOrCtrl+R',
                        click(item, focusedWindow) {
                            if (focusedWindow) focusedWindow.reload()
                        }
                    },
                    {
                        label: 'Toggle DevToolds',
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
