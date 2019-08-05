import P5 from 'p5'
import DependencyResolver from '../../DependencyResolver'

interface Sketch {
  setup(): void
  draw(): void
}

export class P5Hooks {
  public p5: any
  private node: HTMLDivElement

  constructor(private resolver: DependencyResolver) {
    // nodeを渡さないとdocument.body.appendChildされてしまう！
    // https://github.com/processing/p5.js/blob/a64959e2722c4cad9327246be494f0b472ccd54c/src/core/rendering.js#L98
    this.node = document.createElement('div')

    this.p5 = new P5((p5: any) => {
      p5._loop = false // disable auto rendering
      p5.setup = () => {} // noop
      p5.draw = () => {} // noop
      p5.loadImage = this.loadImage
    }, this.node)
  }

  get preloadCount() {
    return this.p5._preloadCount
  }

  private loadImage = (path: string, successCallback: (pImg: any) => void, failureCallback: (e: any) => void) => {
    const match = /^delir:(.+)/.exec(path)

    if (match) {
      path = this.resolver.resolveAsset(match[1])!.path
    }

    return P5.prototype.loadImage.call(this.p5, path, successCallback, failureCallback)
  }
}
