import { ActionCreator } from '@ragg/fleur'
import { Action } from '@ragg/fleur/lib/Action'
import EditorStore from '../store/EditorStore'

const drawRect: ActionCreator<{ x: number, y: number }> = (ctx, arg) => {
    // ctx.getStore(EditorStore).getState()
    ctx.executeActon(drawRect, { x: 1, y: 1, z: 1 })
    ctx.dispatch({})
}

type DrawRectAction = Action<''>
