import {EffectPluginBase, Type, RenderRequest} from 'delir-core'

export default class GaussianBlur extends EffectPluginBase {
    public static provideParamaters() {
        return Type
            .number('weight', {label: 'Weight', defaultValue: 10})
    }

    // private static VERTEX_SHADER = `
    //     attribute vec3 aVertexPosition;

    //     uniform mat4 uMVMatrix;
    //     uniform mat4 uPMatrix;

    //     void main(void) {
    //         gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    //     }
    // `

    // private static FRAGMENT_SHADER = `
    //     precision mediump float;

    //     // uniform sampler2D texture;

    //     varying vec4 vColor;
    //     varying vec2 vTextureCoord;

    //     void main() {
    //         // vec4 texel = texture2D(texture, vTextureCoord);
    //         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); //texel
    //     }
    // `

    private gl: WebGLRenderingContext


    private compileShader(gl: WebGLRenderingContext, source: string, type: number) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(shader)
            return shader
        }
    }

    public async beforeRender()
    {
        // const shader = this.compileShader(GaussianBlur.FRAGMENT_SHADER, gl.FRAGMENT_SHADER)
    }

    public async render(req: RenderRequest)
    {
        // const canvas = document.createElement('canvas')!
        // canvas.width = req.width
        // canvas.height = req.height

        // const gl = canvas.getContext('webgl')

        // gl.clearColor(0, 0, 0, 0)
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // const renderBuffer = gl.createRenderbuffer()
        // gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer)

        // const vertexShader = this.compileShader(gl, GaussianBlur.VERTEX_SHADER, gl.VERTEX_SHADER)
        // const fragmentShader = this.compileShader(gl, GaussianBlur.FRAGMENT_SHADER, gl.FRAGMENT_SHADER)

        // const program = gl.createProgram()
        // gl.attachShader(program, vertexShader)
        // gl.attachShader(program, fragmentShader)
        // gl.linkProgram(program)

        // if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        //     gl.useProgram(program)
        // } else {
        //     console.warn(gl.getProgramInfoLog(program))
        // }


        // // Create VBO
        // const vertices = [
        //     1.0,  1.0,  0.0,
        //     -1.0, 1.0,  0.0,
        //     1.0,  -1.0, 0.0,
        //     -1.0, -1.0, 0.0
        // ]

        // const squareVerticesBuffer = gl.createBuffer()
        // gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
        // gl.bindBuffer(gl.ARRAY_BUFFER, null)

        // const vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
        // gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer)
        // gl.enableVertexAttribArray(vertexPositionAttribute)
        // gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVerticesBuffer)
        // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
        // gl.flush()

        // const bufferTexture = gl.createTexture(gl.TEXTURE0)
        // gl.activeTexture(gl.TEXTURE0)
        // gl.bindTexture(gl.TEXTURE0, bufferTexture)

        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, req.destCanvas)


        // gl.bindTexture(gl.TEXTURE_2D, bufferTexture)
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, req.width, req.height, req.destCanvas)

        // req.destCanvas.getContext('2d').drawImage(canvas, 0, 0)
        // console.log('どん')

        const ctx = req.destCanvas.getContext('2d')
        const pixels = ctx.getImageData(0, 0, req.width, req.height)

        for (let idx = 0; idx < pixels.data.length; idx += 4) {
            const [r, g, b] = pixels.data.slice(idx, idx + 3)
            const color = Math.floor(r + g + b / (255 * 3))
            pixels.data[idx + 0] = color
            pixels.data[idx + 1] = color
            pixels.data[idx + 2] = color
        }

        ctx.putImageData(pixels, 0, 0)
    }
}
