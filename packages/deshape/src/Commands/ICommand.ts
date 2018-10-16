import { DeshapeContext } from '../DeshapeContext'

export interface ICommand {
    present(ctx: DeshapeContext): void
    doUndo(ctx: DeshapeContext): void
    doRedo(ctx: DeshapeContext): void
}
