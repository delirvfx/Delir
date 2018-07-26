import Fleur from '@ragg/fleur'
import * as Router from 'routr'
import { navigateOperation, withStaticRoutes } from './index'

describe('test', () => {
    const RouteStore = withStaticRoutes({
        articles: {
            path: '/articles',
            handler: 'ArticleHandler',
            meta: {
                requireAuthorized: false,
            },
            action: () => {}
        },
        articles_show: {
            path: '/articles/:id',
            handler: 'ArticleShowHandler',
            meta: {
                requireAuthorized: true,
            },
            action: () => {}
        },
        error: {
            path: '/error',
            handler: 'Error',
            action: () => { throw new Error('damn.') }
        }
    })

    const app = new Fleur({
        stores: [
            RouteStore
        ]
    })

    const context = app.createContext()

    it('Should route to correct handler', async () => {
        await context.executeOperation(navigateOperation, { url: '/articles', method: 'GET' })

        const route = context.getStore(RouteStore).getCurrentRoute()
        expect(route.handler).toBe('ArticleHandler')
    })

    it('Should route to correct handler with ', async () => {
        await context.executeOperation(navigateOperation, { url: '/articles/1', method: 'GET' })

        const route = context.getStore(RouteStore).getCurrentRoute()
        expect(route.handler).toBe('ArticleShowHandler')
        expect(route.params.id).toBe('1')
    })

    it('Should handle exception ', async () => {
        await context.executeOperation(navigateOperation, { url: '/error', method: 'GET' })

        const error = context.getStore(RouteStore).getCurrentNavigateError()
        console.log(error)
        expect(error).toMatchObject({ message: 'damn.', statusCode: 500 })
    })

    it('Make path from routes', () => {
        const path = context.getStore(RouteStore).makePath('articles_show', { id: 1 })
        expect(path).toBe('/articles/1')
    })
})
