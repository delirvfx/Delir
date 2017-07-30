export interface ExpressionJSON {
    language: string
    code: string
}

export default class Expression {
    constructor(
        public language: string,
        public code: string,
    ) {}

    public toJSON()
    {
        return {
            language: this.language,
            code: this.code,
        }
    }
}
