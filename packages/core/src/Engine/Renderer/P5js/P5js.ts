import _ from 'lodash'
import VM from 'vm'
import { P5Hooks } from './P5Hooks'

import { UserCodeException } from '../../../Exceptions'
import Type from '../../../PluginSupport/TypeDescriptor'
import Expression from '../../../Values/Expression'
import { createExpressionContext } from '../../ExpressionSupport/createExpressionContext'
import { ParamType } from '../../ParamType'
import { ClipPreRenderContext } from '../../RenderContext/ClipPreRenderContext'
import { ClipRenderContext } from '../../RenderContext/ClipRenderContext'
import { IRenderer } from '../RendererBase'

interface Params {
  sketch: ParamType.Code
  opacity: ParamType.Number
}

const VM_GLOBAL_WHITELIST = ['Array', 'Math', 'Date']

export class P5jsRenderer implements IRenderer<Params> {
  public static get rendererId(): string {
    return 'p5js'
  }

  public static provideAssetAssignMap() {
    return {}
  }

  public static provideParameters() {
    return Type.code('sketch', {
      label: 'Sketch',
      langType: 'javascript',
      defaultValue: new Expression('javascript', 'function setup() {\n    \n}\n\nfunction draw() {\n    \n}\n'),
    }).number('opacity', {
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

    this.vmGlobal = VM.createContext(
      new Proxy(
        {
          console: global.console,
          p5: this.p5ex.p5,
        },
        {
          get: (target: any, propKey: string) => {
            if (target[propKey]) {
              return target[propKey]
            } else if (this.p5ex.p5[propKey]) {
              // Expose p5 drawing methods
              return typeof this.p5ex.p5[propKey] === 'function'
                ? this.p5ex.p5[propKey].bind(this.p5ex.p5)
                : this.p5ex.p5[propKey]
            } else if (VM_GLOBAL_WHITELIST.includes(propKey)) {
              return (global as any)[propKey]
            } else {
              // Dynamic exposing
              return this.vmExposedVariables[propKey]
            }
          },
        },
      ),
    )

    try {
      // Make VM scope binded sketch object
      const vm = new VM.Script(context.parameters.sketch.code, {})
      vm.runInContext(this.vmGlobal)

      this.p5ex.p5.createCanvas(context.width, context.height)
      this.canvas = this.p5ex.p5.canvas
      this.canvas.width = context.width
      this.canvas.height = context.height

      if (typeof this.vmGlobal.setup === 'function') {
        this.vmGlobal.setup()
      }
    } catch (e) {
      throw new UserCodeException(`P5.js script error (${e.message})`, {
        sourceError: e,
        location: {
          type: 'clip',
          entityId: context.clip.id,
          paramName: 'sketch',
        },
      })
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
      throw new UserCodeException(`P5.js script error (${e.message})`, {
        sourceError: e,
        location: {
          type: 'clip',
          entityId: context.clip.id,
          paramName: 'sketch',
        },
      })
    }

    const ctx = context.destCanvas.getContext('2d')!
    ctx.globalAlpha = _.clamp(context.parameters.opacity, 0, 100) / 100
    ctx.drawImage(this.canvas, 0, 0)
  }

  private makeVmExposeVariables(context: ClipPreRenderContext<Params> | ClipRenderContext<Params>) {
    return createExpressionContext(context)
  }
}
