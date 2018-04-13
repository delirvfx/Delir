import Fleur, { action, listen, operation, Store } from '@ragg/fleur'
import { createServer } from 'http'
import { Server } from 'net'
import * as ReactDOM from 'react-dom/server'
import * as request from 'request-promise'
import { connectToStores } from '.';

describe('Sever side rendering', () => {
    it('test', async () => {
        let server: Server

        try {
            const increaseIdent = action<{increase: number}>()
            const increaseOp = operation((ctx, {increase}: {increase: number}) => { ctx.dispatch(increaseIdent, { increase }) })

            class TestStore extends Store {
                protected state = { count: 0 }

                private increase = listen(increaseIdent, ({increase}) => {

                })
            }

            connectToStores([TestStore], (ctx) => ({
                count:
            }))
            class Component extends React.PureComponent<{count: number}> {
                public render() {
                    return React.createElement('div', {}, `Your count ${this.props.count}`)
                }
            }

            const app = new Fleur()

            server = createServer((req, res) => {
                const context = app.createContext()

                res.write('hi')
                res.end()
            })
            server.listen(31987)

            const res = await request.get('http://localhost:31987')
            console.log(res)
        } catch (e) {
            server && server.close()
            throw e
        }

        server && server.close()
    })
})
