# 🌼 Fleur 🌼
An Fully-typed Flux framework inspired by Fluxible.  
Runs on Node / Web.

(No dependence to React. see [this](https://www.npmjs.com/package/@ragg/fleur-react) if you want to use with React.)

## Example

``` typescript
// actions.ts (Action typings)
import { action } from '@ragg/fleur'

export const increase = action<{ amount: number }>();
export const decrease = action<{ amount: number }>();
```

``` typescript
// store.ts (Store)
import { listen, Store } from '@ragg/fleur'
import * as actions from './actions.ts'

export default class SomeStore extends Store {
    public state: { count: number } = { count: 0 }

    private handleIncrease = listen(actions.increase, (payload) => {
        // `this.produce` is immutable changing `this.state` with `immer.js`
        this.produce(draft => draft.count += payload.amount)
    })

    private handleDecrease = listen(actions.decrease, (payload) => {
        this.produce(draft => draft.count -= payload.amount)
    })

    public getCount() { 
        return this.state.count
    }
}
```

``` typescript
// operations.ts (Action Creator)
import { operation } from '@ragg/fleur'
import * as actions from './actions.ts'

export const increaseOperation = operation((ctx, { amount }: { amount: number }) => {
    ctx.dispatch(actions.increase, { amount })
})

export const decreaseOperation = operation((ctx, { amount }: { amount: number }) => {
    ctx.dispatch(actions.decrease, { amount })
})
```

``` typescript
// app.ts
import Fleur from '@ragg/fleur'
import SomeStore from './store.ts'

const app = new Fleur({
    stores: [SomeStore],
})

const ctx = app.createContext()
ctx.executeOperation(increaseOperation, { increase: 10 })
console.log(ctx.getStore(SomeStore).getCount()) // => 10
```

## How to use with React?
See [`@ragg/fleur-react`](https://www.npmjs.com/package/@ragg/fleur-react).
