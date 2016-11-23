// @flow
export class ColorRGB {
    _red: number
    _green: number
    _blue: number

    constructor(
        r: number = 0,
        g: number = 0,
        b: number = 0,
    ) {
        this._red    = r
        this._green  = g
        this._blue   = b
    }

    get r(): number { return this._red }
    get g(): number { return this._green }
    get b(): number { return this._blue }

    clone(
        r: ?number = null,
        g: ?number = null,
        b: ?number = null,
    ): ColorRGB
    {
        return new ColorRGB(
            r || this.r,
            g || this.g,
            b || this.b,
        )
    }

    toJSON()
    {
        return {
            red: this.r,
            green: this.g,
            blue: this.b,
        }
    }

    toString()
    {
        return `rgba(${this.r}, ${this.g}, ${this.b}, 1)`
    }
}
