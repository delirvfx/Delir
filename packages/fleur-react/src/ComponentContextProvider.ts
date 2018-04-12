import * as React from 'react'

import { ComponentContext } from '@ragg/fleur'

const ComponentContextProvider: {
    Provider: React.ComponentClass<{value: ComponentContext}>,
    Consumer: React.ComponentClass<{children: (context: ComponentContext) => React.ReactNode}>,
} = (React as any).createContext()

export { ComponentContextProvider as default }
