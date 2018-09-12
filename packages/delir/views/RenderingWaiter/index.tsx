import { RenderingProgress, RenderingStep } from '@ragg/deream'
import { connectToStores } from '@ragg/fleur-react'
import * as classnames from 'classnames'
import * as React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'

import RendererStore from '../../domain/Renderer/RendererStore'
import Button from '../components/Button/Button'

import t from './RenderingWaiter.i18n'
import * as s from './style.styl'

interface ConnectedProps {
    inRendering: boolean
    status: RenderingProgress | null
}

type Props = ConnectedProps

interface State {
    show: boolean
}

export default connectToStores([RendererStore], (context) => ({
    inRendering: context.getStore(RendererStore).isInRendering(),
    status: context.getStore(RendererStore).getExportingState(),
}))(class RenderingWaiter extends React.Component<Props, State> {
    public state: State = {
        show: true
    }

    public componentDidUpdate(prevProps: Props) {
        if (prevProps.inRendering === false && this.props.inRendering) {
            this.setState({ show: true })
        }
    }

    public render() {
        const { status } = this.props
        const { show } = this.state

        return (
            <CSSTransitionGroup
                component='div'
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
                                    <div className={s.statusText}>{this.statusToText(status)}</div>
                                </div>
                                <Button type='primary' className={s.doneButton} onClick={this.handleClickDone}>
                                    {t('close')}
                                </Button>
                            </>
                        ) : (
                            <div className={s.status}>
                                <i className={classnames('fa fa-circle-o-notch fa-3x', s.spinner)} />
                                <div className={s.statusText}>{this.statusToText(status)}</div>
                            </div>
                        )}
                    </div>
                )}
            </CSSTransitionGroup>
        )
    }

    private handleClickDone = () => {
        this.setState({ show: false })
    }

    private statusToText(progress: RenderingProgress) {
        switch (progress.step) {
            case RenderingStep.Started: return t('step.started')
            case RenderingStep.Rendering: return t('step.rendering', { progression: Math.floor(progress.progression * 100) })
            case RenderingStep.Encoding: return t('step.encoding')
            case RenderingStep.Concat: return t('step.concat')
            case RenderingStep.Completed: return t('step.completed')
        }
    }
})
