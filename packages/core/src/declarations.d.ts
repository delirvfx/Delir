declare module 'bezier-easing' {
  const _: any
  export = _
}

declare module 'electron-canvas-to-buffer' {
  const _: (canvas: HTMLCanvasElement, mimeType?: string, quality?: number) => Buffer
  export default _
}

declare module 'joi-browser' {
  import * as joi from 'joi'
  export = joi
}

declare module 'node-timecodes' {
  interface TimeCodeOptions {
    frameRate?: number
    ms?: boolean
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

declare module 'fontmanager-redux' {
  const getAvailableFontsSync: () => {
    family: string
  }[]

  export { getAvailableFontsSync }
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
