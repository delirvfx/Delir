import { operation, OperationContext } from '@ragg/fleur'
import * as Router from 'routr'
import { navigateFailure, navigateStart, navigateSuccess } from './actions'
import RouteStore from './RouteStore'
import { MatchedRoute, RouteDefinitions } from './types'

export const navigateOperation = operation(async (context: OperationContext<any>, { url, method }: { url: string, method: string }) => {
    const routeStore = context.getStore(RouteStore)

    context.dispatch(navigateStart, { url, method })

    const route = routeStore.getCurrentRoute()

    if (!route) {
        context.dispatch(navigateFailure, {
            url,
            method,
            error: Object.assign(new Error(`URL ${url} not found in any routes`), { statusCode: 404 })
        })

        return
    }

    try {
        if (route.action) {
            await Promise.resolve(route.action(context, route))
        }

        context.dispatch(navigateSuccess, { url, method })
    } catch (e) {
        context.dispatch(navigateFailure, { url, method, error: Object.assign(e, { statusCode: 500 }) })
    }
})

export const withStaticRoutes = <R extends RouteDefinitions>(routes: R): {
    storeName: string
    new (...args: any[]): RouteStore<R>
} => {
    const router = new Router(routes)

    return class StaticRouteStore extends RouteStore<R> {
        public static storeName = 'fleur-route-store/RouteStore'

        constructor() {
            super()
            this.router = router
            this.routes = routes
        }
    }
}

export { RouteStore, MatchedRoute as Route }
