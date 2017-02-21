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

// Delir frontend deps
declare const __DEV__: boolean

declare module '*.styl' {
    const _ : {[className: string]: string}
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
    export default function keyMirror<K>(keys: K): {[P in keyof K]: P}
}

declare module 'parse-color' {
    export default function parseColor(colorCode: string): {
        rgb: [number, number, number],
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

// Delir exposed variables
declare interface Window {
    app: {
        stores: {[storeName: string]: any}
    }
}

declare var app: {
    stores: {[storeName: string]: any}
}