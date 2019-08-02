import classnames from 'classnames'
import _ from 'lodash'
import React from 'react'
import s from './Modal.sass'
import { ModalController } from './ModalController'

export interface Props {
  show?: boolean
  closable?: boolean
  query?: { [name: string]: string | number }
  onHide?: () => any
}

interface State {
  show: boolean
}

export const show = <T extends JSX.Element = any>(component: T, props: Props = { show: true }): ModalController => {
  const controller = new ModalController()
  controller.mount(<Modal {...props}>{component}</Modal>)
  return controller
}

export class Modal extends React.Component<Props, State> {
  public static defaultProps = {
    show: false,
    url: 'about:blank',
    closable: true,
  }

  private rootRef = React.createRef<HTMLDivElement>()

  constructor(props: Props) {
    super(props)

    this.state = {
      show: this.props.show || false,
    }
  }

  public toggleShow({ show, onTransitionEnd }: { show: boolean; onTransitionEnd: () => void }) {
    this.setState({ show }, () => {
      this.rootRef.current!.addEventListener('transitionend', () => onTransitionEnd(), { once: true })
    })
  }

  public render() {
    const { children } = this.props

    return (
      <div
        ref={this.rootRef}
        className={classnames(s.root, {
          [s['--show']]: this.state.show,
        })}
      >
        {children}
      </div>
    )
  }
}
