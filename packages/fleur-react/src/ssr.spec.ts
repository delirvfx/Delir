import Fleur, { action, listen, operation, Store } from '@ragg/fleur'
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
                    this.produce(d => d.count += increase )
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
                        React.createElement('html', {},
                            React.createElement('body', {},
                                createElementWithContext(context, Component, {})
                            )
                        )
                    ))
                    res.end()
                } catch (e) {
                    server && server.close()
                    throw e
                }
            })

            server = serverApp.listen(31987)

            const res1 = await request.get('http://localhost:31987/?amount=1')
            expect(res1).toBe('<html data-reactroot=""><body><div>Your count 1</div></body></html>')

            const res2 = await request.get('http://localhost:31987/?amount=2')
            expect(res2).toBe('<html data-reactroot=""><body><div>Your count 2</div></body></html>')
        } catch (e) {
            server && server.close()
            throw e
        }

        server && server.close()
    })
})
