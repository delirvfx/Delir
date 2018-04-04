import Fleur from './Fleur'
import Store from './Store';

describe('Fleur', () => {
    it('types', () => {
        const ctx = new Fleur()
        const StoreClass = class extends Store {
            testMethod() { return 'gotcha'; }
        }

        ctx.registerStore(StoreClass)
        console.log(ctx.getStore(StoreClass).testMethod)
    })
})
