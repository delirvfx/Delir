import SvgPath from 'svgpath'

type PathSegment = readonly [string, number, number, number?, number?, number?, number?]

export class ShapeProxy {
  private readonly svgPath: typeof SvgPath

  constructor(public readonly path: string) {
    this.svgPath = new SvgPath(path)
  }

  get segments(): readonly PathSegment[] {
    return [...(this.svgPath as any).segments]
  }

  public toString(): string {
    return this.svgPath.toString()
  }
}
