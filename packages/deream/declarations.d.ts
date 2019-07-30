declare module 'audiobuffer-to-wav' {
  interface AudioBufferLike {
    sampleRate: number
    numberOfChannels: number
    getChannelData: (channel: number) => Float32Array
  }

  const _: (buffer: AudioBufferLike, opts: { float32: boolean }) => ArrayBuffer
  export = _
}

declare module 'arraybuffer-to-buffer' {
  const _: (ab: ArrayBuffer) => Buffer
  export = _
}
