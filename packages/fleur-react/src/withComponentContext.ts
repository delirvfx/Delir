import { ComponentContext } from '@ragg/fleur'
import * as React from 'react'

import ComponentContextProvider from './ComponentContextProvider'

export interface ContextProp {
    context: ComponentContext
}

type ExcludeContextProp<P extends ContextProp> = Pick<P, Exclude<keyof P, keyof ContextProp>>

const withComponentContext = <Props extends ContextProp>(Component: React.ComponentClass<Props>) => (
    class WithComponentContext extends React.PureComponent<ExcludeContextProp<Props>> {
        public render() {
            return React.createElement(ComponentContextProvider.Consumer, {
                children: (context: ComponentContext) => {
                    return React.createElement(Component as React.ComponentClass<Props>, {
                        ...(this.props as object),
                        ...{
                            context: {
                                executeOperation: context.executeOperation,
                                getStore: context.getStore,
                            }
                        } as any,
                    })
                }
            })
        }
    }
)

export { withComponentContext as default }
