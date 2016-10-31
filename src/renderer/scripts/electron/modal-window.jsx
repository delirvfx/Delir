import React, {PropTypes} from 'react'
import path from 'path'
import {remote} from 'electron'

const appPath = remote.app.getAppPath()
const buildUrl = filepath => `file://${path.join(appPath, '/renderer/', filepath)}`

export default class WindowComponent extends React.Component
{
    static propTypes = {
        children: PropTypes.element.isRequired,
        show: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
    }

    static defaultProps = {
        show: false,
        url: 'about:blank',
    }

    constructor(...args)
    {
        super(...args)

        this.window = new remote.BrowserWindow({
            // parent: remote.getCurrentWindow(),
            modal: true,
            show: this.props.show,
            frame: false,
            minimizable: false,
            maximizable: false,
            resizable: false,
            // useContentSize: true,
            width: this.props.width,
            height: this.props.height,
        })

        this.window.on('close', e => {
            e.preventDefault()
            console.log('close', e);
            // this.window.hide()
        })

        this.window.loadURL(buildUrl(this.props.url))
    }

    componentDidMount()
    {
    }

    componentWillUnmount()
    {
        this.window.destroy()
    }

    render() {
        this.props.show ? this.window.show() : this.window.hide()
        this.props.url !== this.window.webContents.getURL() && this.window.loadURL(buildUrl(this.props.url))
        return null
    }
}
