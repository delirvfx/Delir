import { ActionCreator } from '@ragg/fleur'
import { KnownActions } from './action'

export const loadProject: ActionCreator<KnownActions> = (ctx, {filePath: string}) => {
    ctx.dispatch({ type: 'INCREASE',  })
}
