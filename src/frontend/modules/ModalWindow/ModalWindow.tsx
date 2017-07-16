import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as path from 'path'
import * as URL from 'url'
import * as qs from 'querystring'
import {remote} from 'electron'
import * as classnames from 'classnames'

import Portal from '../Portal'

import * as s from './ModalWindow.styl'

interface ModalWindowProps {
    show?: boolean
    url?: string
    width?: number
    height?: number
    closable?: boolean
    query?: {[name: string]: string|number}
    onHide?: () => any
    onResponse?: (param: {[name: string]: string|number}) => any
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
    public static propTypes = {
        // children: PropTypes.element.isRequired,
        show: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        query: PropTypes.object,
        closable: PropTypes.bool,
        onHide: PropTypes.func,
        onResponse: PropTypes.func,
    }

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

    private transitionEnd = () => {
        const {onTransitionEnd} = this.state

        if (typeof onTransitionEnd === 'function') {
            onTransitionEnd()
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
}
