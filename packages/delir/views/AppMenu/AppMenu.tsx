import { connectToStores, ContextProp, withComponentContext } from '@ragg/fleur-react'
import * as Electron from 'electron'
import { remote } from 'electron'
import * as React from 'react'
import * as Platform from '../../utils/platform'

import EditorStore, { EditorState } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as AboutModal from '../../modules/AboutModal'
import { GlobalEvent, GlobalEvents } from '../AppView/GlobalEvents'

import t from './AppMenu.i18n'

interface ConnectedProps {
    editor: EditorState
}

interface State {
    devToolsFocused: boolean
}

type Props = ConnectedProps & ContextProp

const isSelectionInputElement = (el: Element) => {
    return (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement)
        && (el.selectionStart !== el.selectionEnd)
}

export default withComponentContext(connectToStores([EditorStore], (context) => ({
    editor: context.getStore(EditorStore).getState()
}))(class AppMenu extends React.Component<Props, State> {
    public state: State = {
        devToolsFocused: false
    }

    public componentDidMount() {
        const {webContents} = Electron.remote.getCurrentWindow()

        window.addEventListener('focus', () => {
            this.setState({ devToolsFocused: false })
        })

        webContents.on('devtools-focused', () => {
            this.setState({ devToolsFocused: true })
        })

        this.setApplicationMenu()
    }

    public componentDidUpdate() {
        this.setApplicationMenu()
    }

    public shouldComponentUpdate(nextProps: Props, nextState: State) {
        return nextProps.editor.previewPlayed !== this.props.editor.previewPlayed
            || nextProps.editor.activeComp !== this.props.editor.activeComp
            || nextState.devToolsFocused !== this.state.devToolsFocused
    }

    public render()
    {
        return null
    }

    private setApplicationMenu()
    {
        const {context} = this.props
        const {devToolsFocused} = this.state
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
                    accelerator: 'CmdOrCtrl+X',
                    click: this.handleCut,
                    ...(devToolsFocused ? { role: 'cut' } : {})
                },
                {
                    label: t('edit.copy'),
                    accelerator: 'CmdOrCtrl+C',
                    click: this.handleCopy,
                    ...(devToolsFocused ? { role: 'copy' } : {})
                },
                {
                    label: t('edit.paste'),
                    accelerator: 'CmdOrCtrl+V',
                    click: this.handlePaste,
                    ...(devToolsFocused ? { role: 'paste' } : {})
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

    private openAbout = () => {
        AboutModal.show()
    }

    private handleOpenPreference = () => {
        this.props.context.executeOperation(EditorOps.changePreferenceOpenState, { open: true })
    }

    private handleCopy = () => {
        const {activeElement} = document

        if (isSelectionInputElement(activeElement)) {
            document.execCommand('copy')
        } else {
            GlobalEvents.emit(GlobalEvent.copyViaApplicationMenu, {})
        }
    }

    private handleCut = () => {
        const {activeElement} = document

        if (isSelectionInputElement(activeElement)) {
            document.execCommand('cut')
        } else {
            GlobalEvents.emit(GlobalEvent.cutViaApplicationMenu, {})
        }
    }

    private handlePaste = () => {
        const {activeElement} = document

        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
            document.execCommand('paste')
        } else {
            GlobalEvents.emit(GlobalEvent.pasteViaApplicationMenu, {})
        }
    }
}))
