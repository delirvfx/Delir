import * as React from 'react'
import ComponentContext from '../ComponentContext'
import ComponentContextProvider from './ComponentContextProvider'

export interface ExecuteActionProp {
    context: ComponentContext
}

type ExcludeExcuteActionProps<T extends ExecuteActionProp> = Pick<T, Exclude<keyof T, keyof ExecuteActionProp>>

const withComponentContext = <Props extends ExecuteActionProp>(Component: React.ComponentClass<Props>) => (
    (props: ExcludeExcuteActionProps<Props>) => (
        React.createElement(ComponentContextProvider.Consumer, {
            children: (context: ComponentContext) => (
                React.createElement(Component, { ...props,
                    context: {
                        executeAction: context.executeAction,
                        getStore: context.getStore,
                    }
                })
            )
        })
    )
)

export { withComponentContext as default }
