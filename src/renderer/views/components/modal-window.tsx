import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'
import * as path from 'path'
import * as URL from 'url'
import * as qs from 'querystring'
import {remote} from 'electron'
import * as classnames from 'classnames'

import Portal from '../../utils/portal'

import * as s from './modal-window.styl'

const appPath = remote.app.getAppPath()
const buildUrl = (filepath: string, query: Object) => {
    return URL.format({
        protocol: 'file',
        host: '',
        pathname: `${path.join(appPath, '/renderer/', filepath)}`,
        query: query ? {query: JSON.stringify(query)} : null,
    })
}

export interface ModalWindowProps {
    show?: boolean,
    url?: string,
    width?: number,
    height?: number,
    closable?: boolean,
    query?: {[name: string]: string|number},
    onHide?: () => any,
    onResponse?: (param: {[name: string]: string|number}) => any,
}

export default class WindowComponent extends React.Component<ModalWindowProps, any>
{
    static propTypes = {
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

    static defaultProps = {
        show: false,
        url: 'about:blank',
        closable: true,
    }

    window: Electron.BrowserWindow

    constructor(props: ModalWindowProps, context: any)
    {
        super(props, context)

        this.state = {
            show: this.props.show
        }
    }

    componentDidMount()
    {
    }

    componentWillUnmount()
    {
        // this.window.destroy()
    }

    render()
    {
        const {children, url, width, height} = this.props
        const {show} = this.state

        console.log('state:', show)

        return (
            <div className={classnames(s.root, {[s['--show']]: show})}>
                {children ? children : <webview className={s.webview} src={url} autosize='on' style={{width, height}} />}
            </div>
        )
    }
}

export class Modal {
    private portal: Portal|null
    private modalView: WindowComponent|null

    constructor()
    {
        this.portal = new Portal()
    }

    mount(element: JSX.Element)
    {
        this.modalView = this.portal!.mount(<WindowComponent show={false}>{element}</WindowComponent>) as WindowComponent
    }

    dispose()
    {
        this.portal!.unmount()
        this.portal = null
        this.modalView = null
    }

    show()
    {
        this.modalView!.setState({show: true})
    }

    hide()
    {
        this.modalView!.setState({show: false})
    }
}


export const show =  (component: JSX.Element, options: ModalWindowProps = {show: true}): Portal => {
    return Portal.mount(<WindowComponent {...options}>{component}</WindowComponent>)
}

export const create = () => new Modal()
