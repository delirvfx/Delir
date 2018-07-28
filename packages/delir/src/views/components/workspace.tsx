import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Component } from 'react'

export interface WorkspaceProps extends React.DOMAttributes<HTMLDivElement> {
    className?: string,
    acceptPaneDragIn?: boolean,
    direction: 'vertical' | 'horizontal'
}

export default class Workspace extends Component<WorkspaceProps, any>
{
    public static propTypes = {
        children: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.arrayOf(PropTypes.element),
        ]),
        className: PropTypes.string,
        acceptPaneDragIn: PropTypes.bool,
        direction: PropTypes.oneOf(['vertical', 'horizontal']).isRequired
    }

    public static defaultProps = {
        acceptPaneDragIn: false,
    }

    public render()
    {
        const props = _.omit(this.props, ['children', 'className', 'acceptPaneDragIn', 'direction'])

        return (
            <div className={classnames('_workspace', `_workspace--${this.props.direction}`, this.props.className)} {...props}>
                {this.props.children}
            </div>
        )
    }
}
