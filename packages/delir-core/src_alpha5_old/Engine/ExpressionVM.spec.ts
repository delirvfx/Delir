import ExpressionVM from './ExpressionVM'

describe('ExpressionVM', () => {
    let evm: ExpressionVM

    beforeEach(() => { evm = new ExpressionVM() })

    it('#execute', () => {
        const result = evm.execute(`
            1
        `, { context: null })
        expect(result).toBe(1)
    })
})
