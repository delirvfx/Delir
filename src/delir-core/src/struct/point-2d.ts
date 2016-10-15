export class Point2D {
    private _x: Number;
    private _y: Number;

    constructor(
        x: Number,
        y: Number
    ) {
        this._x = x;
        this._y = y;
    }

    get x(): Number { return this._x; }
    get y(): Number { return this._y; }
}
