import AppContext from './AppContext'
import Fleur from './Fleur'
import Store from './Store'

describe('AppContext', () => {
    describe('dehydrate', () => {
        it('Should dehydrate', () => {
            class SomeStore extends Store {
                public static storeName = 'SomeStore'
                public state = { some: 1 }
            }
            class Some2Store extends Store {
                public static storeName = 'Some2Store'
                public state = { some2: 2 }
            }

            const app = new Fleur({
                stores: [ SomeStore, Some2Store　]
            })

            const ctx = app.createContext()

            ctx.getStore(SomeStore)
            ctx.getStore(Some2Store)

            expect(ctx.dehydrate()).toEqual({
                stores: {
                    'SomeStore': { some: 1 },
                    'Some2Store': { some2: 2 },
                }
            })
        })
    })

    describe('rehydrate', () => {
        it('Should dehydrate', () => {
            class SomeStore extends Store {
                public static storeName = 'SomeStore'
                public state = { some: 1 }
            }
            class Some2Store extends Store {
                public static storeName = 'Some2Store'
                public state = { some2: 2 }
            }

            const app = new Fleur({
                stores: [ SomeStore, Some2Store　]
            })

            const ctx = app.createContext()
            ctx.rehydrate({
                stores: { SomeStore: { some: 1 }, Some2Store: { some2: 2 } }
            })

            expect(ctx.getStore(SomeStore).state).toEqual({ some: 1 })
            expect(ctx.getStore(Some2Store).state).toEqual({ some2: 2 })
        })
    })
})
