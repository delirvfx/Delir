import { StoreGetter, useFleurContext, useStore } from '@fleur/fleur-react'
import { remote } from 'electron'
import path from 'path'
import React from 'react'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import * as PreferenceOps from '../../domain/Preference/operations'
import PreferenceStore from '../../domain/Preference/PreferenceStore'
import * as RendererOps from '../../domain/Renderer/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import Pane from '../../components/pane'

import s from './style.styl'

export const NavigationView = () => {
  const context = useFleurContext()

  const {
    audioVolume,
    previewPlaying,
    editor: { activeComp, project, projectPath },
  } = useStore([EditorStore, RendererStore, PreferenceStore], (getStore: StoreGetter) => ({
    editor: getStore(EditorStore).getState(),
    previewPlaying: getStore(RendererStore).previewPlaying,
    audioVolume: getStore(PreferenceStore).audioVolume,
  }))

  const projectName = project ? 'Delir - ' + (projectPath ? path.basename(projectPath) : 'New Project') : 'Delir'

  React.useEffect(() => {
    document.title = projectName
  }, [projectName])

  const onClickPlay = React.useCallback(() => {
    if (!activeComp) return

    context.executeOperation(RendererOps.startPreview, {
      compositionId: activeComp.id!,
    })
  }, [])

  const onClickPause = React.useCallback((e: React.MouseEvent<HTMLLIElement>) => {
    context.executeOperation(RendererOps.stopPreview)
  }, [])

  const onClickDest = React.useCallback(() => {
    if (!activeComp) return

    context.executeOperation(EditorOps.renderDestinate, {
      compositionId: activeComp.id!,
    })
  }, [])

  const handleChangeVolume = React.useCallback(({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    context.executeOperation(PreferenceOps.setAudioVolume, currentTarget.valueAsNumber)
  }, [])

  const titleBarDoubleClicked = React.useCallback(() => {
    const browserWindow = remote.getCurrentWindow()
    browserWindow.isMaximized() ? browserWindow.unmaximize() : browserWindow.maximize()
  }, [])

  return (
    <Pane className={s.navigationView} resizable={false}>
      <ul className={s.titleBar} onDoubleClick={titleBarDoubleClicked}>
        {projectName}
      </ul>
      <ul className={s.navigationList}>
        {previewPlaying ? (
          <li className={s.icon} onClick={onClickPause}>
            <i className="fa fa-pause" />
          </li>
        ) : (
          <li className={s.icon} onClick={onClickPlay}>
            <i className="fa fa-play" />
          </li>
        )}
        <li onClick={onClickDest}>
          <i className="fa fa-film" />
        </li>
        <li className={s.volume}>
          <i className="fa fa-volume-up" />
          <input type="range" onChange={handleChangeVolume} value={audioVolume} min={0} max={100} />
        </li>
      </ul>
    </Pane>
  )
}
