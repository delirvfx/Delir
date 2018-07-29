declare module 'prop-types' {
    const _: any
    export default _
}

declare module 'bezier-easing' {
    const _: any
    export default _
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
    interface TimeCodeOptions {
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
