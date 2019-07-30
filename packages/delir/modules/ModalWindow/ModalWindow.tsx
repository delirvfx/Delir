import classnames from 'classnames'
import _ from 'lodash'
import React from 'react'

import Portal from '../Portal'

import s from './ModalWindow.styl'

export interface Props {
  show?: boolean
  url?: string
  width?: number
  height?: number
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

export default class ModalWindow extends React.Component<Props, State> {
  public static defaultProps = {
    show: false,
    url: 'about:blank',
    closable: true,
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      show: this.props.show || false,
    }
  }

  public render() {
    const { children, url, width, height } = this.props

    return (
      <div
        className={classnames(s.root, {
          [s['--show']]: this.state.show,
        })}
      >
        {children ? children : <webview className={s.webview} src={url} autosize style={{ width, height }} />}
      </div>
    )
  }
}
