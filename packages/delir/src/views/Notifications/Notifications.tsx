import { useFleurContext, useStore } from '@fleur/react'
import classnames from 'classnames'
import React, { CSSProperties, useCallback, useEffect } from 'react'
import { animated, useTransition } from 'react-spring'
import { preserveLineBreak } from 'utils/React'

import EditorStore, { NotificationEntry } from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import { useRef } from 'react'
import t from './Notifications.i18n'
import s from './Notifications.sass'

const Entry = ({ entry, style }: { entry: NotificationEntry; style: CSSProperties }) => {
  const { executeOperation } = useFleurContext()
  const timerIdRef = useRef<number>(-1)

  const closeNotification = useCallback(() => {
    executeOperation(EditorOps.removeNotification, { id: entry.id! })
  }, [entry])

  const handleKeepNotifyAction = useCallback(() => {
    if (!entry.timeout) return
    clearTimeout(timerIdRef.current!)
  }, [entry])

  const handleReleaseNotifyAction = useCallback(() => {
    if (!entry.timeout) return
    timerIdRef.current = (setTimeout(closeNotification, entry.timeout) as unknown) as number
  }, [entry, closeNotification])

  useEffect(() => {
    if (!entry.timeout) return
    const id = (timerIdRef.current = (setTimeout(closeNotification, entry.timeout) as unknown) as number)
    return () => clearTimeout(id)
  }, [closeNotification])

  return (
    <animated.div
      className={classnames(s.entry, s[entry.level])}
      style={style}
      tabIndex={-1}
      onFocus={handleKeepNotifyAction}
      onBlur={handleReleaseNotifyAction}
    >
      <div className={s.close} onClick={closeNotification} data-entry-id={entry.id}>
        &times;
      </div>
      {entry.title != null && entry.title !== '' && <h1 className={s.entryTitle}>{entry.title}</h1>}
      {entry.message && <p className={s.entryBody}>{preserveLineBreak(entry.message)}</p>}
      {entry.detail != null && entry.detail !== '' && <pre className={s.detail}>{entry.detail}</pre>}
    </animated.div>
  )
}

export const Notifications = () => {
  const context = useFleurContext()

  const { entries, userCodeException } = useStore(getStore => ({
    entries: getStore(EditorStore).getState().notifications,
    userCodeException: getStore(RendererStore).getUserCodeException(),
  }))

  useEffect(() => {
    if (!userCodeException) {
      context.executeOperation(EditorOps.removeNotification, { id: 'user-code-exception' })
      return
    }

    context.executeOperation(EditorOps.notify, {
      id: 'user-code-exception',
      title: t(t.k.userCodeError),
      message: `In ${userCodeException.location.type}#${userCodeException.location.entityId.slice(0, 4)}`,
      detail: userCodeException.message,
      level: 'error',
    })
  }, [userCodeException])

  const transitions = useTransition(entries, item => item.id, {
    from: { opacity: 0, transform: 'scaleY(0)', transformOrigin: 'top center' },
    enter: { opacity: 1, transform: 'scaleY(1)' },
    leave: { opacity: 0 },
  })

  return (
    <div className={s.root}>
      {transitions.map(({ item: entry, key, props: style }) => (
        <Entry key={key} entry={entry} style={style} />
      ))}
    </div>
  )
}
