/**
 * Component maps Entity and Renderer instances,
 * and propagation lifecycles to child Component.
 */
export interface Component<T> {
    id: string

    didActivate(): Promise<void>
    didDeactivate(): Promise<void>
}
