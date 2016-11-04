import _ from 'lodash'
import React, {PropTypes} from 'react'
import path from 'path'
import URL from 'url'
import qs from 'querystring'
import {remote} from 'electron'

const appPath = remote.app.getAppPath()
const buildUrl = (filepath, query) => {
    return URL.format({
        protocol: 'file',
        host: '',
        pathname: `${path.join(appPath, '/renderer/', filepath)}`,
        query: query ? {query: JSON.stringify(query)} : null,
    })
}

export default class WindowComponent extends React.Component
{
    static propTypes = {
        children: PropTypes.element.isRequired,
        show: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        query: PropTypes.object,
        onHide: PropTypes.func,
        onResposnse: PropTypes.func,
    }

    static defaultProps = {
        show: false,
        url: 'about:blank',
    }

    constructor(...args)
    {
        super(...args)

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

        this.window.on('hide', e => {
            this.props.onHide()
        })

        this.window.webContents.on('will-navigate', (e, url) => {
            const res = qs.parse(URL.parse(url).query)
            this.props.onResponse && this.props.onResponse(res)
            e.preventDefault()
        })

        this.window.loadURL(buildUrl(this.props.url, this.props.query))
    }

    componentDidMount()
    {
    }

    componentWillUnmount()
    {
        this.window.destroy()
    }

    render() {
        this.window.loadURL(buildUrl(this.props.url, this.props.query))
        this.props.show ? this.window.show() : this.window.hide()
        // this.props.url !== this.window.webContents.getURL() && this.window.loadURL(buildUrl(this.props.url))
        return null
    }
}
