import { Clip } from '../../Entity/Clip'
import { BBox2D } from './BBox2D'

export interface StageElement {
  clip: Clip
  bbox: BBox2D
}
