import * as React from 'react'
import Fleur from './Fleur'

const context = Symbol('FleurComponentContext')

const ComponentContext: {
    Provider: React.ComponentClass<{value: any}>
    Consumer: React.ComponentClass<{children: (context: any) => React.ReactNode}>
} = (React as any).createContext(context)

export { ComponentContext }

export default class ComponentContextInstance {
    constructor(private fleurContext: Fleur) {}

    public executeAction(action: ()): void
}
