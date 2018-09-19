import * as classnames from 'classnames'
import * as React from 'react'

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
            ...rest
        } = this.props

        return (
            <div
                className={classnames('_workspace-pane', className, {
                    '_workspace-pane--allow-focus': allowFocus,
                })}
                tabIndex={allowFocus ? -1 : void 0}
                {...rest as any /* TODO: @types/react is broken... 😭 check fixing */}
            >
                {resizable ? <div className='_workspace-pane-handle' /> : null}
                {React.Children.map(children, child => child)}
            </div>
        )
    }
}
