import Engine from '../Engine'
import { ClipInspector } from './ClipInspector'

export class StageInspector {
  constructor(private engine: Engine) {}

  public clip(id: string) {
    const clip = this.engine.project.findClip(id)
    return clip ? new ClipInspector(this.engine, clip) : null
  }
}
