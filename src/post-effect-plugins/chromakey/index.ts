import {
    PostEffectBase,
    PreRenderRequest,
    RenderRequest,
    Values,
    Type
} from 'delir-core'

interface Params {
    keyColor: Values.ColorRGBA
}

const help = {
    compileVertexShader: (gl: WebGL2RenderingContext, source: string) => {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(vertexShader, source)
        gl.compileShader(vertexShader)
        console.log(gl.getShaderInfoLog(vertexShader))
        return vertexShader
    },
    compileFragmentShader: (gl: WebGL2RenderingContext, source: string) => {
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(fragShader, source)
        gl.compileShader(fragShader)
        console.log(gl.getShaderInfoLog(fragShader))
        return fragShader
    },
    createVBO: (gl: WebGL2RenderingContext, data: number[]) => {
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        return vbo
    },
    createIBO: (gl: WebGL2RenderingContext, data: number[]) => {
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        return vbo
    },
}

export default class ChromakeyPostEffect extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        return Type
            .colorRgba('keyColor', {label: 'Key color', defaultValue: new Values.ColorRGBA(0, 0, 0, 1), animatable: true})
    }

    private static VERTEX_SHADER: string = require('./vertex.vert')
    private static FRAGMENT_SHADER: string = require('./fragment.frag')
    // private static FRAGMENT_SHADER_PAINT: string = require('./paint.frag')

    private glCanvas: HTMLCanvasElement
    private glContext: WebGL2RenderingContext
    private fragShader: WebGLShader
    private vertShader: WebGLShader
    private program: WebGLProgram
    private vbo: WebGLBuffer
    private ibo: WebGLBuffer

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(req: PreRenderRequest) {
        const canvas = this.glCanvas = document.createElement('canvas')
        const gl = this.glContext = canvas.getContext('webgl2')

        const program = this.program = gl.createProgram()
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.TEXTURING)
        gl.enable(gl.TEXTURE_2D)

        const vertexShader = this.vertShader = help.compileVertexShader(gl, ChromakeyPostEffect.VERTEX_SHADER)
        const fragShader = this.fragShader = help.compileFragmentShader(gl, ChromakeyPostEffect.FRAGMENT_SHADER)

        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragShader)
        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program))
            throw new Error('Fail.')
        }

        gl.useProgram(program)

        // 板ポリの頂点データを定義して VBO を生成する
        const vbo = this.vbo = help.createVBO(gl, [
            -1, 1, 0,
            -1, -1, 0,
            1, 1, 0,
            1, -1, 0
        ])

        // attribute Location を取得する
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        const positonAttr = gl.getAttribLocation(program, 'position')
        gl.enableVertexAttribArray(positonAttr)
        gl.vertexAttribPointer(positonAttr, 3, gl.FLOAT, false, 0, 0)

        const coordAttr = gl.getAttribLocation(program, 'coord')
        gl.enableVertexAttribArray(coordAttr)
        gl.vertexAttribPointer(coordAttr, 2, gl.FLOAT, false, 0, 0)

        // 背景を初期化する色（RGBA を 0.0 から 1.0 の範囲で指定）
        gl.clearColor(0, 0, 0, 0)
    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    public async render(req: RenderRequest<Params>)
    {
        const { destCanvas, parameters: {keyColor} } = req
        const destCtx = destCanvas.getContext('2d')

        const canvas = this.glCanvas
        const gl = this.glContext

        // Copy source to texture
        const textureCanvas = document.createElement('canvas')
        textureCanvas.width = textureCanvas.height = 2 ** (Math.round(Math.log2(Math.max(destCanvas.width, destCanvas.height))) + 1)
        textureCanvas.getContext('2d')!.drawImage(destCanvas, 0, 0)

        canvas.width = req.width
        canvas.height = req.height
        gl.viewport(0, 0, req.width, req.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        const tex = gl.createTexture()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas)
        gl.generateMipmap(gl.TEXTURE_2D)

        gl.uniform1i(gl.getUniformLocation(this.program, 'texture0'), 0)
        gl.uniform3f(gl.getUniformLocation(this.program, 'keyColor'), keyColor.r / 255, keyColor.g / 255, keyColor.b / 255)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        gl.flush()

        destCtx.clearRect(0, 0, req.width, req.height)
        destCtx.drawImage(canvas, 0, 0)

        // const dest = req.destCanvas
        // const context = dest.getContext('2d')
        // const params = req.parameters as Params

        // context.fillStyle = params.color.toString()
        // context.fillRect(params.x, params.y, params.width, params.height)
    }
}
