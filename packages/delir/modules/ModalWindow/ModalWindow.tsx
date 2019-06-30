import * as classnames from 'classnames'
import { remote } from 'electron'
import * as _ from 'lodash'
import * as path from 'path'
import * as qs from 'querystring'
import * as React from 'react'
import * as URL from 'url'

import Portal from '../Portal'

import * as s from './ModalWindow.styl'

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
