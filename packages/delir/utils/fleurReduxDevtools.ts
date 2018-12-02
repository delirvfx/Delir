import { AppContext } from '@ragg/fleur'

export const fleurReduxDevTools = <T extends AppContext<any>>(context: T): T => {
    if (!__DEV__) return context
    if (! (window as any).__REDUX_DEVTOOLS_EXTENSION__) return context

    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect()

    devTools.subscribe(({type, payload}: any) => {
        // Store not holdings only plain objects. (like Project store)
        // Serialized value brokes instances
        if (type === 'DISPATCH' && payload.type === '"JUMP_TO_ACTION"') {
            // tslint:disable-next-line:no-console
            console.log('[fleur redux devtools] Operation not supported.')
        }
    })

    const dispatch = context.dispatch.bind(context)
    context.dispatch = (actionIndentifier: any, payload: any) => {
        devTools.send({ type: actionIndentifier.name, payload}, context.dehydrate().stores)
        dispatch(actionIndentifier, payload)
    }

    return context
}
