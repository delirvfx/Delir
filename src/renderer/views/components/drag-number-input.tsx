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
    value: number
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
        input: HTMLSpanElement
    }

    state = {
        readOnly: false,
        value: this.props.defaultValue != null ? this.props.defaultValue : 0,
        valueChanged: false,
    }

    get value(): number { return this.state.value as number }

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
        // this.refs.input.select()
    }

    // onKeyDown = (e: KeyboardEvent) => {
    //     if (e.key === 'Enter') {
    //         if (this.state.readOnly) {
    //             this.enableAndFocus()
    //         } else {
    //             this.props.onChange && this.props.onChange(this.refs.input.value)
    //             this.setState({value: this.refs.input.value})
    //         }
    //     } else if (e.key === 'Escape') {
    //         this.refs.input.value = this.props.defaultValue
    //         this.props.onChange && this.props.onChange(this.refs.input.value)
    //         this.setState({readOnly: true, value: this.props.defaultValue})
    //     }
    // }

    // onBlur = (e: FocusEvent) =>
    // {
    //     if (this.state.readOnly) return

    //     this.props.onChange && this.props.onChange(this.refs.input.value)
    //     this.setState({readOnly: true})
    // }

    onMouseDown = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        e.target.requestPointerLock()
        // e.dataTransfer.effectAllowed = 'none'
        // e.dataTransfer.setDragImage(this.state.dummyImage, 0, 0)
    }

    onMouseMove = (event: React.MouseEvent<HTMLSpanElement>) =>
    {
        const e = event.nativeEvent as MouseEvent
        if (e.which !== 1) return // not mouse left pressed

        let weight = 0.3
        let value

        if (e.ctrlKey) {
            weight = 0.05
        } else if (e.shiftKey) {
            weight = 2
        }

        value = this.state.value + e.movementX * weight

        if (! this.props.allowFloat) {
            value = value|0
        }

        this.setState({value})
    }

    onMouseUp = (e: React.MouseEvent<HTMLSpanElement>) =>
    {
        document.exitPointerLock()

        const {onChange} = this.props
        onChange && onChange(this.state.value)
        this.setState({valueChanged: this.state.value !== this.props.defaultValue})
    }

    // TODO: parse and calculate expression
    valueChanged = (e: Event) => {}

    render()
    {
        return (
            <span
                ref='input'
                tabIndex={-1}
                className={classnames('_drag-number-input', this.props.className)}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            >
                {this.state.value}
            </span>
        )
    }
}
