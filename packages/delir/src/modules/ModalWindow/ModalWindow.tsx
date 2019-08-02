import classnames from 'classnames'
import _ from 'lodash'
import React from 'react'

import Portal from '../Portal'

import s from './ModalWindow.sass'

export interface Props {
  show?: boolean
  closable?: boolean
  query?: { [name: string]: string | number }
  onHide?: () => any
}

interface State {
  show: boolean
}

export const show = <T extends JSX.Element = any>(component: T, props: Props = { show: true }): Portal => {
  return Portal.mount(<ModalWindow {...props}>{component}</ModalWindow>)
}

export class ModalWindow extends React.Component<Props, State> {
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
