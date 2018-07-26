# fleur-route-store
fluxible-route inspired router for [fleur](https://www.npmjs.com/package/@ragg/fleur)

## Usage

``` tsx
// RouteStore.ts
import * as Loadable from 'react-loadable'
import { withStaticRoutes, Route } from '@ragg/fleur-route-store'
import { fetchUserSession, fetchArticle } from './operations'

export default withStaticRoutes({
    articleShow: {
        path: '/article/:id',
        action: (context, route: Route) => Promise.all([
            context.executeOperation(fetchUserSession, {}),
            context.executeOperation(fetchArticle, { id: route.param.id })
        ])
        handler: Loadable({ loader: () => import('./ArticleContainer') }),
        meta: {
            noHeader: true,
        },
    }
})

// App.ts
import { connectToStores, withComponentContext, ContextProp } from '@ragg/fleur-react'
import { RouteStore } from './RouteStore'

type Props = {
    route: Route | null
} & ContextProp

export default withComponentContext(
    connectToStores([ RouteStore ], (context) => ({
        // get routed route
        route: context.getStore(RouteStore).getCurrentRoute()
    }))
)(class App extends React.Component<Props> {
    render() {
        const routeStore = this.props.context.getStore(RouteStore)

        const { route } = this.props
        const Handler = route ? route.handler : null

        return (
            <html>
                <head>
                    {/* heading... */}
                </head>
                <body>
                    <div>
                        {/* get .meta property from route.meta */}
                        {!route.meta.noHeader && <header />}

                        {/* mount Handler component here */}
                        {handler && <Handler />}

                        {/* URL Builder */}
                        <a href={routeStore.makePath('articleShow', { id: 100 })}>
                            Jump to Article
                        </a>
                    </div>
                </body>
            </html>
        )
    }
})

// server.ts
import Fleur from '@ragg/fleur'
import { navigateOperation } from '@ragg/fleur-route-store'
import express from 'express'
import RouteStore, from './RouteStore'
import App from './App'

const server = express()
const app = new Fleur({ stores: [ RouteStore ] })

server.use((req) => {
    const context = req.context = app.createContext();

    context.executeOperation(navigateOperation, {
        url: req.url,
        method: req.method
    })
})

server.use((req, res) => {
    res.write('<!doctype html>')
    res.write(
        ReactDOM.renderToString(
            createElementWithContext(req.context, App, {})
        )
    )
})

```
