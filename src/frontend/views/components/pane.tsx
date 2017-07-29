import * as React from 'react'
import {Component, Children} from 'react'
import * as PropTypes from 'prop-types'
import * as classnames from 'classnames'

interface PaneProps extends React.HTMLAttributes<HTMLDivElement> {
    resizable?: boolean,
    allowFocus?: boolean,
    className?: string,
}

export default class Pane extends Component<PaneProps, any>
{
    public static propTypes = {
        children: PropTypes.element,
        resizable: PropTypes.bool,
        allowFocus: PropTypes.bool,
    }

    public static defaultProps = {
        allowFocus: false,
        resizable: true,
        draggable: false,
    }

    public render()
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
                tabIndex={allowFocus ? -1 : void 0}
                {...props}
            >
                {(() => resizable ? <div className='_workspace-pane-handle' /> : null)()}
                {Children.map(children, child => child)}
            </div>
        )
    }
}
