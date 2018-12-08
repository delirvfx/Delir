import * as classnames from 'classnames'
import * as React from 'react'

import { propsToDataset } from '../utils/propsToDataset'

interface Props {
    className?: string
    name?: string
    defaultValue?: string
    placeholder?: string
    onChange?: (value: string, dataset: object) => void
    doubleClickToEdit?: boolean
}

interface State {
    readOnly: boolean
    value: string | undefined
}

export default class LabelInput extends React.Component<Props, State> {
    public static defaultProps = {
        doubleClickToEdit: false,
    }

    public state: State = {
        readOnly: true,
        value: this.props.defaultValue,
    }

    private inputRef = React.createRef<HTMLInputElement>()

    public componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevProps.defaultValue !== this.props.defaultValue) {
            this.setState({ value: this.props.defaultValue })
        }
    }

    public enableAndFocus() {
        this.setState({ readOnly: false })
        this.inputRef.current!.focus()
        this.inputRef.current!.select()
    }

    public render() {
        const { className, name, placeholder } = this.props
        const { value, readOnly } = this.state

        return (
            <input
                ref={this.inputRef}
                type='text'
                tabIndex={-1}
                className={classnames('_label-input', className)}
                name={name}
                value={value}
                placeholder={placeholder}
                readOnly={readOnly}
                onChange={this.valueChanged}
                onKeyDown={this.onKeyDown}
                onBlur={this.onBlur}
                onDoubleClick={this.onDoubleClick}
            />
        )
    }

    private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { onChange, defaultValue } = this.props
        const input = this.inputRef.current!
        const dataset = propsToDataset(this.props)

        if (e.key === 'Enter' && !(e.nativeEvent as any).isComposing) {
            if (this.state.readOnly) {
                this.enableAndFocus()
            } else {
                onChange && onChange(input.value, dataset)
                this.setState({ readOnly: true, value: input.value })
            }
        } else if (e.key === 'Escape') {
            onChange && onChange(input.value, dataset)
            this.setState({ readOnly: true, value: defaultValue || '' })
        }
    }

    private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (this.state.readOnly) return

        const dataset = propsToDataset(this.props)
        this.props.onChange && this.props.onChange(this.inputRef.current!.value, dataset)
        this.setState({ readOnly: true })
    }

    private onDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        if (!this.props.doubleClickToEdit) return

        e.preventDefault()
        e.stopPropagation()

        this.setState({ readOnly: false })
        this.inputRef.current!.focus()
        this.inputRef.current!.select()
    }

    private valueChanged = () => {
        this.setState({ value: this.inputRef.current!.value })
    }
}
