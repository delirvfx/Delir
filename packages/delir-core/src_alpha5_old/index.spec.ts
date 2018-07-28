import {} from 'jest'
import Delir, { Engine } from './index'

describe('index', () => {
    it('exporting', () => {
        expect(Delir).toEqual(expect.anything())
        expect(Engine).toEqual(expect.anything())
    })
})
