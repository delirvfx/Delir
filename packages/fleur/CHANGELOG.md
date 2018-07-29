### 0.0.3
#### API Changes
- Accept many listener per Action in one Store
  ```ts
  // invalid in 0.0.2
  class SomeStore extends Store {
      private handleSomeAction = listen(someAction, () => { /* Do something */ })
      private handleSomeAction2 = listen(someAction, () => { /* Do something */ }) // error!
  }

  // Can in 0.0.3
  class SomeStore extends Store {
      private handleSomeAction = listen(someAction, () => { /* Do something */ })
      private handleSomeAction2 = listen(someAction, () => { /* Do something */ })
  }
  ```

### 0.0.2
#### API Changes
- Start changelog.
- Rename `Store#produce` to `Store#updateWith`.
- `static storeName = 'someStoreName'` is required for Store.

#### Fixes
- Broken store rehydration state under the Uglify
