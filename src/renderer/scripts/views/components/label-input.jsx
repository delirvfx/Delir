import React, {PropTypes} from 'react'
import classnames from 'classnames'

export default class LabelInput extends React.Component
{
    static propTypes = {
        className: PropTypes.string,
        defaultValue: PropTypes.string,
        placeholder: PropTypes.string,
        onChange: PropTypes.func,
        doubleClickToEdit: PropTypes.bool,
    }

    static defaultProps = {
        doubleClickToEdit: false,
    }

    constructor(...args)
    {
        super(...args)

        this.state = {
            readOnly: true,
            value: this.props.defaultValue
        }
    }

    enableAndFocus()
    {
        this.setState({readOnly: false})
        this.refs.input.focus()
        this.refs.input.select()
    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (this.state.readOnly) {
                this.enableAndFocus()
            } else {
                this.props.onChange && this.props.onChange(this.refs.input.value)
                this.setState({readOnly: true})
            }
        } else if (e.key === 'Escape') {
            this.refs.input.value = this.props.defaultValue
            this.props.onChange && this.props.onChange(this.refs.input.value)
            this.setState({readOnly: true})
        }
    }

    onBlur = (e) => {
        this.props.onChange && this.props.onChange(this.refs.input.value)
        this.setState({readOnly: true})
    }

    onDoubleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()

        this.setState({readOnly: false})
        this.refs.input.focus()
        this.refs.input.select()
    }

    render()
    {
        return (
            <input
                ref='input'
                type='text'
                tabIndex='-1'
                className={classnames('_label-input', this.props.className)}
                defaultValue={this.state.value}
                placeholder={this.props.placeholder}
                readOnly={this.state.readOnly}
                onKeyDown={this.onKeyDown}
                onBlur={this.onBlur}
                onDoubleClick={this.props.doubleClickToEdit && this.onDoubleClick}
            />
        )
    }
}
