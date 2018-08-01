import * as classnames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import * as Platform from '../../utils/platform'

interface DragNumberInputProps {
    className?: string
    min?: number
    max?: number
    name?: string
    value?: string | number
    disabled?: boolean
    allowFloat?: boolean
    onChange?: (value: number) => any
    doubleClickToEdit?: boolean
}

interface DragNumberInputState {
    value: number | string
    valueChanged: boolean
}

export default class DragNumberInput extends React.Component<DragNumberInputProps, DragNumberInputState>
{

    public get value(): number { return +this.state.value }
    public static defaultProps = {
        allowFloat: false,
        disabled: false,
        doubleClickToEdit: false,
    }

    public refs: {
        input: HTMLInputElement
    }

    public state = {
        value: this.props.value != null ? this.props.value : 0,
        valueChanged: false,
    }

    public componentDidMount()
    {
        this.refs.input.onpointerlockerror = e => console.error(e)
    }

    // FIXME: Follow React 16.3
    public componentWillReceiveProps(nextProps: DragNumberInputProps)
    {
        this.setState({value: nextProps.value!})
    }

    public render()
    {
        return (
            <input
                ref='input'
                type='text'
                className={classnames('_drag-number-input', this.props.className)}
                value={this.state.value}
                onBlur={this.onBlur}
                onChange={this.valueChanged}
                onKeyDown={this.onKeyDown}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            />
        )
    }

    private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
    {
        const {onChange} = this.props
        const {input} = this.refs

        if (e.key === 'Enter') {
            const value = this._parseValue(this.refs.input.value)
            this.setState({value}, () => onChange && onChange(value))
            window.requestIdleCallback(() => this.refs.input.blur())
        } else if (e.key === 'Escape') {
            input.value = (this.props.value as string || '0')
            input.blur()
            this.setState({value: +this.props.value!})
        } else if (e.key === 'ArrowUp') {
            const value = this._parseValue(this.refs.input.value) + 1
            this.setState({value})
        } else if (e.key === 'ArrowDown') {
            const value = this._parseValue(this.refs.input.value) - 1
            this.setState({value})
        }
    }

    private onBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    {
        const value = this._parseValue(this.refs.input.value)
        this.props.onChange && this.props.onChange(value)
        this.setState({value})
    }

    private onMouseDown = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        // MouseEvent#movement is buggy on Windows. Disable modification by drag.
        if (Platform.isWindows()) return

        e.currentTarget.requestPointerLock()
    }

    private onMouseMove = (event: React.MouseEvent<HTMLSpanElement>) =>
    {
        // MouseEvent#movement is buggy on Windows. Disable modification by drag.
        if (Platform.isWindows()) return

        const e = event.nativeEvent as MouseEvent
        if (e.which !== 1) return // not mouse left pressed

        let weight = 0.3

        if (e.ctrlKey) {
            weight = 0.05
        } else if (e.shiftKey) {
            weight = 2
        }

        let value = this._parseValue(this.refs.input.value) + e.movementX * weight
        this.setState({value: this._parseValue(value)})
    }

    private onMouseUp = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        // MouseEvent#movement is buggy on Windows. Disable modification by drag.
        if (Platform.isWindows()) return

        document.exitPointerLock()

        const {onChange} = this.props
        const value = this._parseValue(this.refs.input.value)
        this.setState({value}, () => onChange && onChange(value))
    }

    // TODO: parse and calculate expression
    private valueChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.setState({value: e.target.value})
    }

    private _parseValue(rawValue: number | string): number
    {
        const parsedValue = parseFloat(rawValue as string)
        let value = _.isNaN(parsedValue) ? 0 : parsedValue

        if (! this.props.allowFloat) {
            value = value | 0
        } else {
            value = ((value * 100) | 0) / 100
        }

        return value
    }
}
