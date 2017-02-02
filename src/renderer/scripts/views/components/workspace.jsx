import _ from 'lodash'
import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class Workspace extends React.Component
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
        const props = _.omit(this.props, ['children', 'className', 'acceptPaneDragIn', 'direction'])

        return (
            <div className={classnames('_workspace', `_workspace--${this.props.direction}`, this.props.className)} {...props}>
                {this.props.children}
            </div>
        )
    }
}
