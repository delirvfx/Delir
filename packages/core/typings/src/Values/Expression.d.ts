export interface ExpressionJSON {
    language: string
    code: string
}
export default class Expression {
    public static fromJSON(json: ExpressionJSON): Expression
    public language: string
    public code: string
    constructor(language: string, code: string)
    public toJSON(): {
        language: string
        code: string
    }
}
