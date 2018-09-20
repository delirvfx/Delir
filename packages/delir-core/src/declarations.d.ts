declare module 'bezier-easing' {
    const _: any
    export = _
}

declare module 'electron-canvas-to-buffer' {
    const _: (canvas: HTMLCanvasElement, mimeType?: string, quality?: number) => Buffer
    export default _
}

declare module 'audiobuffer-to-wav' {
    interface AudioBufferLike {
        sampleRate: number
        numberOfChannels: number
        getChannelData: (channel: number) => Float32Array
    }

    const _: (buffer: AudioBufferLike, opts: {float32: boolean}) => ArrayBuffer
    export = _
}

declare module 'arraybuffer-to-buffer' {
    const _: (ab: ArrayBuffer) => Buffer
    export = _
}

declare module 'keymirror' {
    const _: (obj: {}) => { [key: string]: string }
    export default _
}

declare module 'node-timecodes' {
    interface TimeCodeOptions {
        frameRate?: number,
        ms?: boolean,
    }
    export function toSeconds(timecode: string): number
    export function fromSeconds(seconds: number, option?: TimeCodeOptions): string
}

declare module 'av/node' {
    const _: any
    export = _
}

declare module 'av' {
    export class Asset extends NodeJS.EventEmitter {
        public static fromBuffer(buffer: Buffer): Asset

        public format: { channelsPerFrame: number }
        public decodeToBuffer(listener: (decoded: Float32Array) => void): void
    }
}

declare module 'font-manager' {
    const getAvailableFontsSync: () => {
        family: string
    }[]

    export {getAvailableFontsSync}
}

declare module 'p5' {
    const _: any
    export = _
}

// declare module 'fs-extra' {
//     const _: any
//     export default _
// }

declare namespace NodeJS {
    export interface Global {
        // Define for electron's `global.require`
        require: NodeRequire
    }
}

declare interface OffscreenCanvas extends HTMLCanvasElement {}
