import React, {PropTypes} from 'react';
import cn from 'classnames';

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
        console.log(this.props);
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
            <div className={cn('_workspace', `_workspace--${this.props.direction}`)}>
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
                            <th>種類</th>
                        </tr>
                    </thead>
                    <tbody>
                        {times(2).map((_, idx) => (
                            <tr>
                                <td>🎬</td>
                                <td>Comp {idx}</td>
                                <td>コンポジション</td>
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
        const ctx = this.refs.canvas.getContext('2d')

        const cRand = () => ((Math.random() * 256) | 0).toString(16)
        const render = () => {
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, 640, 360)
            ctx.drawImage(this.refs.video, 0, 0)

            requestAnimationFrame(render)
        }

        requestAnimationFrame(render)
    }

    render()
    {
        return (
            <Pane className='view-preview' allowFocus>
                <canvas ref='canvas' className='canvas' width='640' height='360' />
                <video ref='video' src='../../navcodec.mp4' style={{display:'none'}} volume={.5} autoPlay />
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

                        <div className='timeline-labels'>
                            {(() => times(50).map((_, idx) => (
                                <ul key={idx} className='timeline-labels-label'>
                                    <li className='timeline-labels-label-item'>
                                        LayerName
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

                        <ul className='timeline-lane-container'>
                            <li className='timeline-lane'>item</li>
                            <li className='timeline-lane'>item</li>
                            <li className='timeline-lane'>item</li>
                        </ul>
                    </Pane>
                </Workspace>
            </Pane>
        )
    }
}

class NavigationView extends React.Component
{
    render()
    {
        return (
            <Pane className='view-navigation' resizable={false}>
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
                <Workspace direction='vertical'>
                    <NavigationView />
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
