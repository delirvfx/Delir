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
// store.ts (Store)
import { listen, Store } from '@ragg/fleur'

export default class Store extends Store {
    public state: { count: number } = { count: 0 }

    private handleIncrease = listen(actions.increase, (payload) => {
        // `this.produce` is immutable changing `this.state` with `immer.js`
        this.produce(draft => draft.count += payload.amount)
    })

    private handleDecrease = listen(actions.decrease, (payload) => {
        this.produce(draft => draft.count -= payload.amount)
    })
}
```

``` typescript
// app.ts
import Store from './store.ts'

const app = new Fleur({
    stores: [TestStore],
})

const ctx = app.createContext()
ctx.executeOperation(increaseOperation, { increase: 10 })
```

## How to use with React?
See [`@ragg/fleur-react`](https://www.npmjs.com/package/@ragg/fleur-react).
