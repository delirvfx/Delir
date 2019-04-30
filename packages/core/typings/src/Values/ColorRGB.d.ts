export interface ColorRgbJSON {
    red: number
    green: number
    blue: number
}
export default class ColorRGB {
    public static fromJSON(json: ColorRgbJSON): ColorRGB
    public readonly r: number
    public readonly g: number
    public readonly b: number
    public readonly red: number
    public readonly green: number
    public readonly blue: number
    private _red
    private _green
    private _blue
    constructor(r?: number, g?: number, b?: number)
    public clone(r?: number | null, g?: number | null, b?: number | null): ColorRGB
    public toJSON(): ColorRgbJSON
    public toCSSColor(): string
    /**
     * @deprecated
     */
    public toString(): string
}
