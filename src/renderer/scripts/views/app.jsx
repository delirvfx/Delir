import React, {PropTypes} from 'react'
import cn from 'classnames'

import _ from 'lodash'

class Pane extends React.Component
{
    static propTypes = {
        children: PropTypes.element,
        resizable: PropTypes.bool,
        allowFocus: PropTypes.bool,
    }

    static defaultProps = {
        allowFocus: false,
        resizable: true,
        draggable: false,
    }

    render()
    {
        // console.log(this.props)
        return (
            <div className={cn('_workspace-pane', this.props.className, {
                '_workspace-pane--allow-focus': this.props.allowFocus,
            })} tabIndex={this.props.allowFocus ? '-1' : null}>
                {(() => this.props.resizable ? <div className='_workspace-pane-handle' /> : null)()}
                {this.props.children}
            </div>
        )
    }
}

class Workspace extends React.Component
{
    static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.arrayOf(PropTypes.element),
        ]),
        className: PropTypes.string,
        acceptPaneDragIn: PropTypes.bool,
        direction: PropTypes.oneOf(['vertical', 'horizontal']).isRequired
    }

    static defaultProps = {
        acceptPaneDragIn: false,
    }

    state = {
        width: null
    }

    render()
    {
        const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];

        return (
            <div className={cn('_workspace', `_workspace--${this.props.direction}`, this.props.className)}>
                {this.props.children}
            </div>
        )
    }
}


class AssetsView extends React.Component
{
    render()
    {
        return (
            <Pane className='view-assets' allowFocus>
                <table className='asset-list'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>名前</th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.map(app.store.pluginRegistry._plugins, (p, idx) => (
                            <tr>
                                <td>🔌</td>
                                <td>{idx}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table className='composition-list'>
                    <thead>
                        <tr>
                            <th></th>
                            <th>名前</th>
                        </tr>
                    </thead>
                    <tbody>
                        {times(2).map((_, idx) => (
                            <tr>
                                <td>🎬</td>
                                <td>Comp {idx}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Pane>
        )
    }
}

class PreviewView extends React.Component
{
    componentDidMount()
    {
        // const ctx = this.refs.canvas.getContext('2d')
        //
        // const cRand = () => ((Math.random() * 256) | 0).toString(16)
        // const render = () => {
        //     ctx.fillStyle = '#000'
        //     ctx.fillRect(0, 0, 640, 360)
        //     ctx.drawImage(this.refs.video, 0, 0)
        //
        //     requestAnimationFrame(render)
        // }
        //
        // requestAnimationFrame(render)
    }

    render()
    {
        return (
            <Pane className='view-preview' allowFocus>
                <div className='inner'>
                    <div className='header'>Composition 1</div>
                    <div className='view'>
                        <canvas ref='canvas' className='canvas' width='640' height='360' />
                        <video ref='video' src='../../navcodec.mp4' style={{display:'none'}} controls loop />
                    </div>
                </div>
            </Pane>
        )
    }
}

const times = n => {
    const a = [];
    for (let i = 0; i < n; i++) {
        a.push(i);
    }
    return a;
}


class TimelineView extends React.Component
{
    state = {
        timelineScrollTop: 0
    }

    scrollSync(event)
    {
        this.setState({'timelineScrollTop': event.target.scrollTop})
     }

    componentDidUpdate()
    {
        this.refs.timelineLabels.scrollTop = this.refs.timelineLanes.scrollTop = this.state.timelineScrollTop
    }

    render()
    {
        return (
            <Pane className='view-timeline' allowFocus>
                <Workspace direction="horizontal">
                    <Pane className='timeline-labels-container'>
                        <div className='timeline-labels-header'>
                            <span>Label</span>
                            <span>Label</span>
                            <span>Label</span>
                        </div>

                        <div ref='timelineLabels' className='timeline-labels' onScroll={this.scrollSync.bind(this)}>
                            {(() => times(50).map((_, idx) => (
                                <ul key={idx} className='timeline-labels-label'>
                                    <li className='timeline-labels-label-item'>
                                        LayerName {idx}
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        🙈
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        🙆
                                    </li>
                                    <li className='timeline-labels-label-item'>
                                        <input type='checkbox' />
                                    </li>
                                </ul>
                            )))()}
                        </div>
                    </Pane>
                    <Pane className='timeline-container'>
                        <div className='timeline-gradations'>
                        </div>

                        <ul ref='timelineLanes' className='timeline-lane-container' onScroll={this.scrollSync.bind(this)}>
                            {(() => times(50).map((_, idx) => (
                                <li key={idx} className='timeline-lane'>
                                    <div className='timerange-bar' style={{left: idx * 30}}></div>
                                </li>
                            )))()}
                        </ul>
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}

class NavigationView extends React.Component
{
    onTitleDoubleClicked()
    {
        console.log('hi');
    }

    render()
    {
        return (
            <Pane className='view-navigation' resizable={false}>
                <ul className='window-nav'>
                    <li className='window-nav-item window-nav--close'></li>
                    <li className='window-nav-item window-nav--minimize'></li>
                    <li className='window-nav-item window-nav--maximize'></li>
                </ul>
                <ul className='navigation-items'>
                    <li>✨</li>
                    <li>💪</li>
                </ul>
            </Pane>
        )
    }
}


export default class AppView extends React.Component
{
    render()
    {
        return (
            <div className='_container'>
                <NavigationView />
                <Workspace className='app-body' direction='vertical'>
                    <Pane className='body-pane'>
                        <Workspace direction='horizontal'>
                            <AssetsView />
                            <PreviewView />
                        </Workspace>
                    </Pane>
                    <TimelineView />
                </Workspace>
            </div>
        )
    }
}
