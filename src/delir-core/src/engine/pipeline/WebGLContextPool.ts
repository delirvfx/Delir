interface WebGLContextSet {
    used: boolean
    context: WebGLRenderingContext
}

interface WebGL2ContextSet {
    used: boolean
    context: WebGL2RenderingContext
}

export default class WebGLContextPool {
    private readonly glPool: WebGLContextSet[] = []
    private readonly gl2Pool: WebGL2ContextSet[] = []
    private readonly programMap: WeakMap<WebGLProgram, WebGLRenderingContext|WebGL2RenderingContext> = new WeakMap()
    private waiters: (() => boolean)[] = []

    constructor()
    {
        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('webgl')
            this.glPool.push({used: false, context})
        }

        for (let i = 0; i < 4; i++) {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('webgl2')
            this.gl2Pool.push({used: false, context})
        }
    }

    public async getContext(type: 'webgl'): Promise<WebGLRenderingContext>
    public async getContext(type: 'webgl2'): Promise<WebGL2RenderingContext>
    public async getContext(type: 'webgl'|'webgl2'): Promise<WebGLRenderingContext|WebGL2RenderingContext>
    {
        if (type !== 'webgl' && type !== 'webgl2') {
            throw new Error('Valid needed context type must be specified.')
        }

        const pool = type === 'webgl' ? this.glPool : this.gl2Pool
        const freeContext: WebGLContextSet|WebGL2ContextSet|null = pool.find(set => !set.used)

        if (!freeContext) {
            return new Promise<WebGLRenderingContext|WebGL2RenderingContext>(resolve => {
                this.waiters.push(() => {
                    const _freeContext: WebGLContextSet|WebGL2ContextSet|null = pool.find(set => !set.used)
                    if (_freeContext) {
                        _freeContext.used = true
                        resolve(_freeContext.context)
                    }
                    return _freeContext ? true : false
                })
            })
        }

        freeContext.used = true
        return Promise.resolve(freeContext.context)
    }

    public async getContextByProgram(program: WebGLProgram): Promise<WebGLRenderingContext|WebGL2RenderingContext|null>
    {
        const assignedContext = this.programMap.get(program)
        if (!assignedContext) return null

        const pool = assignedContext instanceof WebGLRenderingContext ? this.glPool : this.gl2Pool
        const contextSet = pool.find(set => set.context === assignedContext)

        if (!contextSet) return null
        if (!contextSet.used) {
            contextSet.used = true
            return Promise.resolve(contextSet.context)
        }

        return new Promise<WebGLRenderingContext|WebGL2RenderingContext>(resolve => {
            this.waiters.push(() => {
                const _freeContext: WebGLContextSet|WebGL2ContextSet|null = pool.find(set => !set.used)
                if (_freeContext) {
                    _freeContext.used = true
                    resolve(_freeContext.context)
                }
                return _freeContext ? true : false
            })
        })
    }

    public registerContextForProgram(program: WebGLProgram, context: WebGLRenderingContext|WebGL2RenderingContext)
    {
        const pool = context instanceof WebGLRenderingContext ? this.glPool : this.gl2Pool
        const hasContext = pool.findIndex(set => set.context === context) !== -1

        if (!hasContext) return
        this.programMap.set(program, context)
    }

    public releaseContext(context: WebGLRenderingContext|WebGL2RenderingContext)
    {
        const pool = context instanceof WebGLRenderingContext ? this.glPool : this.gl2Pool
        const contextSet = pool.find(set => set.context === context)

        if (contextSet) {
            contextSet.used = false
            this.waiters = this.waiters.filter(callback => callback() === false)
        }
    }
}
