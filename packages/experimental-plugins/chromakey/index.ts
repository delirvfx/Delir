import {
    EffectPreRenderContext,
    EffectRenderContext,
    PluginSupport,
    PostEffectBase,
    Type,
    Values,
} from '@ragg/delir-core'

import * as clamp from 'lodash/clamp'

interface Params {
    threshold: number
    keyColor: Values.ColorRGBA
}

export default class ChromakeyPostEffect extends PostEffectBase {
    /**
     * Provide usable parameters
     */
    public static provideParameters() {
        return Type.float('threshold', { label: 'Threshold', defaultValue: 1, animatable: true }).colorRgba(
            'keyColor',
            { label: 'Key color', defaultValue: new Values.ColorRGBA(0, 0, 0, 1), animatable: true },
        )
    }

    private static VERTEX_SHADER: string = require('./vertex.vert')
    private static FRAGMENT_SHADER: string = require('./fragment.frag')

    private ctxBindToken: PluginSupport.WebGLContextBindToken
    private gl: WebGL2RenderingContext
    private texCanvas: HTMLCanvasElement
    private texCanvasCtx: CanvasRenderingContext2D
    private fragShader: WebGLShader
    private vertShader: WebGLShader
    private program: WebGLProgram
    private vertexBuffer: WebGLBuffer
    private tex2DBuffer: WebGLBuffer
    private tex: WebGLTexture
    private attribs: Partial<{
        position: number
        coord: number
    }> = {}
    private uni: Partial<{
        texture0: WebGLUniformLocation
        keyColor: WebGLUniformLocation
        threshold: WebGLUniformLocation
    }> = {}

    /**
     * Called when before rendering start.
     *
     * If you want initializing before rendering (likes load audio, image, etc...)
     * Do it in this method.
     */
    public async initialize(req: EffectPreRenderContext<Params>) {
        this.ctxBindToken = req.glContextPool.generateContextBindToken()
        const gl = await req.glContextPool.getContext('webgl')
        const canvas = gl.canvas

        this.gl.cl

        this.texCanvas = document.createElement('canvas')
        this.texCanvasCtx = this.texCanvas.getContext('2d')

        const program = (this.program = gl.createProgram())
        gl.enable(gl.DEPTH_TEST)

        const vertexShader = (this.vertShader = gl.createShader(gl.VERTEX_SHADER))
        gl.shaderSource(vertexShader, ChromakeyPostEffect.VERTEX_SHADER)
        gl.compileShader(vertexShader)

        const fragShader = (this.fragShader = gl.createShader(gl.FRAGMENT_SHADER))
        gl.shaderSource(fragShader, ChromakeyPostEffect.FRAGMENT_SHADER)
        gl.compileShader(fragShader)

        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragShader)
        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program)
            throw new Error(`[@ragg/delir-posteffect-chromakey] Failed to compile shader. (${error})`)
        }

        this.tex = gl.createTexture()

        // get uniform locations
        this.uni.texture0 = gl.getUniformLocation(this.program, 'texture0')
        this.uni.keyColor = gl.getUniformLocation(this.program, 'keyColor')
        this.uni.threshold = gl.getUniformLocation(this.program, 'threshold')

        // get attributes locations
        this.attribs.position = gl.getAttribLocation(this.program, 'position')
        this.attribs.coord = gl.getAttribLocation(this.program, 'coord')

        // vertex buffer
        this.vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW)

        // Tex 2D
        this.tex2DBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tex2DBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), gl.STATIC_DRAW)

        req.glContextPool.registerContextForToken(this.ctxBindToken, gl)
        req.glContextPool.releaseContext(gl)
    }

    /**
     * Render frame into destination canvas.
     * @param req
     */
    public async render(req: EffectRenderContext<Params>) {
        const {
            srcCanvas,
            destCanvas,
            parameters: { threshold, keyColor },
        } = req
        const destCtx = destCanvas.getContext('2d')

        const gl = await req.glContextPool.getContextByToken(this.ctxBindToken)
        const canvas = gl.canvas
        // console.log(gl === this.glContext)

        // Copy source to texture
        const textureCanvas = this.texCanvas
        const texCanvasCtx = this.texCanvasCtx
        textureCanvas.width = textureCanvas.height = 2 ** Math.ceil(Math.log2(Math.max(req.width, req.height)))
        texCanvasCtx.clearRect(0, 0, textureCanvas.width, textureCanvas.height)
        texCanvasCtx.drawImage(srcCanvas, 0, 0, textureCanvas.width, textureCanvas.width)

        gl.useProgram(this.program)

        // Resize viewport
        canvas.width = req.width
        canvas.height = req.height
        gl.viewport(0, 0, req.width, req.height)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
        gl.enableVertexAttribArray(this.attribs.position)
        gl.vertexAttribPointer(this.attribs.position, 2, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tex2DBuffer)
        gl.enableVertexAttribArray(this.attribs.coord)
        gl.vertexAttribPointer(this.attribs.coord, 2, gl.FLOAT, false, 0, 0)

        // Update texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        // gl.generateMipmap(gl.TEXTURE_2D)

        // Attach variables
        gl.uniform1i(this.uni.texture0, 0)
        gl.uniform3f(this.uni.keyColor, keyColor.r / 255, keyColor.g / 255, keyColor.b / 255)
        gl.uniform1f(this.uni.threshold, clamp(threshold, 0, 100) / 100)

        // Render
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        gl.flush()

        destCtx.clearRect(0, 0, req.width, req.height)
        destCtx.drawImage(canvas, 0, 0)
        req.glContextPool.releaseContext(gl)
    }
}
