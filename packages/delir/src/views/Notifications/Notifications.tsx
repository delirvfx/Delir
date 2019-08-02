import { useFleurContext, useStore } from '@fleur/fleur-react'
import classnames from 'classnames'
import React from 'react'
import { animated, useTransition } from 'react-spring'

import EditorStore from '../../domain/Editor/EditorStore'
import * as EditorOps from '../../domain/Editor/operations'
import RendererStore from '../../domain/Renderer/RendererStore'

import t from './Notifications.i18n'
import s from './Notifications.sass'

export const Notifications = () => {
  const context = useFleurContext()

  const { entries, userCodeException } = useStore([EditorStore, RendererStore], getStore => ({
    entries: getStore(EditorStore).getState().notifications,
    userCodeException: getStore(RendererStore).getUserCodeException(),
  }))

  const handleCloseMessage = React.useCallback(({ currentTarget }: React.MouseEvent<HTMLDivElement>) => {
    const { entryId } = currentTarget.dataset
    context.executeOperation(EditorOps.removeNotification, { id: entryId! })
  }, [])

  React.useEffect(() => {
    if (!userCodeException) return

    context.executeOperation(EditorOps.notify, {
      title: t(t.k.userCodeError),
      detail: `In ${userCodeException.location.type}#${userCodeException.location.entityId.slice(0, 4)}\n${
        userCodeException.message
      }`,
      level: 'error',
    })
  }, [userCodeException])

  const transitions = useTransition(entries, null, {
    from: { opacity: 0, transform: 'scaleY(0)', transformOrigin: 'top center' },
    enter: { opacity: 1, transform: 'scaleY(1)' },
    leave: { opacity: 0 },
  })

  return (
    <div className={s.root}>
      {transitions.map(({ item: entry, key, props: style }) => (
        <animated.div key={key} className={classnames(s.entry, s[`--${entry.level}`])} style={style}>
          <div className={s.close} onClick={handleCloseMessage} data-entry-id={entry.id}>
            &times;
          </div>
          {entry.title != null && entry.title !== '' && <h1 className={s.entryTitle}>{entry.title}</h1>}
          {entry.message && <p className={s.entryBody}>{entry.message}</p>}
          {entry.detail != null && entry.detail !== '' && <pre className={s.detail}>{entry.detail}</pre>}
        </animated.div>
      ))}
    </div>
  )
}
