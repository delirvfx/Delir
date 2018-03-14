import { createContext, runInNewContext } from 'vm'
// import FrameContext from './FrameContext'

interface ExpressionVMOption {
    filename: string
}

interface GlobalScopeSource {
    // context: FrameContext
}

export default class ExpressionVM {
    public execute<Result = any>(
        code: string,
        sandbox: GlobalScopeSource,
        options: Partial<ExpressionVMOption> = {}
    ): Result {
        const context = createContext({ ...sandbox })
        return runInNewContext(code, context, { filename: options.filename })
    }
}
