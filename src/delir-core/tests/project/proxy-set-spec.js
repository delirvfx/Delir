import ProxySet from '../../src/project/_proxy-set'

describe('ProxySet', () => {
    it('entries', () => {
        const p = new ProxySet([], {
            add: target => {
                return true
            }
        })
        p.add('a')
        // console.log(p, p.entries())
    })
})
//
