import { neverCheck } from '../../helper/neverCheck'

interface Uniform {
    type:
        | '1i' | '2i' | '3i' | '4i'
        | '1ui' | '2ui' | '3ui' | '4ui'
        | '1f' | '2f' | '3f' | '4f'
        | '1iv' | '2iv' | '3iv' | '4iv'
        | '1fv' | '2fv' | '3fv' | '4fv'
        | '1uiv' | '2uiv' | '3uiv' | '4uiv'
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

const DEFAULT_VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 coord;
varying vec2 vTexCoord;

void main(void) {
    vTexCoord = coord;
    gl_Position = vec4(position, 0.0, 1.0);
}
`

export default class WebGLContext {
    private glCanvas: HTMLCanvasElement
    private gl: WebGL2RenderingContext
    private texBufferCanvas: HTMLCanvasElement

    public constructor(
        private width: number,
        private height: number
    ) {
        this.glCanvas = new (global as any).OffscreenCanvas(width, height) as HTMLCanvasElement
        this.gl = this.glCanvas.getContext('webgl2')!
        this.gl.viewport(0, 0, width, height)

        // texImage2D not support for OffscreenCanvas so using HTMLCanvasElement
        this.texBufferCanvas = Object.assign(document.createElement('canvas'), {width, height})
    }

    public getProgram(fragmentShaderSource: string, vertexShaderSource: string = DEFAULT_VERTEX_SHADER): WebGLProgram {
        const program = this.gl.createProgram()!

        const vertShader = this.gl.createShader(this.gl.VERTEX_SHADER)
        this.gl.shaderSource(vertShader, vertexShaderSource)
        this.gl.compileShader(vertShader)

        const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
        this.gl.shaderSource(fragShader, fragmentShaderSource)
        this.gl.compileShader(fragShader)

        this.gl.attachShader(program, vertShader)
        this.gl.attachShader(program, fragShader)
        this.gl.linkProgram(program)

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program)
            throw new Error(`Failed to compile shader: ${error}`)
        }

        return program
    }

    public applyProgram(program: WebGLProgram, uniforms: { [uniformName: string]: Uniform }, source: HTMLCanvasElement, dest: HTMLCanvasElement) {
        const { gl, texBufferCanvas } = this

        gl.useProgram(program)

        const texBufferCtx = texBufferCanvas.getContext('2d')!
        const texSize = texBufferCanvas.width = texBufferCanvas.height = 2 ** Math.ceil(Math.log2(Math.max(this.width, this.height)))
        texBufferCtx.clearRect(0, 0, texSize, texSize)
        texBufferCtx.drawImage(source, 0, 0, texSize, texSize)

        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1, 1, -1, 1, 1, -1, 1　]), gl.STATIC_DRAW)
        const positionAttrib = gl.getAttribLocation(program, 'position')
        gl.enableVertexAttribArray(positionAttrib)
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0)

        const tex2DBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, tex2DBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ 0, 1, 1, 1, 1, 0, 0, 0 ]), gl.STATIC_DRAW)
        const coordAttrib = gl.getAttribLocation(program, 'coord')
        gl.enableVertexAttribArray(coordAttrib)
        gl.vertexAttribPointer(coordAttrib, 2, gl.FLOAT, false, 0, 0)

        const tex = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texBufferCanvas)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        // Attach source uniform
        const sourceLoc = gl.getUniformLocation(program, 'source')
        gl.uniform1i(sourceLoc, 0)

        // Attach uniforms
        this.attachUniforms(gl, program, uniforms)

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        gl.flush()

        dest.getContext('2d')!.drawImage(this.glCanvas, 0, 0, source.width, source.height)
    }

    // Uniforms
    public uni1i(...value: [number]): Uniform {
        return { type: '1ui', value }
    }

    public uni2i(...value: [number, number]): Uniform {
        return { type: '2ui', value }
    }

    public uni3i(...value: [number, number, number]): Uniform {
        return { type: '3ui', value }
    }

    public uni4i(...value: [number, number, number, number]): Uniform {
        return { type: '4ui', value }
    }

    public uni1ui(...value: [number]): Uniform {
        return { type: '1ui', value }
    }

    public uni2ui(...value: [number, number]): Uniform {
        return { type: '2ui', value }
    }

    public uni3ui(...value: [number, number, number]): Uniform {
        return { type: '3ui', value }
    }

    public uni4ui(...value: [number, number, number, number]): Uniform {
        return { type: '4ui', value }
    }

    public uni1f(...value: [number]): Uniform {
        return { type: '1f', value }
    }

    public uni2f(...value: [number, number]): Uniform {
        return { type: '2f', value }
    }

    public uni3f(...value: [number, number, number]): Uniform {
        return { type: '3f', value }
    }

    public uni4f(...value: [number, number, number, number]): Uniform {
        return { type: '4f', value }
    }

    public uni1iv(value: number[]): Uniform {
        return { type: '1iv', value }
    }

    public uni2iv(value: number[]): Uniform {
        return { type: '2iv', value }
    }

    public uni3iv(value: number[]): Uniform {
        return { type: '3iv', value }
    }

    public uni4iv(value: number[]): Uniform {
        return { type: '4iv', value }
    }

    public uni1fv(value: number[]): Uniform {
        return { type: '1fv', value }
    }

    public uni2fv(value: number[]): Uniform {
        return { type: '2fv', value }
    }

    public uni3fv(value: number[]): Uniform {
        return { type: '3fv', value }
    }

    public uni4fv(value: number[]): Uniform {
        return { type: '4fv', value }
    }

    public uni1uiv(value: number[]): Uniform {
        return { type: '1uiv', value }
    }

    public uni2uiv(value: number[]): Uniform {
        return { type: '2uiv', value }
    }

    public uni3uiv(value: number[]): Uniform {
        return { type: '3uiv', value }
    }

    public uni4uiv(value: number[]): Uniform {
        return { type: '4uiv', value }
    }

    public uniMatrix2fv(value: number[]): Uniform {
        return { type: 'matrix2fv', value }
    }

    public uniMatrix3x2fv(value: number[]): Uniform {
        return { type: 'matrix3x2fv', value }
    }

    public uniMatrix4x2fv(value: number[]): Uniform {
        return { type: 'matrix4x2fv', value }
    }

    public uniMatrix2x3fv(value: number[]): Uniform {
        return { type: 'matrix2x3fv', value }
    }

    public uniMatrix3fv(value: number[]): Uniform {
        return { type: 'matrix3fv', value }
    }

    public uniMatrix4x3fv(value: number[]): Uniform {
        return { type: 'matrix4x3fv', value }
    }

    public uniMatrix2x4fv(value: number[]): Uniform {
        return { type: 'matrix2x4fv', value }
    }

    public uniMatrix3x4fv(value: number[]): Uniform {
        return { type: 'matrix3x4fv', value }
    }

    public uniMatrix4fv(value: number[]): Uniform {
        return { type: 'matrix4fv', value }
    }

    private attachUniforms(gl: WebGL2RenderingContext, program: WebGLProgram, uniforms: {[uniform: string]: Uniform}) {
        for (const uni of Object.keys(uniforms)) {
            const loc = gl.getUniformLocation(program, uni)
            const { type, value } = uniforms[uni]

            switch (type) {
                case '1i': {
                    gl.uniform1i(loc, value[0])
                }
                case '2i': {
                    gl.uniform2i(loc, value[0], value[1])
                }
                case '3i': {
                    gl.uniform3i(loc, value[0], value[1], value[2])
                }
                case '4i': {
                    gl.uniform4i(loc, value[0], value[1], value[2], value[3])
                }
                case '1ui': {
                    gl.uniform1ui(loc, value[0]); break
                }
                case '2ui': {
                    gl.uniform2ui(loc, value[0], value[1]); break
                }
                case '3ui': {
                    gl.uniform3ui(loc, value[0], value[1], value[2]); break
                }
                case '4ui': {
                    gl.uniform4ui(loc, value[0], value[1], value[2], value[3]); break
                }
                case '1f': {
                    gl.uniform1f(loc, value[0]); break
                }
                case '2f': {
                    gl.uniform2f(loc, value[0], value[1]); break
                }
                case '3f': {
                    gl.uniform3f(loc, value[0], value[1], value[2]); break
                }
                case '4f': {
                    gl.uniform4f(loc, value[0], value[1], value[2], value[3]); break
                }
                case '1iv': {
                    gl.uniform1iv(loc, value); break
                }
                case '2iv': {
                    gl.uniform2iv(loc, value); break
                }
                case '3iv': {
                    gl.uniform3iv(loc, value); break
                }
                case '4iv': {
                    gl.uniform4iv(loc, value); break
                }
                case '1fv': {
                    gl.uniform1fv(loc, value); break
                }
                case '2fv': {
                    gl.uniform2fv(loc, value); break
                }
                case '3fv': {
                    gl.uniform3fv(loc, value); break
                }
                case '4fv': {
                    gl.uniform4fv(loc, value); break
                }
                case '1uiv': {
                    gl.uniform1uiv(loc, value); break
                }
                case '2uiv': {
                    gl.uniform2uiv(loc, value); break
                }
                case '3uiv': {
                    gl.uniform3uiv(loc, value); break
                }
                case '4uiv': {
                    gl.uniform4uiv(loc, value); break
                }
                case 'matrix2fv': {
                    gl.uniformMatrix2fv(loc, false, value); break
                }
                case 'matrix3x2fv': {
                    gl.uniformMatrix3x2fv(loc, false, value); break
                }
                case 'matrix4x2fv': {
                    gl.uniformMatrix4x2fv(loc, false, value); break
                }
                case 'matrix2x3fv': {
                    gl.uniformMatrix2x3fv(loc, false, value); break
                }
                case 'matrix3fv': {
                    gl.uniformMatrix3fv(loc, false, value); break
                }
                case 'matrix4x3fv': {
                    gl.uniformMatrix4x3fv(loc, false, value); break
                }
                case 'matrix2x4fv': {
                    gl.uniformMatrix2x4fv(loc, false, value); break
                }
                case 'matrix3x4fv': {
                    gl.uniformMatrix3x4fv(loc, false, value); break
                }
                case 'matrix4fv': {
                    gl.uniformMatrix4fv(loc, false, value); break
                }
                default: {
                    neverCheck(type)
                }
            }
        }
    }

}
