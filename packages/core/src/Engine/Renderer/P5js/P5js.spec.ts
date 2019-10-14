import fs from 'fs-extra'
import { join } from 'path'
import { Expression } from '../../../Values'
import { RenderContextBase } from '../../RenderContext/RenderContextBase'
import { P5jsRenderer } from './P5js'

jest.mock('./P5Hooks', () => ({
  __esModule: true,
  P5Hooks: class {
    public p5 = {
      canvas: {},
      createCanvas: () => {},
    }
  },
}))

describe('P5js', () => {
  const renderer = new P5jsRenderer()
  it('Should accessible specified global objects', async () => {
    const sketch = (await fs.readFile(join(__dirname, 'specFixtures/globals.js'))).toString()
    const request = new RenderContextBase({
      width: 100,
      height: 100,
    } as any).toClipPreRenderContext({
      parameters: {
        sketch: new Expression('javascript', sketch),
        opacity: 1,
      },
    })

    await renderer.beforeRender(request)
  })
})
