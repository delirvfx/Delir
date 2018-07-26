import { OperationContext } from '@ragg/fleur'

export interface Route {
    method?: 'GET' | 'POST'
    path: string
    action?: (context: OperationContext<any>, route: MatchedRoute) => Promise<any> | void
    handler: any
    meta ? : any
}

export interface MatchedRoute extends Route {
    name: string
    url: string
    params: { [prop: string]: string }
    query: { [prop: string]: string }
    config: Route
}

export interface RouteDefinitions {
    [routeName: string]: Route
}
