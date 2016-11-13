// @flow
export default class Point2D
{
    _x: number
    _y: number

    constructor(
        x: number,
        y: number
    ) {
        this._x = x
        this._y = y
    }

    get x(): number { return this._x }
    get y(): number { return this._y }

    setX(newX: number)
    {
        return new Point2D(newX, this._y)
    }

    setY(newY: number)
    {
        return new Point2D(this._x, newY)
    }
}
