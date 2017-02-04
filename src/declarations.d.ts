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


declare interface Window {
    app: {
        stores: {[storeName: string]: any}
    }
}

declare var app: {
    stores: {[storeName: string]: any}
}