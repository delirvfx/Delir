import * as fs from 'fs-extra'
import { join } from 'path'
import { Expression } from '../../../Values'
import RenderRequest from '../../RenderContext'
import P5jsRenderer from './P5js'

jest.mock('./P5Hooks', () => ({ default: class {
    public p5 = {
        canvas: {},
        createCanvas: () => {}
    }
}}))

describe('P5js', () => {
    const renderer = new P5jsRenderer()
    it('Should accessible specified global objects', async () => {
        const sketch = (await fs.readFile(join(__dirname, 'specFixtures/globals.js'))).toString()
        const request = new RenderRequest({
            width: 100,
            height: 100,
            parameters: {
                sketch: new Expression('javascript', sketch),
                opacity: 1,
            }
        }).toPreRenderingRequest()

        await renderer.beforeRender(request)
    })
})
