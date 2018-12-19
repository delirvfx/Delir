import { Exceptions, PostEffectBase, PreRenderRequest, RenderRequest, Type, TypeDescriptor } from '@ragg/delir-core'

import * as Th from 'three'
import { MMDHelper, MMDLoader } from 'three-mmd-loader'

interface Param {
    camX: number
    camY: number
    camZ: number
    camTargetX: number
    camTargetY: number
    camTargetZ: number
    model: any | null
    motion: any | null
}

export default class MMDPostEffect extends PostEffectBase {
    public static provideParameters(): TypeDescriptor {
        return Type.float('camX', { label: 'Cam pos X', defaultValue: 0 })
            .float('camY', { label: 'Cam pos Y', defaultValue: 15 })
            .float('camZ', { label: 'Cam pos Z', defaultValue: 30 })
            .float('camTargetX', { label: 'Cam target X', defaultValue: 0 })
            .float('camTargetY', { label: 'Cam target Y', defaultValue: 10 })
            .float('camTargetZ', { label: 'Cam target Z', defaultValue: 0 })
            .asset('model', { label: 'Model(pmd/pmx)', extensions: ['pmd', 'pmx'] })
            .asset('motion', { label: 'Motion(vmd)', extensions: ['vmd'] })
    }

    private renderer: Th.WebGLRenderer
    private scene: Th.Scene
    private camera: Th.Camera
    private mesh: Th.Mesh

    private mmdHelper: MMDHelper
    private mmdLoader: MMDLoader
    private ctxBindToken: any

    public async initialize(req: PreRenderRequest<Param>) {
        const param = req.parameters

        // Get and bind WebGL Context
        const gl = await req.glContextPool.getContext('webgl')
        this.ctxBindToken = req.glContextPool.generateContextBindToken()
        req.glContextPool.registerContextForToken(this.ctxBindToken, gl)

        // Init three.js instances
        this.renderer = new Th.WebGLRenderer({ canvas: gl.canvas, clearColor: 0xffffff, clearAlpha: 1 })
        this.renderer.setSize(req.width, req.height)

        this.mmdHelper = new MMDHelper()
        this.mmdLoader = new MMDLoader()
        this.scene = new Th.Scene()

        if (param.model != null) {
            const mesh = (this.mesh = await new Promise(async resolve => {
                const _mesh = await this.mmdLoader.loadModel(param.model.path)
                // テクスチャのロードを待機する
                setTimeout(() => resolve(_mesh), 200)
            }))
            this.scene.add(mesh)
            this.mmdHelper.add(mesh)
            this.mmdHelper.setAnimation(mesh)
        }

        this.camera = new Th.PerspectiveCamera(45, req.width / req.height)
        this.camera.position.y = 20
        this.camera.position.z = param.camZ

        const ambient = new Th.AmbientLight(0x666666)
        this.scene.add(ambient)

        const directionalLight = new Th.DirectionalLight(0x887766)
        directionalLight.position.set(-1, 1, 1).normalize()
        this.scene.add(directionalLight)

        this.renderer.render(this.scene, this.camera)

        // release context
        req.glContextPool.releaseContext(gl)
    }

    public async render(req: RenderRequest<Param>) {
        // get binded WebGL context
        const gl = await req.glContextPool.getContextByToken(this.ctxBindToken)
        const destCtx = req.destCanvas.getContext('2d')
        const param = req.parameters
        const renderer = this.renderer

        this.camera.position.set(param.camX, param.camY, param.camZ)
        this.camera.lookAt(new Th.Vector3(param.camTargetX, param.camTargetY, param.camTargetZ))
        this.camera.aspect = req.width / req.height
        this.camera.updateProjectionMatrix()

        renderer.setSize(req.width, req.height)
        renderer.render(this.scene, this.camera)

        destCtx.clearRect(0, 0, req.width, req.height)
        destCtx.drawImage(renderer.domElement, 0, 0)

        // release context
        req.glContextPool.releaseContext(gl)
    }
}
