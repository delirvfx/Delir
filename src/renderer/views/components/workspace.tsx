import * as _ from 'lodash'
import * as React from 'react'
import {Component, PropTypes} from 'react'
import * as classnames from 'classnames'

export interface WorkspaceProps {
    children: React.ComponentElement<any, any>,
    className?: string,
    acceptPaneDragIn?: boolean,
    direction: 'vertical'|'horizontal'
}

export default class Workspace extends Component<WorkspaceProps, any>
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

    render()
    {
        const props = _.omit(this.props, ['children', 'className', 'acceptPaneDragIn', 'direction'])

        return (
            <div className={classnames('_workspace', `_workspace--${this.props.direction}`, this.props.className)} {...props}>
                {this.props.children}
            </div>
        )
    }
}
