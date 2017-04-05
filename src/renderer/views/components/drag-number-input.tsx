import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as classnames from 'classnames'

interface DragNumberInputProps {
    className?: string
    min?: number
    max?: number
    name?: string
    defaultValue?: string|number
    disabled?: boolean
    allowFloat?: boolean
    onChange?: (value: number) => any
    doubleClickToEdit?: boolean
}

interface DragNumberInputState {
    value: number|string
    readOnly: boolean
    valueChanged: boolean
}

export default class DragNumberInput extends React.Component<DragNumberInputProps, DragNumberInputState>
{
    static propTypes = {
        className: PropTypes.string,
        data: PropTypes.object,
        min: PropTypes.number,
        max: PropTypes.number,
        name: PropTypes.string,
        defaultValue: PropTypes.number,
        disabled: PropTypes.bool,
        allowFloat: PropTypes.bool,
        onChange: PropTypes.func,
        doubleClickToEdit: PropTypes.bool,
    }

    static defaultProps = {
        allowFloat: false,
        disabled: false,
        doubleClickToEdit: false,
    }

    refs: {
        input: HTMLInputElement
    }

    state = {
        readOnly: false,
        value: this.props.defaultValue != null ? this.props.defaultValue : 0,
        valueChanged: false,
    }

    get value(): number { return +this.state.value }

    componentDidMount()
    {
        this.refs.input.onpointerlockerror = e => console.error(e)
    }

    componentWillReceiveProps(nextProps: DragNumberInputProps)
    {
        if (!this.state.valueChanged) {
            this.setState({value: nextProps.defaultValue})
        }

        this.setState({valueChanged: this.state.value !== this.props.defaultValue})
    }

    enableAndFocus()
    {
        this.setState({readOnly: false})
        this.refs.input.focus()
    }

    onKeyDown = (e: KeyboardEvent) => {
        const {onChange} = this.props

        if (e.key === 'Enter') {
            if (this.state.readOnly) {
                this.enableAndFocus()
            } else {
                const value = this._parseValue(this.refs.input.value)
                this.setState({value}, () => onChange && onChange(value))
            }
        } else if (e.key === 'Escape') {
            this.refs.input.value = (this.props.defaultValue as string || '0')
            this.setState({readOnly: true, value: this.props.defaultValue}, () => onChange && onChange(this.refs.input.value))
        } else if (e.key === 'ArrowUp') {
            const value = this._parseValue(this.refs.input.value) + 1
            this.setState({value})
        } else if (e.key === 'ArrowDown') {
            const value = this._parseValue(this.refs.input.value) - 1
            this.setState({value})
        }
    }

    onBlur = (e: FocusEvent) =>
    {
        if (this.state.readOnly) return

        const value = this._parseValue(this.refs.input.value)
        this.props.onChange && this.props.onChange(value)
        this.setState({readOnly: true, value})
    }

    onMouseDown = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        e.currentTarget.requestPointerLock()
    }

    onMouseMove = (event: React.MouseEvent<HTMLSpanElement>) =>
    {
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

    onMouseUp = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        document.exitPointerLock()

        const {onChange} = this.props
        this.setState({valueChanged: this.state.value !== this.props.defaultValue}, () => onChange && onChange(this.state.value as number))
    }

    // TODO: parse and calculate expression
    valueChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.setState({value: e.target.value})
    }

    private _parseValue(rawValue: number|string): number
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

    render()
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
}
