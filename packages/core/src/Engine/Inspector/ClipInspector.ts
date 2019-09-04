import { KeyframeCalcurator } from '../..'
import { Clip } from '../../Entity'
import Engine from '../Engine'

export class ClipInspector {
  constructor(private engine: Engine, public readonly clip: Clip) {}

  public keyframeSequencesAt(frame: number) {
    const { parameter } = this.engine.inspector.renderers.getSummary(this.clip.renderer)
    KeyframeCalcurator.calcKeyframeValueAt(frame, this.clip.placedFrame, parameter, this.clip.keyframes)
  }
}
