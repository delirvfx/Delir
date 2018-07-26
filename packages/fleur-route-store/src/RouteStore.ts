import { listen, Store } from '@ragg/fleur'
import { navigateFailure, navigateStart, navigateSuccess, NavigationPayload } from './actions'
import { MatchedRoute, RouteDefinitions } from './types'

export interface State {
    currentRoute: MatchedRoute | null
    error: Error | null
    isComplete: boolean
}

export default class RouteStore<R extends RouteDefinitions> extends Store<State> {
    public static storeName = 'fleur-route-store/RouteStore'

    protected state: State = {
        currentRoute: null,
        error: null,
        isComplete: false,
    }

    protected router: any
    protected routes: RouteDefinitions

    // @ts-ignore
    private handleNavigateStart = listen(navigateStart, ({ url, method }: NavigationPayload) => {
        const currentRoute = this.state.currentRoute || { name: null }
        const nextRoute = this.matchRoute(url, { method })

        if (nextRoute && nextRoute.name === currentRoute.name) {
            return
        }

        this.updateWith(draft => {
            draft.currentRoute = nextRoute
            draft.isComplete = false
        })
    })

    // @ts-ignore
    private handleNavigationSuccess = listen(navigateSuccess, ({ url, method }: NavigationPayload) => {
        this.updateWith(draft => {
            draft.error = null
            draft.isComplete = true
        })
    })

    // @ts-ignore
    private handleNavigationFailure = listen(navigateFailure,  ({ error }: NavigationPayload) => {
        this.updateWith(draft => {
            draft.error = error || null
            draft.isComplete = true
        })
    })

    public rehydrate(state: State) {
        this.updateWith(draft => Object.assign(draft, state))
    }

    public dehydrate() {
        return this.state
    }

    public makePath(routeName: keyof R, params: object = {}, query: object = {}): string {
        return this.router.makePath(routeName, params, query)
    }

    public getCurrentRoute(): MatchedRoute | null {
        return this.state.currentRoute
    }

    public getCurrentNavigateError(): Error | null {
        return this.state.currentRoute && this.state.error
    }

    public isNavigationComplete(): boolean {
        return this.state.isComplete
    }

    public getRoute(url: string, options: { method: string }) {
        return this.matchRoute(url, options)
    }

    public getRoutes() {
        return this.routes
    }

    public isActive(href: string) {
        const { currentRoute } = this.state
        return !!(currentRoute && currentRoute.url === href)
    }

    private matchRoute(url: string, options: any): MatchedRoute | null {
        const indexOfHash = url.indexOf('#')
        const urlWithoutHash = indexOfHash !== -1 ? url.slice(indexOfHash) : url
        const route = this.router.getRoute(urlWithoutHash, options)

        if (!route) return null

        return {
            name: route.name,
            url: route.url,
            params: route.params,
            query: route.query,
            ...route.config,
        }
    }
}
