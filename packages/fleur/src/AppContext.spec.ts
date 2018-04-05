import AppContext from './AppContext'
import Store from './Store'

describe('AppContext', () => {
    it('', () => {
        const c = new AppContext()
        const SomeStore = class extends Store {
            public sayHello() { return 'hello' }
        }

        expect(c.getStore(SomeStore).sayHello()).toBe('hello')
    })
})
