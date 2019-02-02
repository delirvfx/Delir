import { RenderingProgress, RenderingStep } from '@ragg/deream'
import { useStore } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

import Button from '../../components/Button/Button'
import RendererStore from '../../domain/Renderer/RendererStore'

import t from './RenderingWaiter.i18n'
import * as s from './style.styl'

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
    const [show, setShow] = React.useState(true)

    const { inRendering, status } = useStore([RendererStore], getStore => ({
        inRendering: getStore(RendererStore).isInRendering(),
        status: getStore(RendererStore).getExportingState(),
    }))

    const handleClickDone = React.useCallback(() => {
        setShow(false)
    }, [])

    React.useEffect(() => {
        setShow(true)
    }, [inRendering])

    return (
        <CSSTransitionGroup
            component="div"
            transitionName={{
                enter: s.transitionEnter,
                enterActive: s.transitionEnterActive,
                leave: s.transitionLeave,
                leaveActive: s.transitionLeaveActive,
            }}
            transitionEnterTimeout={400}
            transitionLeaveTimeout={400}
        >
            {show && status && (
                <div className={s.RenderingWaiter}>
                    {status.step === RenderingStep.Completed ? (
                        <>
                            <div className={s.status}>
                                <img className={s.completedParrot} src={require('./parrot.gif')} />
                                <div className={s.statusText}>{statusToText(status)}</div>
                            </div>
                            <Button type="primary" className={s.doneButton} onClick={handleClickDone}>
                                {t(t.k.close)}
                            </Button>
                        </>
                    ) : (
                        <div className={s.status}>
                            <i className={classnames('fa fa-circle-o-notch fa-3x', s.spinner)} />
                            <div className={s.statusText}>{statusToText(status)}</div>
                        </div>
                    )}
                </div>
            )}
        </CSSTransitionGroup>
    )
}
