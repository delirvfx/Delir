export interface ExpressionJSON {
    language: string
    code: string
}

export default class Expression {
    public static fromJSON(json: ExpressionJSON) {
        return new Expression(json.language, json.code)
    }

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
