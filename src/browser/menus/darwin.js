import {app, dialog} from 'electron'

export default [
    {
        label: app.getName(),
        submenu: [
            {
                label: 'About Delir',
                role: 'about',
            },
            {type: 'separator'},
            {
                label: 'Open Plugin directory',
                click(item, focusedWindow) {
                    focusedWindow.webContents.send('action', {
                        type: 'OPEN_PLUGIN_DIR',
                    })
                }
            },
            {type: 'separator'},
            {
                label: 'Quit Delir',
                accelerator: 'CmdOrCtrl+Q',
                role: 'quit',
            }
        ],
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click(item, focusedWindow) {
                }
            },
            {
                label: 'New Project',
                enabled: false,
                click(item, focusedWindow) {
                }
            },
            {type: 'separator'},
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click(item, focusedWindow) {
                }
            },
            {
                label: 'Save as ...',
                accelerator: 'CmdOrCtrl+Shift+S',
                click(item, focusedWindow) {
                    const path = dialog.showSaveDialog({
                        title: 'Save as ...',
                        // defaultPath: '/Users/ragg/',
                        buttonLabel: 'Save',
                        filters: [
                            {
                                name: 'Delir Project File',
                                extensions: ['delir']
                            }
                        ],
                    })

                    if (!path) return
                    focusedWindow.webContents.send('action', {
                        type: 'project:save',
                        payload: {
                            path: path
                        }
                    })
                }
            },
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
            {
                label: 'Toggle DevToolds',
                accelerator: 'CmdOrCtrl+Alt+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                },
            }
        ]
    },
    {
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
    },
    {
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
                accelerator: 'CmdOrCtrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                },
            }
        ]
    }
];
