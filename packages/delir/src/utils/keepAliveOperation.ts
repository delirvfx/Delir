import { OperationContext } from '@fleur/fleur'
import { Operation, OperationArgs } from '@fleur/fleur/typings/Operations'

type Disposer = (() => void) | void

interface KeepAliveOperation<T extends any[]> {
  (context: OperationContext, ...args: T): Promise<void>
  dispose: Operation
}

interface Operator {
  (context: OperationContext, ...args: any[]): Promise<Disposer> | Disposer
}

export const keepAliveOperation = <O extends Operator>(operator: O) => {
  let disposer: (() => void) | void
  let alived = false

  const operation: KeepAliveOperation<OperationArgs<O>> = async (
    context: OperationContext,
    ...args: OperationArgs<O>
  ) => {
    if (alived) return
    disposer = await operator(context, ...args)
    alived = true
  }

  operation.dispose = async () => {
    await (disposer && disposer())
    alived = false
  }

  return operation
}
