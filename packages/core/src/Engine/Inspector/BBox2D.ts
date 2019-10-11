export interface BBox2D {
  /** Clip visibility */
  visible: boolean
  /** Left edge position of bounding box */
  x: number
  /** Top edge position of bounding box */
  y: number
  /** Size of bounding box by px */
  width: number
  /** Size of bounding box by px */
  height: number
  /** Radian angle of bounding box */
  angleRad: number
}
