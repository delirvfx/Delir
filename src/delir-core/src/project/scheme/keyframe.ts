export interface KeyframeConfigScheme {
    value: any
    easeInParam: [number, number]
    easeOutParam: [number, number]
}

export interface KeyframeScheme {
    id: string|null
    config: KeyframeConfigScheme
}
