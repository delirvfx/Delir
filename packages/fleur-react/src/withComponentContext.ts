import { ComponentContext } from '@ragg/fleur'
import * as React from 'react'

import ComponentContextProvider from './ComponentContextProvider'

export interface ComponentContextProp {
    context: ComponentContext
}

type ExcludeComponentContextProp<T extends ComponentContextProp> = Pick<T, Exclude<keyof T, keyof ComponentContextProp>>

const withComponentContext = <Props extends ComponentContextProp>(Component: React.ComponentClass<Props>) => (
    class WithComponentContext extends React.PureComponent<ExcludeComponentContextProp<Props>> {
        public render() {
            return React.createElement(ComponentContextProvider.Consumer, {
                children: (context: ComponentContext) => {
                    return React.createElement(Component as React.ComponentClass<Props>, {
                        ...(this.props as object),
                        context: {
                            executeOperation: context.executeOperation,
                            getStore: context.getStore,
                        }
                    })
                }
            })
        }
    }
)

export { withComponentContext as default }
