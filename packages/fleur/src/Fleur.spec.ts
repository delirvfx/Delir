import { action, ExtractActionIdentifiers } from './ActionIdentifier'
import Fleur from './Fleur'
import { operation } from './Operations'
import Store, { listen } from './Store'

describe('Fleur', () => {
    it('flows', () => {
        const actions = {
            increase: action<{ increase: number }>(),
            decrease: action<{ decrease: number }>()
        }

        class TestStore extends Store {
            public state: { count: number } = { count: 0 }

            private handleIncrease = listen(actions.increase, (p) => {
                this.state.count += p.increase
                console.log(this.state)
            })
        }

        type AppActions = ExtractActionIdentifiers<typeof actions>

        const app = new Fleur()
        const ctx = app.createContext()
        app.registerStore(TestStore)

        ctx.getStore(TestStore)

        const increaseOperation = operation((ctx, arg: { increase: number }) => {
            ctx.dispatch(actions.increase, { increase: arg.increase })
        })

        ctx.executeOperation(increaseOperation, { increase: 10 })
    })
})
