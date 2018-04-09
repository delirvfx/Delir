import { ActionCreator } from 'index'

export type OperationArg<T> = T extends (_: any, arg: infer A) => any ? A : never

const operations = <T extends { [name: string]: ActionCreator<any> }>(operations: T): {
    [K in keyof T]: T[K]
} => {
    return operations
}

export { operations as default }
