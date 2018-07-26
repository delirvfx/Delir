import ClipScopeFrameContext from './ClipScopeFrameContext'

class RendererContext<P extends object = {}> {
    constructor(
        private clipScope: ClipScopeFrameContext,
        private glContext: WebGLRenderingContext
        props: any // TODO: Parameter Structure
    ) {
        super(clipScope, {} as any)
        Object.assign(this, clipScope, props)
        Object.freeze(this)
    }

    public getSourceBufferCanvas(): HTMLCanvasElement {
        return null
    }

    public createGLProgram(): WebGLProgram {
        return this.glContext.createProgram()
    }

    public compileFragmentShader(shaderCode: string): WebGLShader {
        const shader = this.glContext.createShader(this.glContext.FRAGMENT_SHADER)
        this.glContext.shaderSource(shader, shaderCode)
        this.glContext.compileShader(shader)
        return shader
    }
}

export { RendererContext as default }
