import * as React from 'react'
import ComponentContext from '../ComponentContext'
import ComponentContextProvider from './ComponentContextProvider'

export interface ExecuteActionProp {
    executeAction: ComponentContext['executeAction']
}

type ExcludeExcuteActionProps<T extends ExecuteActionProp> = Pick<T, Exclude<keyof T, keyof ExecuteActionProp>>

const withExecutAction = <Props extends ExecuteActionProp>(Component: React.ComponentClass<Props>) => (
    (props: ExcludeExcuteActionProps<Props>) => (
        React.createElement(ComponentContextProvider.Consumer, {
            children: (context: ComponentContext) => (
                React.createElement(Component, { executeAction: context.executeAction, ...props })
            )
        })
    )
)

export { withExecutAction as default }
