export interface KeyframeConfigScheme {
    value: any
    frameOnLayer: number|null
    easeInParam: [number, number]
    easeOutParam: [number, number]
}

export interface KeyframeScheme {
    id: string|null
    config: KeyframeConfigScheme
}
