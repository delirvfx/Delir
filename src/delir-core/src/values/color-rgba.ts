export interface ColorRgbaJSON {
    red: number
    green: number
    blue: number
    alpha: number
}

export default class ColorRGBA {
    public static fromJSON(json: ColorRgbaJSON)
    {
        return new ColorRGBA(json.red, json.green, json.blue, json.alpha)
    }

    private _red: number
    private _green: number
    private _blue: number
    private _alpha: number

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
        a: number = 0
    ) {
        this._red    = r
        this._green  = g
        this._blue   = b
        this._alpha  = a
    }

    get r(): number { return this._red }
    get g(): number { return this._green }
    get b(): number { return this._blue }
    get a(): number { return this._alpha }

    get red(): number { return this._red }
    get green(): number { return this._green }
    get blue(): number { return this._blue }
    get alpha(): number { return this._alpha }

    public clone(
        r: number | null = null,
        g: number | null = null,
        b: number | null = null,
        a: number | null = null,
    ): ColorRGBA
    {
        return new ColorRGBA(
            r || this.r,
            g || this.g,
            b || this.b,
            a || this.a,
        )
    }

    public toJSON(): ColorRgbaJSON
    {
        return {
            red: this.r,
            green: this.g,
            blue: this.b,
            alpha: this.a,
        }
    }

    public toCSSColor()
    {
        return `rgba(${this.r | 0}, ${this.g | 0}, ${this.b | 0}, ${this.a})`
    }

    /**
     * @deprecated
     */
    public toString()
    {
        return `rgba(${this.r | 0}, ${this.g | 0}, ${this.b | 0}, ${this.a})`
    }
}
