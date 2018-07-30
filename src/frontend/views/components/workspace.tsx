import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { Component } from 'react'

export interface WorkspaceProps extends React.DOMAttributes<HTMLDivElement> {
    className?: string,
    acceptPaneDragIn?: boolean,
    direction: 'vertical' | 'horizontal'
}

export default class Workspace extends Component<WorkspaceProps, any>
{
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
