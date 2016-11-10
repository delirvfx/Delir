import React, {PropTypes, Children} from 'react'
import classnames from 'classnames'

export default class Pane extends React.Component
{
    static propTypes = {
        // children: PropTypes.element,
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
        const {
            className,
            allowFocus,
            resizable,
            children,
            ...props
        } = this.props

        return (
            <div
                className={classnames('_workspace-pane', className, {
                    '_workspace-pane--allow-focus': allowFocus,
                })}
                tabIndex={allowFocus ? '-1' : null}
                {...props}
            >
                {(() => resizable ? <div className='_workspace-pane-handle' /> : null)()}
                {Children.map(children, child => child)}
            </div>
        )
    }
}
