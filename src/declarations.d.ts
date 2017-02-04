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

// Delir frontend deps
declare module 'devtron' {
    export function install(): void
}

declare module 'electron-devtools-installer' {
    type Extensions = 'REACT_DEVELOPER_TOOLS'
    export const REACT_DEVELOPER_TOOLS = 'REACT_DEVELOPER_TOOLS'
    export default function installExtension(extension: Extensions): Promise<void>
}

declare module 'parse-color' {
    export default function parseColor(colorCode: string): {
        rgb: [number, number, number],
    }
}

declare interface Window {
    app: {
        stores: {[storeName: string]: any}
    }
}

declare var app: {
    stores: {[storeName: string]: any}
}