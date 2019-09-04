import Engine from '../Engine'
import { AvailableRenderer, getInfo } from '../Renderer'

export class RendererInspector {
  constructor(private engine: Engine) {}

  public getSummary(type: AvailableRenderer) {
    return getInfo(type)
  }
}
