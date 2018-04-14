import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript'
import Fleur from './Fleur'
import OperationContext from './OperationContext'

describe('OperationContext', () => {
    let context: OperationContext<any>

    beforeEach(() => {
        const app = new Fleur()
        context = app.createContext().operationContext
    })

    it('#executeOperation should returns Promise', () => {
        const op = async () => {}
        const returns = context.executeOperation(op, {})
        expect(returns).toBeInstanceOf(Promise)
    })
})
