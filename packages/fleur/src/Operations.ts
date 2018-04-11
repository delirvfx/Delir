import { ActionIdentifier } from './Action'
import ActionContext from './ActionContext'

export interface Operation<Actions extends ActionIdentifier<any>> {
    (context: ActionContext<Actions>, arg: any): Promise<void> | void
}

export type OperationArg<T> = T extends (_: any, arg: infer A) => any ? A : never

/** Make Operation group from objects */
export const operations = <T extends { [name: string]: Operation<any> }>(operations: T): {
    [K in keyof T]: T[K]
} => {
    return operations
}

/** Make one Operation function */
export const operation = <Actions extends ActionIdentifier<any>, T extends Operation<Actions>>(op: T) => op
