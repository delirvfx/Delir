declare module 'av' {
    class Asset extends NodeJS.EventEmitter {
        static fromBuffer(buffer: Buffer): Asset

        format: {
            channelsPerFrame: number
        }
        decodeToBuffer(listener: (decoded: Float32Array) => void): void
    }

    export default {
        Asset,
    }
}

declare module 'font-manager' {
    const getAvailableFontsSync: () => {
        family: string
    }[]

    export {getAvailableFontsSync}
}

declare module 'tooloud' {
    const _ :any
    export default _
}

// newer or exclusive API declarations
declare interface PointerEvent {
    path: EventTarget[]
}

declare interface Window {
    requestIdleCallback: (
        callback: (e: {timeRemaining: number, didTimeout: boolean}) => void,
        options?: {timeout: number}
    ) => void
}

// Typing helpers
declare type Optionalized<T> = {[P in keyof T]?: T[P]}

// Delir frontend deps
declare const __DEV__: boolean

declare module '*.styl' {
    const _ : {[className: string]: string}
    export = _
}

declare module '*.json' {
    const _ : {[key: string]: any}
    export = _
}

declare module 'devtron' {
    export function install(): void
}

declare module 'electron-devtools-installer' {
    type Extensions = 'REACT_DEVELOPER_TOOLS'
    export const REACT_DEVELOPER_TOOLS = 'REACT_DEVELOPER_TOOLS'
    export default function installExtension(extension: Extensions): Promise<void>
}

declare module 'keymirror' {
    function keyMirror<K extends Object>(keys: K): {[P in keyof K]: P}
    export = keyMirror
}

declare module 'parse-color' {
    export default function parseColor(colorCode: string): {
        /** RGB values */
        rgb: [number, number, number],
        /** RGBA values */
        rgba: [number, number, number, number],
        /** CSS color keyword */
        keyword: string,
        /** HEX color code */
        hex: string,
    }
}

declare module 'form-serialize' {
    interface SerializeOption {
        /** if true, the hash serializer will be used for serializer option */
        hash?: boolean
        /** override the default serializer (hash or url-encoding) */
        serializer?: Function
        /** if true, disabled fields will also be serialized */
        disabled?: boolean
        /** if true, empty fields will also be serialized */
        empty?: boolean
    }

    export default function serialize(form: HTMLFormElement, options?: SerializeOption): {[name: string]: string|string[]}|string
    export default function serialize(form: HTMLFormElement, options?: SerializeOption & {hash:true}): {[name: string]: string|string[]}
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


// Delir exposed variables
declare interface DelirApp {
    stores: {[storeName: string]: any}
}

declare interface Window {
    app: DelirApp
}
