import { useStore } from '@fleur/react'
import { RenderingProgress, RenderingStep } from '@ragg/deream'
import classnames from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import { animated, useTransition } from 'react-spring'

import { Button } from '../../components/Button/Button'
import RendererStore from '../../domain/Renderer/RendererStore'

import t from './RenderingWaiter.i18n'
import s from './RenderingWaiter.sass'

const statusToText = (progress: RenderingProgress) => {
  switch (progress.step) {
    case RenderingStep.Started:
      return t(t.k.step.started)
    case RenderingStep.Rendering:
      return t(t.k.step.rendering, {
        progression: Math.floor(progress.progression * 100),
      })
    case RenderingStep.Encoding:
      return t(t.k.step.encoding)
    case RenderingStep.Concat:
      return t(t.k.step.concat)
    case RenderingStep.Completed:
      return t(t.k.step.completed)
  }
}

export const RenderingWaiter = () => {
  const [show, setShow] = useState(true)

  const { inRendering, status } = useStore([RendererStore], getStore => ({
    inRendering: getStore(RendererStore).isInRendering(),
    status: getStore(RendererStore).getExportingState(),
  }))

  const handleClickDone = useCallback(() => {
    setShow(false)
  }, [])

  useEffect(() => {
    setShow(true)
  }, [inRendering])

  const transitions = useTransition(show && !!status, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  return (
    <>
      {transitions.map(
        ({ item, key, props: style }) =>
          item && (
            <animated.div key={key} className={s.RenderingWaiter} style={style}>
              {status?.step === RenderingStep.Completed ? (
                <>
                  <div className={s.status}>
                    <img className={s.completedParrot} src={require('./parrot.gif')} />
                    <div className={s.statusText}>{statusToText(status)}</div>
                  </div>
                  <Button kind="primary" className={s.doneButton} onClick={handleClickDone}>
                    {t(t.k.close)}
                  </Button>
                </>
              ) : status ? (
                <div className={s.status}>
                  <i className={classnames('fa fa-circle-o-notch fa-3x', s.spinner)} />
                  <div className={s.statusText}>{statusToText(status)}</div>
                </div>
              ) : null}
            </animated.div>
          ),
      )}
    </>
  )
}
