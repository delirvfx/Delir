import Engine from '../Engine'

export class PostEffectsInspector {
  constructor(private engine: Engine) {}

  /** Get specified post effect plugin summary */
  public getSummary(id: string) {
    return this.engine.pluginRegistry.getPlugin('id')
  }

  public getParameters(id: string) {
    return this.engine.pluginRegistry.getPostEffectParametersById(id)
  }
}
