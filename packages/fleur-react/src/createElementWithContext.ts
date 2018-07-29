import { AppContext } from '@ragg/fleur'
import * as React from 'react'

import ComponentContextProvider from './ComponentContextProvider'

const createElementWithContext = <P>(context: AppContext<any>, Component: React.ComponentClass<P>, props?: P) => (
    React.createElement(ComponentContextProvider.Provider, {
        value: context.componentContext
    }, React.createElement(Component, (props || {} as any)))
)

export { createElementWithContext }
