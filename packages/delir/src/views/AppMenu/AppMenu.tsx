import { StoreGetter } from '@fleur/fleur'
import { connectToStores, ContextProp, withFleurContext } from '@fleur/react'
import * as Electron from 'electron'
import { remote } from 'electron'
import React from 'react'
import { Platform } from 'utils/platform'
import { uiActionCopy, uiActionCut, uiActionPaste, uiActionRedo, uiActionUndo } from '../../utils/UIActions'

import { ModalMounterProps, withModalMounter } from '../../components/ModalOwner/ModalOwner'
import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import { getProject } from '../../domain/Project/selectors'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'
import {AboutModal} from '../../modals/AboutModal'
import { ImportPackModal, ImportPackResponse } from '../../modals/ImportPackModal/ImportPackModal'

import t from './AppMenu.i18n'

interface State {
  devToolsFocused: boolean
}

type Props = ReturnType<typeof mapStoresToProps> & ContextProp & ModalMounterProps

const mapStoresToProps = (getStore: StoreGetter) => ({
  editor: getStore(EditorStore).getState(),
  previewPlaying: getStore(RendererStore).previewPlaying,
})

export default withFleurContext(
  connectToStores([EditorStore, RendererStore], mapStoresToProps)(
    withModalMounter(
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
        const { previewPlaying, executeOperation, getStore } = this.props
        const { devToolsFocused } = this.state
        const { activeComp } = this.props.editor
        const menu: Electron.MenuItemConstructorOptions[] = []

        menu.push({
          label: 'Delir',
          submenu: [
            {
              label: t(t.k.appMenu.about),
              click: this.handleOpenAbout,
            },
            { type: 'separator' },
            {
              label: t(t.k.appMenu.preference),
              accelerator: 'CmdOrCtrl+,',
              acceleratorWorksWhenHidden: false,
              click: this.handleOpenPreference,
            },
            { type: 'separator' },
            {
              label: t(t.k.appMenu.openPluginDir),
              click: () => executeOperation(EditorOps.openPluginDirectory),
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
                click: async () => {
                  const { projectPath } = getStore(EditorStore).getState()
                  let path: string | null = projectPath

                  if (!path) {
                    let result = await remote.dialog.showSaveDialog({
                      title: t(t.k.modals.saveAs.title),
                      buttonLabel: t(t.k.modals.saveAs.save),
                      filters: [
                        {
                          name: 'Delir Project File',
                          extensions: ['delir'],
                        },
                      ],
                    })

                    if (!result.canceled) return
                    path = result.filePath!
                  }

                  executeOperation(EditorOps.saveProject, { path })
                },
              },
              {
                label: t(t.k.file.saveAs),
                accelerator: 'CmdOrCtrl+Shift+S',
                click: async () => {
                  const path = await remote.dialog.showSaveDialog({
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
                  if (!path.canceled) return

                  executeOperation(EditorOps.saveProject, { path: path.filePath! })
                },
              },
              { type: 'separator' },
              {
                label: t(t.k.file.importProjectPack),
                click: this.handleImportProjectPack,
              },
              {
                label: t(t.k.file.exportProjectPack),
                click: this.handleExportProjectPack,
              },
              { type: 'separator' },
              {
                label: t(t.k.file.rendering),
                accelerator: 'CmdOrCtrl+Shift+R',
                click() {
                  const comp = getStore(EditorStore).getState().activeComp
                  if (!comp) return
                  executeOperation(EditorOps.renderDestinate, {
                    compositionId: comp.id!,
                  })
                },
              },
              ...(Platform.isWindows
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
                ...(devToolsFocused ? { role: 'undo' as const } : {}),
              },
              {
                label: t(t.k.edit.redo),
                accelerator: Platform.isMacOS() ? 'CmdOrCtrl+Shift+Z' : 'CmdOrCtrl+Y',
                click: this.handleRedo,
                ...(devToolsFocused ? { role: 'redo' as const } : {}),
              },
              {
                type: 'separator' as const,
              },
              {
                label: t(t.k.edit.cut),
                accelerator: 'CmdOrCtrl+X',
                click: this.handleCut,
                ...(devToolsFocused ? { role: 'cut' as const } : {}),
              },
              {
                label: t(t.k.edit.copy),
                accelerator: 'CmdOrCtrl+C',
                click: this.handleCopy,
                ...(devToolsFocused ? { role: 'copy' as const } : {}),
              },
              {
                label: t(t.k.edit.paste),
                accelerator: 'CmdOrCtrl+V',
                click: this.handlePaste,
                ...(devToolsFocused ? { role: 'paste' as const } : {}),
              },
              {
                label: t(t.k.edit.selectAll),
                role: 'selectAll' as const,
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
              accelerator: 'space',
              click: () => {
                previewPlaying
                  ? executeOperation(RendererOps.stopPreview)
                  : executeOperation(RendererOps.startPreview, {
                      compositionId: activeComp!.id,
                      // Delayed get for rendering performance
                      beginFrame: getStore(EditorStore).getState().currentPreviewFrame,
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

      private handleOpenAbout = async() => {
        await this.props.mountModal<void>((resolve)=> <AboutModal onClose={resolve} />)
      }

      private handleNewProject = async () => {
        const project = this.props.getStore(EditorStore).getState().project

        if (project) {
          const acceptDiscard = await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: 'question',
            message: t(t.k.modals.newProject.confirm),
            buttons: [t(t.k.modals.newProject.continue), t(t.k.modals.newProject.cancel)],
          })

          if (acceptDiscard.response === 1) {
            return
          }
        }

        this.props.executeOperation(EditorOps.newProject)
      }

      private handleOpenProject = async () => {
        const { project } = this.props.getStore(EditorStore)

        if (project) {
          const acceptDiscard = await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: 'question',
            message: t(t.k.modals.openProject.confirm),
            buttons: [t(t.k.modals.openProject.continue), t(t.k.modals.openProject.cancel)],
            defaultId: 0,
          })

          if (acceptDiscard.response === 1) {
            return
          }
        }

        const path = await remote.dialog.showOpenDialog({
          title: t(t.k.modals.openProject.title),
          filters: [{ name: 'Delir project', extensions: ['delir'] }],
          properties: ['openFile'],
        })

        if (!path.filePaths?.[0]) return

        this.props.executeOperation(EditorOps.openProject, { path: path.filePaths[0] })
      }

      private handleImportProjectPack = async () => {
        const project = getProject(this.props.getStore)

        if (project) {
          const acceptDiscard = await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: 'question',
            message: t(t.k.modals.openProject.confirm),
            buttons: [t(t.k.modals.openProject.continue), t(t.k.modals.openProject.cancel)],
            defaultId: 0,
          })

          if (acceptDiscard.response === 1) {
            return
          }
        }

        const result = await this.props.mountModal<ImportPackResponse>(resolve => <ImportPackModal onClose={resolve} />)
        if (result.cancelled) return
        this.props.executeOperation(EditorOps.importProjectPack, { src: result.src, dist: result.dist })
      }

      private handleExportProjectPack = async () => {
        const path = await remote.dialog.showSaveDialog({
          title: t(t.k.modals.exportProject.title),
          buttonLabel: t(t.k.modals.exportProject.save),
          filters: [
            {
              name: 'Delir project package',
              extensions: ['delirpp'],
            },
          ],
        })

        if (path.canceled) return

        this.props.executeOperation(EditorOps.exportProjectPack, { dist: path.filePath! })
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
        uiActionUndo(this.props.executeOperation)
      }

      private handleRedo = () => {
        uiActionRedo(this.props.executeOperation)
      }
    },
  )
))
