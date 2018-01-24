declare module 'prop-types' {
    const _: any
    export default _
}

declare module 'bezier-easing' {
    const _: any
    export default _
}

declare module 'fs-promise' {
    export * from 'mz/fs'
}

declare module 'electron-canvas-to-buffer' {
    const _: (canvas: HTMLCanvasElement, mimeType: string) => Buffer
    export default _
}

declare module 'audiobuffer-to-wav' {
    interface AudioBufferLike {
        sampleRate: number
        numberOfChannels: number
        getChannelData: (channel: number) => Float32Array
    }

    const _: (buffer: AudioBufferLike, opts: {float32: boolean}) => ArrayBuffer
    export default _
}

declare module 'arraybuffer-to-buffer' {
    const _: (ab: ArrayBuffer) => Buffer
    export default _
}

declare module 'keymirror' {
    const _: (obj: {}) => { [key: string]: string }
    export default _
}

declare module 'node-timecodes' {
    type TimeCodeOptions = {
        frameRate?: number,
        ms?: boolean,
    }
    export function toSeconds(timecode: string): number
    export function fromSeconds(seconds: number, option?: TimeCodeOptions): string
}

declare namespace NodeJS {
    export interface Global {
        // Define for electron's `global.require`
        require: NodeRequire
    }
}

// processing-js
declare namespace ProcessingJS {
    export class Sketch {
        constructor(proc?: SketchProc)

        use3DContext: boolean
        imageCache: ImageCache
        attachFunction: SketchProc|null
        sourceCode: string
        onExit(): void
        onFrameEnd(): void
        onFrameStart(): void
        onLoad(): void
        onLoop(): void
        onPause(): void
        onSetup(): void
        options: {
            isTransparent: boolean,
            globalKeyEvents: boolean,
            pauseOnBlur: boolean,
        }
        params: any
    }

    export interface SketchProc {
        (processing: Processing): void
    }

    // export interface processing {
    //     setup: () => void
    //     draw: () => void

    //     size(width: number, height: number, mode: any): void
    //     loadImage(file: string): void
    //     textureMode(mode: any): void
    // }

    export class ImageCache {
        add(path: string): void
    }

    export interface ProcessingExternals {
        sketch: Sketch
    }

    export class Processing {
        static Sketch: typeof Sketch

        static compile(pde: string): Sketch
        static getInstanceById(id: string): Processing
        static instances: Processing[]

        externals: ProcessingExternals
        frameCount: number
        width: number
        height: number
        focused: boolean

        constructor(canvas: HTMLCanvasElement, proc: Sketch | SketchProc)
        loop(): void
        draw(): void
        redraw():void
        noLoop(): void
        exit(): void

        size(width: number, height: number): void
        background(color: number): void
        background(color: number, alpha: number): void

        loadImage(path: string, extension?: string, callback?: () => void): void
    }
}

declare module 'processing-js' {
    const _: {}
    export = _
}

declare const Processing: typeof ProcessingJS.Processing


