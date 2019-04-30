interface Uniform {
    type:
        | '1i'
        | '2i'
        | '3i'
        | '4i'
        | '1ui'
        | '2ui'
        | '3ui'
        | '4ui'
        | '1f'
        | '2f'
        | '3f'
        | '4f'
        | '1iv'
        | '2iv'
        | '3iv'
        | '4iv'
        | '1fv'
        | '2fv'
        | '3fv'
        | '4fv'
        | '1uiv'
        | '2uiv'
        | '3uiv'
        | '4uiv'
        | 'matrix2fv'
        | 'matrix3x2fv'
        | 'matrix4x2fv'
        | 'matrix2x3fv'
        | 'matrix3fv'
        | 'matrix4x3fv'
        | 'matrix2x4fv'
        | 'matrix3x4fv'
        | 'matrix4fv'
    value: ArrayLike<number>
}
export default class WebGLContext {
    private width
    private height
    private glCanvas
    private gl
    private texBufferCanvas
    private vertexBuffer
    private tex2DBuffer
    private attachUniforms
    constructor(width: number, height: number)
    public getProgram(fragmentShaderSource: string, vertexShaderSource?: string): WebGLProgram
    public applyProgram(
        program: WebGLProgram,
        uniforms: {
            [uniformName: string]: Uniform
        },
        source: HTMLCanvasElement,
        dest: HTMLCanvasElement,
    ): void
    public uni1i(...value: [number]): Uniform
    public uni2i(...value: [number, number]): Uniform
    public uni3i(...value: [number, number, number]): Uniform
    public uni4i(...value: [number, number, number, number]): Uniform
    public uni1ui(...value: [number]): Uniform
    public uni2ui(...value: [number, number]): Uniform
    public uni3ui(...value: [number, number, number]): Uniform
    public uni4ui(...value: [number, number, number, number]): Uniform
    public uni1f(...value: [number]): Uniform
    public uni2f(...value: [number, number]): Uniform
    public uni3f(...value: [number, number, number]): Uniform
    public uni4f(...value: [number, number, number, number]): Uniform
    public uni1iv(value: number[]): Uniform
    public uni2iv(value: number[]): Uniform
    public uni3iv(value: number[]): Uniform
    public uni4iv(value: number[]): Uniform
    public uni1fv(value: number[]): Uniform
    public uni2fv(value: number[]): Uniform
    public uni3fv(value: number[]): Uniform
    public uni4fv(value: number[]): Uniform
    public uni1uiv(value: number[]): Uniform
    public uni2uiv(value: number[]): Uniform
    public uni3uiv(value: number[]): Uniform
    public uni4uiv(value: number[]): Uniform
    public uniMatrix2fv(value: number[]): Uniform
    public uniMatrix3x2fv(value: number[]): Uniform
    public uniMatrix4x2fv(value: number[]): Uniform
    public uniMatrix2x3fv(value: number[]): Uniform
    public uniMatrix3fv(value: number[]): Uniform
    public uniMatrix4x3fv(value: number[]): Uniform
    public uniMatrix2x4fv(value: number[]): Uniform
    public uniMatrix3x4fv(value: number[]): Uniform
    public uniMatrix4fv(value: number[]): Uniform
}
export {}
