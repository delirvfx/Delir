import Engine from '../Engine'
import { PostEffectsInspector } from './PostEffectsInspector'
import { RendererInspector } from './RendererInspector'
import { StageInspector } from './StageInspector'

export class Inspector {
  public readonly renderers: RendererInspector
  public readonly effects: PostEffectsInspector
  public readonly stage: StageInspector

  constructor(private engine: Engine) {
    this.renderers = new RendererInspector(engine)
    this.effects = new PostEffectsInspector(engine)
  }
}
