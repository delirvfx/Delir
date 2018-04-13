// import Fleur, { action, listen, operation, Store } from '@ragg/fleur'
import * as Fluxible from 'fluxible'
import { connectToStores, createElementWithContext } from 'fluxible-addons-react'
import * as BaseStore from 'fluxible/addons/BaseStore'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
// import { connectToStores, ContextProp, createElementWithContext, withComponentContext } from '../../fleur-react/src'

describe('benchmark', () => {
    it('Fluxible', async () => {
        const incrementOperation = (ctx) => { ctx.dispatch('INCREMENT', {}) }

        class TestStore extends (BaseStore as any) {
            public static storeName = 'TestStore'
            public static handlers = {
                INCREMENT: 'handleIncrement'
            }

            public state = { count: 0 }
            private handleIncrement(payload) {
                this.state = { count: this.state.count + 1 }
            }

            get count() { return this.state.count }
        }

        const Component = connectToStores([TestStore], (ctx) => ({ count: ctx.getStore(TestStore).count }))(
            class extends React.Component<{count: number}> {
                public render() {
                    return React.createElement('div', {}, `${this.props.count}`)
                }
            }
        )

        const app = new Fluxible({
            component: Component,
            stores: [TestStore],
        })

        const context = app.createContext()
        context.getStore(TestStore)
        const div = document.createElement('div')

        console.time('Fleur')
        for (let count = 1; count < 10000; count++) {
            await context.executeAction(incrementOperation, {})
            await new Promise(r => ReactDOM.render(createElementWithContext(context, {}), div, r))
            expect(div.innerHTML).toBe(`<div>${count}</div>`)
        }
        console.timeEnd('Fleur')
    })
})
