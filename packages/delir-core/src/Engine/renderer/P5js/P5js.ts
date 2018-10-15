import * as _ from 'lodash'
import * as VM from 'vm'
import P5Hooks from './P5Hooks'

import { UserCodeException } from '../../../Exceptions/UserCodeException'
import { proxyDeepFreeze } from '../../../helper/proxyFreeze'
import Type from '../../../PluginSupport/type-descriptor'
import Expression from '../../../Values/Expression'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'

interface Params {
    sketch: Expression
    opacity: number
}

const VM_GLOBAL_WHITELIST = ['Array', 'Math', 'Date']

export default class P5jsRenderer implements IRenderer<Params>
{
    public static get rendererId(): string { return 'p5js' }

    public static provideAssetAssignMap() {
        return {}
    }

    public static provideParameters() {
        return Type
            .code('sketch', {
                label: 'Sketch',
                langType: 'javascript',
                defaultValue: new Expression('javascript', 'function setup() {\n    \n}\n\nfunction draw() {\n    \n}\n')
            })
            .number('opacity', {
                label: 'Opacity',
                animatable: true,
                defaultValue: 100,
            })
    }

    private vmGlobal: any
    private vmExposedVariables: any
    private p5ex: P5Hooks
    private canvas: HTMLCanvasElement

    public async beforeRender(context: ClipPreRenderContext<Params>) {
        this.p5ex = new P5Hooks(context.resolver)

        // Make VM environment
        this.vmExposedVariables = this.makeVmExposeVariables(context)

        this.vmGlobal = VM.createContext(new Proxy({
            console: global.console,
            p5: this.p5ex.p5,
        }, {
                get: (target: any, propKey: string) => {
                    if (target[propKey]) {
                        return target[propKey]
                    } else if (this.p5ex.p5[propKey]) {
                        // Expose p5 drawing methods
                        return typeof this.p5ex.p5[propKey] === 'function' ? this.p5ex.p5[propKey].bind(this.p5ex.p5) : this.p5ex.p5[propKey]
                    } else if (VM_GLOBAL_WHITELIST.includes(propKey)) {
                        return (global as any)[propKey]
                    } else {
                        // Dynamic exposing
                        return this.vmExposedVariables[propKey]
                    }
                }
            }))

        const vm = new VM.Script(context.parameters.sketch.code, {})

        // Make VM scope binded sketch object
        vm.runInContext(this.vmGlobal)

        this.canvas = this.p5ex.p5.canvas
        this.p5ex.p5.createCanvas(context.width, context.height)

        if (typeof this.vmGlobal.setup === 'function') {
            try {
                this.vmGlobal.setup()
            } catch (e) {
                throw new UserCodeException('msg', {
                    sourceError: e,
                    location: {
                        type: 'clip',
                        entityId: context.clip.id,
                        paramName: 'sketch',
                    }
                })
            }
        }
    }

    public async render(context: ClipRenderContext<Params>) {
        await new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (this.p5ex.preloadCount === 0) {
                    resolve()
                    clearInterval(intervalId)
                }
            })
        })

        this.vmExposedVariables = this.makeVmExposeVariables(context)

        try {
            this.vmGlobal.draw && this.vmGlobal.draw()
        } catch (e) {
            throw new UserCodeException('msg', {
                sourceError: e,
                location: {
                    type: 'clip',
                    entityId: context.clip.id,
                    paramName: 'sketch',
                }
            })
        }

        const ctx = context.destCanvas.getContext('2d')!
        ctx.globalAlpha = _.clamp(context.parameters.opacity, 0, 100) / 100
        ctx.drawImage(this.canvas, 0, 0)
    }

    private makeVmExposeVariables(context: ClipPreRenderContext<Params> | ClipRenderContext<Params>) {
        return {
            thisComp: {
                width: context.width,
                height: context.height,
                time: context.timeOnComposition,
                frame: context.frameOnComposition,
                duration: context.durationFrames / context.framerate,
                durationFrames: context.durationFrames,
                audioBuffer: null,
            },
            thisClip: {
                time: (context as ClipRenderContext<Params>).timeOnClip,
                frame: (context as ClipRenderContext<Params>).frameOnClip,
                params: null,
                effect: (referenceName: string) => {
                    const targetEffect = (context as ClipRenderContext<Params>).clipEffectParams[referenceName]
                    if (!targetEffect) throw new Error(`Referenced effect ${referenceName} not found`)
                    return { params: proxyDeepFreeze(targetEffect) }
                },
            }
        }
    }
}
