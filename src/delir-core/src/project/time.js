// @flow
export default class Time
{
    static fromJSON(time: Object)
    {
        return new Time(
            time.hour,
            time.minutes,
            time.seconds,
            time.frame,
        )
    }

    hour: number
    minutes: number
    seconds: number
    frame: number

    constructor(
        hour: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        frame: number = 0
    ) {
        this.hour = hour
        this.minutes = minutes
        this.seconds = seconds
        this.frame = frame
    }

    // setHour(value: number): Time
    // {
    //     return Object.assign(new Time, this, {_hour: value})
    // }
    //
    // setMinute(value: number): Time
    // {
    //     if (value >= 60)
    //     return Object.assign(new Time, this, {_hour: value})
    // }

    toJSON()
    {
        return {
            hour: this.hour,
            minutes: this.minutes,
            seconds: this.seconds,
            frame: this.frame,
        }
    }
}
