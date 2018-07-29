import * as React from 'react'
import * as classnames from 'classnames'

interface PaneProps extends React.HTMLAttributes<HTMLDivElement> {
    resizable?: boolean,
    allowFocus?: boolean,
    className?: string,
}

export default class Pane extends React.Component<PaneProps, any>
{
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
                {resizable ? <div className='_workspace-pane-handle' /> : null}
                {React.Children.map(children, child => child)}
            </div>
        )
    }
}
