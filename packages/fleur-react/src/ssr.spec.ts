import Fleur, { action, listen, operation, Store } from '@ragg/fleur'
import * as cheerio from 'cheerio'
import * as express from 'express'
import { Server } from 'http'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import * as request from 'request-promise'

import { ContextProp, createElementWithContext } from '.'
import connectToStores from './connectToStores'

describe('Sever side rendering', () => {
    it('test', async () => {
        let server: Server

        try {
            const increaseIdent = action<{increase: number}>()
            const increaseOp = operation((ctx, {increase}: {increase: number}) => {
                ctx.dispatch(increaseIdent, { increase })
            })

            class TestStore extends Store {
                protected state = { count: 0 }

                private increase = listen(increaseIdent, ({increase}) => {
                    this.updateWith(d => d.count += increase )
                })

                public getCount() { return this.state.count }
            }

            const Component = connectToStores([TestStore], (ctx) => ({
                count: ctx.getStore(TestStore).getCount()
            }))(class extends React.PureComponent<{count: number} & ContextProp> {
                public render() {
                    return React.createElement('div', {}, `Your count ${this.props.count}`)
                }
            })

            const app = new Fleur()
            app.registerStore(TestStore)

            const serverApp = express()

            serverApp.get('/', async (req, res) => {
                try {
                    const context = app.createContext()
                    context.getStore(TestStore)
                    await context.executeOperation(increaseOp, { increase: parseInt(req.query.amount, 10) })

                    res.write(ReactDOMServer.renderToString(
                        React.createElement('html', {}, React.createElement(React.Fragment as any, { children: [
                            React.createElement('head', {},
                                React.createElement('script', { 'data-state': JSON.stringify(context.dehydrate()) })
                            ),
                            React.createElement('body', {},
                                createElementWithContext(context, Component, {})
                            )
                        ] }))
                    ))
                    res.end()
                } catch (e) {
                    server && server.close()
                    throw e
                }
            })

            server = serverApp.listen(31987)

            // First request
            const res1 = await request.get('http://localhost:31987/?amount=10')
            const dehydratedState1 = JSON.parse(cheerio.load(res1)('script').attr('data-state'))
            expect(res1).toContain('<div>Your count 10</div>')
            expect(dehydratedState1).toEqual({ stores: { TestStore: { count: 10 } } })

            const clientContext1 = app.createContext()
            clientContext1.rehydrate(dehydratedState1)
            expect(clientContext1.getStore(TestStore).state).toEqual({ count: 10 })

            // Another request
            const res2 = await request.get('http://localhost:31987/?amount=20')
            const dehydratedState2 = JSON.parse(cheerio.load(res2)('script').attr('data-state'))
            expect(res2).toContain('<div>Your count 20</div>')
            expect(dehydratedState2).toEqual({ stores: { TestStore: { count: 20 } } })

            const clientContext2 = app.createContext()
            clientContext2.rehydrate(dehydratedState2)
            expect(clientContext2.getStore(TestStore).state).toEqual({ count: 20 })
        } catch (e) {
            server && server.close()
            throw e
        }

        server && server.close()
    })
})
