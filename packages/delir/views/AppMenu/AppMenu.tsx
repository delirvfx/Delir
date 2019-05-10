import { connectToStores, ContextProp, StoreGetter, withComponentContext } from '@ragg/fleur-react'
import * as Electron from 'electron'
import { remote } from 'electron'
import * as React from 'react'
import * as Platform from '../../utils/platform'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'
import * as AboutModal from '../../modules/AboutModal'

import t from './AppMenu.i18n'

interface State {
    devToolsFocused: boolean
}

type Props = ReturnType<typeof mapStoresToProps> & ContextProp

const mapStoresToProps = (getStore: StoreGetter) => ({
    editor: getStore(EditorStore).getState(),
    previewPlaying: getStore(RendererStore).previewPlaying,
})

export default withComponentContext(
    connectToStores([EditorStore, RendererStore], mapStoresToProps)(
        class AppMenu extends React.Component<Props, State> {
            public state: State = {
                devToolsFocused: false,
            }

            public componentDidMount() {
                const { webContents } = Electron.remote.getCurrentWindow()

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
                return (
                    nextProps.previewPlaying !== this.props.previewPlaying ||
                    nextProps.editor.activeComp !== this.props.editor.activeComp ||
                    nextState.devToolsFocused !== this.state.devToolsFocused
                )
            }

            public render() {
                return null
            }

            private setApplicationMenu() {
                const { context, previewPlaying } = this.props
                const { devToolsFocused } = this.state
                const { activeComp } = this.props.editor
                const menu: Electron.MenuItemConstructorOptions[] = []

                menu.push({
                    label: 'Delir',
                    submenu: [
                        {
                            label: t(t.k.appMenu.about),
                            click: this.openAbout,
                        },
                        { type: 'separator' },
                        {
                            label: t(t.k.appMenu.preference),
                            accelerator: 'CmdOrCtrl+,',
                            click: this.handleOpenPreference,
                        },
                        { type: 'separator' },
                        {
                            label: t(t.k.appMenu.openPluginDir),
                            click: () => context.executeOperation(EditorOps.openPluginDirectory, {}),
                        },
                        { type: 'separator' },
                        {
                            label: t(t.k.appMenu.quit),
                            accelerator: 'CmdOrCtrl+Q',
                            role: 'quit',
                        },
                    ],
                })

                menu.push(
                    {
                        label: t(t.k.file.label),
                        submenu: [
                            {
                                label: t(t.k.file.newProject),
                                accelerator: 'CmdOrCtrl+N',
                                click: this.handleNewProject,
                            },
                            { type: 'separator' },
                            {
                                label: t(t.k.file.openProject),
                                accelerator: 'CmdOrCtrl+O',
                                click: this.handleOpenProject,
                            },
                            { type: 'separator' },
                            {
                                label: t(t.k.file.save),
                                accelerator: 'CmdOrCtrl+S',
                                click: () => {
                                    const state = context.getStore(EditorStore).getState()
                                    let path: string | null = state.projectPath

                                    if (!path) {
                                        path = remote.dialog.showSaveDialog({
                                            title: t(t.k.modals.saveAs.title),
                                            buttonLabel: t(t.k.modals.saveAs.save),
                                            filters: [
                                                {
                                                    name: 'Delir Project File',
                                                    extensions: ['delir'],
                                                },
                                            ],
                                        })

                                        // cancelled
                                        if (!path) return
                                    }

                                    context.executeOperation(EditorOps.saveProject, { path })
                                },
                            },
                            {
                                label: t(t.k.file.saveAs),
                                accelerator: 'CmdOrCtrl+Shift+S',
                                click: () => {
                                    const path = remote.dialog.showSaveDialog({
                                        title: t(t.k.modals.saveAs.title),
                                        buttonLabel: t(t.k.modals.saveAs.save),
                                        filters: [
                                            {
                                                name: 'Delir Project File',
                                                extensions: ['delir'],
                                            },
                                        ],
                                    })

                                    // cancelled
                                    if (!path) return

                                    context.executeOperation(EditorOps.saveProject, { path })
                                },
                            },
                            { type: 'separator' },
                            {
                                label: t(t.k.file.rendering),
                                accelerator: 'CmdOrCtrl+Shift+R',
                                click() {
                                    const comp = context.getStore(EditorStore).getState().activeComp
                                    if (!comp) return
                                    context.executeOperation(EditorOps.renderDestinate, {
                                        compositionId: comp.id!,
                                    })
                                },
                            },
                            ...(Platform.isWindows()
                                ? [
                                      { type: 'separator' } as any,
                                      {
                                          label: t(t.k.appMenu.quit),
                                          accelerator: 'CmdOrCtrl+Q',
                                          role: 'quit',
                                      },
                                  ]
                                : []),
                        ],
                    },
                    {
                        label: t(t.k.edit.label),
                        submenu: [
                            {
                                label: t(t.k.edit.undo),
                                accelerator: 'CmdOrCtrl+Z',
                                click: this.handleUndo,
                                ...(devToolsFocused ? { role: 'undo' } : {}),
                            },
                            {
                                label: t(t.k.edit.redo),
                                accelerator: Platform.isMacOS() ? 'CmdOrCtrl+Shift+Z' : 'CmdOrCtrl+Y',
                                click: this.handleRedo,
                                ...(devToolsFocused ? { role: 'redo' } : {}),
                            },
                            {
                                type: 'separator',
                            },
                            {
                                label: t(t.k.edit.cut),
                                accelerator: 'CmdOrCtrl+X',
                                click: this.handleCut,
                                ...(devToolsFocused ? { role: 'cut' } : {}),
                            },
                            {
                                label: t(t.k.edit.copy),
                                accelerator: 'CmdOrCtrl+C',
                                click: this.handleCopy,
                                ...(devToolsFocused ? { role: 'copy' } : {}),
                            },
                            {
                                label: t(t.k.edit.paste),
                                accelerator: 'CmdOrCtrl+V',
                                click: this.handlePaste,
                                ...(devToolsFocused ? { role: 'paste' } : {}),
                            },
                            {
                                label: t(t.k.edit.selectAll),
                                role: 'selectall',
                            },
                        ],
                    },
                )

                menu.push({
                    label: t(t.k.preview.label),
                    submenu: [
                        {
                            label: previewPlaying ? t(t.k.preview.pause) : t(t.k.preview.play),
                            enabled: !!activeComp,
                            click: () => {
                                previewPlaying
                                    ? context.executeOperation(RendererOps.stopPreview, {})
                                    : context.executeOperation(RendererOps.startPreview, {
                                          compositionId: activeComp!.id,
                                          // Delayed get for rendering performance
                                          beginFrame: context.getStore(EditorStore).getState().currentPreviewFrame,
                                      })
                            },
                        },
                    ],
                })

                menu.push({
                    label: t(t.k.develop.label),
                    submenu: [
                        {
                            label: t(t.k.develop.reload),
                            accelerator: 'CmdOrCtrl+R',
                            click(item, focusedWindow) {
                                if (focusedWindow) focusedWindow.reload()
                            },
                        },
                        {
                            label: t(t.k.develop.toggleDevTool),
                            accelerator: 'CmdOrCtrl+Alt+I',
                            click(item, focusedWindow) {
                                if (focusedWindow) focusedWindow.webContents.toggleDevTools()
                            },
                        },
                    ],
                })

                remote.Menu.setApplicationMenu(remote.Menu.buildFromTemplate(menu))
            }

            private openAbout = () => {
                AboutModal.show()
            }

            private handleNewProject = () => {
                const project = this.props.getStore(EditorStore).getState().project

                if (project) {
                    const acceptDiscard = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                        type: 'question',
                        message: t(t.k.modals.newProject.confirm),
                        buttons: [t(t.k.modals.newProject.continue), t(t.k.modals.newProject.cancel)],
                    })

                    if (acceptDiscard === 1) {
                        return
                    }
                }

                this.props.executeOperation(EditorOps.newProject, {})
            }

            private handleOpenProject = () => {
                const { project } = this.props.getStore(EditorStore)

                if (project) {
                    const acceptDiscard = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                        type: 'question',
                        message: t(t.k.modals.openProject.confirm),
                        buttons: [t(t.k.modals.openProject.continue), t(t.k.modals.openProject.cancel)],
                        defaultId: 0,
                    })

                    if (acceptDiscard === 1) {
                        return
                    }
                }

                const path = remote.dialog.showOpenDialog({
                    title: t(t.k.modals.openProject.title),
                    filters: [{ name: 'Delir project', extensions: ['delir'] }],
                    properties: ['openFile'],
                })

                if (!path || !path.length) return

                this.props.executeOperation(EditorOps.openProject, { path: path[0] })
            }

            private handleOpenPreference = () => {
                this.props.executeOperation(EditorOps.changePreferenceOpenState, { open: true })
            }

            private handleCopy = () => {
                uiActionCopy()
            }

            private handleCut = () => {
                uiActionCut()
            }

            private handlePaste = () => {
                uiActionPaste()
            }

            private handleUndo = () => {
                uiActionUndo(this.props.context)
            }

            private handleRedo = () => {
                uiActionRedo(this.props.context)
            }
        },
    ),
)
