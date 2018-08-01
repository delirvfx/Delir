import * as classnames from 'classnames'
import { remote } from 'electron'
import * as _ from 'lodash'
import * as path from 'path'
import * as qs from 'querystring'
import * as React from 'react'
import * as URL from 'url'

import Portal from '../Portal'

import * as s from './ModalWindow.styl'

export interface ModalWindowProps {
    show?: boolean
    url?: string
    width?: number
    height?: number
    closable?: boolean
    query?: {[name: string]: string | number}
    onHide?: () => any
    onResponse?: (param: {[name: string]: string | number}) => any
}

interface ModalWindowState {
    show: boolean
    onTransitionEnd?: () => void
}

export const show = <T extends JSX.Element = any>(component: T, props: ModalWindowProps = {show: true}): Portal => {
    return Portal.mount(<ModalWindow {...props}>{component}</ModalWindow>)
}

export default class ModalWindow extends React.Component<ModalWindowProps, ModalWindowState>
{
    public static defaultProps = {
        show: false,
        url: 'about:blank',
        closable: true,
    }

    private window: Electron.BrowserWindow

    constructor(props: ModalWindowProps, context: any)
    {
        super(props, context)

        this.state = {
            show: this.props.show
        }
    }

    public render()
    {
        const {children, url, width, height} = this.props

        return (
            <div className={classnames(s.root, {[s['--show']]: this.state.show})} onTransitionEnd={this.transitionEnd}>
                {children ? children : <webview className={s.webview} src={url} autosize='on' style={{width, height}} />}
            </div>
        )
    }

    private transitionEnd = () => {
        const {onTransitionEnd} = this.state

        if (typeof onTransitionEnd === 'function') {
            onTransitionEnd()
        }
    }
}
