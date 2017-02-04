import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as path from 'path'
import * as URL from 'url'
import * as qs from 'querystring'
import {remote} from 'electron'

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
        onHide: PropTypes.func,
        onResponse: PropTypes.func,
    }

    static defaultProps = {
        show: false,
        url: 'about:blank',
    }

    window: Electron.BrowserWindow

    constructor(props: ModalWindowProps, context: any)
    {
        super(props, context)

        this.window = new remote.BrowserWindow({
            parent: remote.getCurrentWindow(),
            modal: true,
            show: this.props.show,
            frame: true,
            // minimizable: false,
            // maximizable: false,
            resizable: false,
            // useContentSize: true,
            width: this.props.width,
            height: this.props.height,
        })

        this.state = {
            previousQuery: this.props.query,
        }

        this.window.on('hide', () => {
            this.props && this.props.onHide!()
        })

        this.window.webContents.on('will-navigate', (e, url) => {
            const res = qs.parse(URL.parse(url).query)
            this.props.onResponse && this.props.onResponse!(res)
            e.preventDefault()
        })

        this.window.loadURL(buildUrl(this.props.url, this.props.query))
    }

    componentDidMount()
    {
    }

    shouldComponentUpdate(nextProps: ModalWindowProps, nextState: any)
    {
        return this.props.url !== nextProps.url
            || this.props.query !== nextProps.query
            || this.props.show !== nextProps.show
    }

    componentWillUpdate(nextProps: ModalWindowProps, nextState: any)
    {
        if (this.props.show !== nextProps.show) {
            nextProps.show ? this.window.show() : this.window.hide()
        }
    }

    componentWillUnmount()
    {
        this.window.destroy()
    }

    render() {
        this.window.loadURL(buildUrl(this.props.url || "", this.props.query))
        this.props.show ? this.window.show() : this.window.hide()
        // this.props.url !== this.window.webContents.getURL() && this.window.loadURL(buildUrl(this.props.url))
        return null
    }
}
