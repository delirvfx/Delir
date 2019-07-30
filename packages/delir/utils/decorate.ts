import React from 'react'

interface Decorator {
    (component: React.ComponentType): React.ComponentType
}

export const decorate = <T>(decorators: Decorator[], decoratee: React.ComponentType): React.ComponentType<T> => {
    return decorators.reduce((decorated, decorator) => {
        return decorator(decorated)
    }, decoratee) as React.ComponentType<T>
}
