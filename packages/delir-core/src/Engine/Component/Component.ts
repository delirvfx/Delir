/**
 * Component maps Entity and Renderer instances,
 * and propagation lifecycles to child Component.
 */
export interface Component<T> {
    id: string

    activate(): Promise<void>
    deactivate(): Promise<void>
}
