import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class Pane extends React.Component
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
            <div className={classnames('_workspace-pane', this.props.className, {
                '_workspace-pane--allow-focus': this.props.allowFocus,
            })} tabIndex={this.props.allowFocus ? '-1' : null}>
                {(() => this.props.resizable ? <div className='_workspace-pane-handle' /> : null)()}
                {this.props.children}
            </div>
        )
    }
}
