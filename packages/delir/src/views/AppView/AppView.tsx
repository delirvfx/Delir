import { useFleurContext, useStore } from '@fleur/react'
import React, { useCallback, useEffect, useRef } from 'react'
import { animated, Transition } from 'react-spring/renderprops'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'

import { Pane } from '../../components/Pane'
import { Workspace } from '../../components/Workspace'

import AppMenu from '../AppMenu'
import { AssetsView } from '../AssetsView'
import { NavigationView } from '../NavigationView'
import { Notifications } from '../Notifications/Notifications'
import { Preference } from '../Preference'
import { PreviewView } from '../PreviewView/'
import { RenderingWaiter } from '../RenderingWaiter'
import { Timeline } from '../Timeline'
import { ShortcutHandler } from './ShortcutHandler'

import s from './AppView.sass'

export default function AppView() {
  const { executeOperation } = useFleurContext()
  const root = useRef<HTMLDivElement | null>(null)

  const { preferenceOpened } = useStore((get) => ({
    preferenceOpened: get(EditorStore).getState().preferenceOpened,
  }))

  const prevent = useCallback((e: any) => {
    e.preventDefault()
  }, [])

  const projectAutoSaveTimer = useCallback(() => {
    executeOperation(EditorOps.autoSaveProject)
  }, [])

  const handlePreferenceClose = useCallback(() => {
    executeOperation(EditorOps.changePreferenceOpenState, { open: false })
  }, [])

  useEffect(() => {
    window.addEventListener('dragenter', prevent, false)
    window.addEventListener('dragover', prevent, false)

    window.setInterval(projectAutoSaveTimer, 3 * 60 * 1000) // 3min
  }, [])

  return (
    <div ref={root} className="_container" onDrop={prevent}>
      <ShortcutHandler />
      <AppMenu />
      <NavigationView />
      <Workspace className="app-body" direction="vertical">
        <Pane className="body-pane">
          <Workspace direction="horizontal">
            <AssetsView />
            <PreviewView />
          </Workspace>
        </Pane>
        <Timeline />
      </Workspace>
      <Notifications />
      <RenderingWaiter />
      <Transition
        items={preferenceOpened}
        from={{ opacity: 0, transform: 'scale(1.2)' }}
        enter={{ opacity: 1, transform: 'scale(1)' }}
        leave={{ opacity: 0, transform: 'scale(1.2)' }}
      >
        {(opened) =>
          opened &&
          ((style) => (
            <animated.div className={s.preference} style={style}>
              <Preference onClose={handlePreferenceClose} />
            </animated.div>
          ))
        }
      </Transition>
    </div>
  )
}
