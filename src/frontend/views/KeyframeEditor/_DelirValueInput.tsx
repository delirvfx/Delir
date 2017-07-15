import * as React from 'react'
import {Component} from 'react'
import * as PropTypes from 'prop-types'
import * as Delir from 'delir-core'
import {ChromePicker} from 'react-color'

import AppActions from '../../actions/App'

import DragNumberInput from '../components/drag-number-input'
import Dropdown from '../components/dropdown'

import * as s from './delir-value-input.styl'

interface DelirValueInputProps {
    assets: Set<Delir.Project.Asset>|null
    descriptor: Delir.AnyParameterTypeDescriptor,
    value: string|number|boolean|{assetId: string}|Delir.Values.Point2D|Delir.Values.Point3D|Delir.Values.ColorRGB|Delir.Values.ColorRGBA
    onChange: (desc: Delir.AnyParameterTypeDescriptor, value: any) => void
}

export default class DelirValueInput extends Component<DelirValueInputProps, any>
{
    static propTypes = {
        descriptors: PropTypes.arrayOf(
            PropTypes.instanceOf(Delir.TypeDescriptor)
        ),
        value: PropTypes.any,
        onChange: PropTypes.func.isRequired,
    }

    refs: {
        input: DragNumberInput,
        propX: DragNumberInput,
        propY: DragNumberInput,
        propZ: DragNumberInput,
        propWidth: DragNumberInput,
        propHeight: DragNumberInput,
        propDepth: DragNumberInput,
        color: ChromePicker,
        checkbox: HTMLInputElement,
        textArea: HTMLTextAreaElement,
        enumSelect: HTMLSelectElement,
        assets: HTMLSelectElement,

        textSummary: HTMLInputElement
        textInputDropdown: Dropdown

        colorPickerDropdown: Dropdown
    }

    state = {
        value: this.props.value,
    }

    componentWillReceiveProps(nextProps: Readonly<DelirValueInputProps>, nextContext: any)
    {
        if (this.props.value !== nextProps.value) {
            setTimeout(() => this.setState({value: nextProps.value}), 0)
        }
    }

    valueChanged = () =>
    {
        const {descriptor} = this.props

        switch (descriptor.type) {
        //     case 'POINT_2D': {
        //         const {propX, propY} = this.refs
        //         this.props.onChange(descriptor, new Delir.Values.Point2D(propX.value, propY.value))
        //         break
        //     }

        //     case 'POINT_3D': {
        //         const {propX, propY, propZ} = this.refs
        //         this.props.onChange(descriptor, new Delir.Values.Point3D(propX.value, propY.value, propZ.value))
        //         break
        //     }

        //     case 'SIZE_2D': {
        //         const {propWidth, propHeight} = this.refs
        //         this.props.onChange(descriptor, new Delir.Values.Size2D(propWidth.value, propHeight.value))
        //         break
        //     }

        //     case 'SIZE_3D': {
        //         const {propWidth, propHeight, propDepth} = this.refs
        //         this.props.onChange(descriptor, new Delir.Values.Size3D(propWidth.value, propHeight.value, propDepth.value))
        //         break
        //     }

            case 'COLOR_RGB': {
                const {color} = this.refs
                const rgb = color.state.rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGB(rgb.r, rgb.g, rgb.b))
                break
            }

            case 'COLOR_RGBA': {
                const {color} = this.refs
                const rgba = color.state.rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGBA(rgba.r, rgba.g, rgba.b, rgba.a))
                break
            }

            case 'ENUM': {
                const {enumSelect} = this.refs
                this.props.onChange(descriptor, enumSelect.value)
                break
            }

            case 'ASSET': {
                const {assets} = this.refs
                const newAsset = Array.from(this.props.assets!).find(asset => asset.id! === assets.value) || null
                this.props.onChange(descriptor, newAsset)
                break
            }

            case 'BOOL': {
                const {checkbox} = this.refs
                checkbox.checked = !this.props.value
                this.props.onChange(descriptor, !this.props.value)
                break
            }

            case 'STRING': {
                const {textArea} = this.refs
                this.props.onChange(descriptor, textArea.value)
                break
            }

            case 'FLOAT':
            case 'NUMBER': {
                const input = this.refs.input
                this.props.onChange(descriptor, input.value)
                break
            }
        }
    }

    onFocusTextInput = (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()
        this.refs.textInputDropdown.show()
        this.refs.textArea.focus()
    }

    onKeydownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'Enter') {
            this.refs.textInputDropdown.hide()
            this.valueChanged()
        }
    }

    openColorPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
        const {colorPickerDropdown} = this.refs
        colorPickerDropdown.show()

        e.preventDefault()
        e.stopPropagation()
    }

    closeColorPicker = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const {colorPickerDropdown} = this.refs
        colorPickerDropdown.hide()
        this.valueChanged()

        e.preventDefault()
        e.stopPropagation()
    }

    render()
    {
        const {props: {descriptor, assets}, state: {value}} = this
        let component: JSX.Element[] = []

        switch (descriptor.type) {
        //     case 'POINT_2D':
        //         component = [
        //             <DragNumberInput ref='propX' value={value.x} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propY' value={value.y} onChange={this.valueChanged} />
        //         ]
        //         break
        //     case 'POINT_3D':
        //         component = [
        //             <DragNumberInput ref='propX' value={value.x} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propY' value={value.y} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propZ' value={value.z} onChange={this.valueChanged} />
        //         ]
        //         break
        //     case 'SIZE_2D':
        //         component = [
        //             <DragNumberInput ref='propWidth' value={value.width} onChange={this.valueChanged} />,
        //             <span className='separator'>x</span>,
        //             <DragNumberInput ref='propHeight' value={value.height} onChange={this.valueChanged} />
        //         ]
        //         break
        //     case 'SIZE_3D':
        //         component = [
        //             <DragNumberInput ref='propWidth' onChange={this.valueChanged} />,
        //             <span className='separator'>x</span>,
        //             <DragNumberInput ref='propHeight' onChange={this.valueChanged} />,
        //             <span className='separator'>x</span>,
        //             <DragNumberInput ref='propDepth' onChange={this.valueChanged} />
        //         ]
        //         break

            case 'COLOR_RGB':
            case 'COLOR_RGBA':
                component = [
                    <button
                        className={s.colorPickerOpenner}
                        style={{
                            backgroundColor: (value as Delir.ColorRGBA).toString()
                        }}
                        onClick={this.openColorPicker}
                    />,
                    <Dropdown ref='colorPickerDropdown' className={s.colorPickerContainer}>
                        <button className={s.colorPickerCloser} onClick={this.closeColorPicker}>Close</button>
                        <ChromePicker ref='color' color={value.toString()} onChange={this.valueChanged} disableAlpha={descriptor.type === 'COLOR_RGB'} />
                    </Dropdown>
                ]
                break

            case 'BOOL':
                component = [<input ref='checkbox' type='checkbox' className={s.checkbox} checked={value as boolean} onChange={this.valueChanged} />]
                break

            case 'STRING':
                component = [
                    <Dropdown ref='textInputDropdown'>
                        <textarea ref='textArea' className={s.textArea} onKeyDown={this.onKeydownTextArea} defaultValue={value as string} />
                    </Dropdown>,
                    <input ref='textSummary' type='text' className={s.textInput} onFocus={this.onFocusTextInput} value={value as string} readOnly />
                ]
                break

            case 'FLOAT':
            case 'NUMBER':
                component = [<DragNumberInput ref='input' value={value as number} onChange={this.valueChanged} allowFloat={descriptor.type === 'FLOAT'} />]
                break

            case 'FLOAT':
            case 'CLIP':
            case 'PULSE':
                component = []
                break

            case 'ENUM':
                component = [
                    <select ref='enumSelect' value={value ? (value as string) : ''} onChange={this.valueChanged}>
                        <option></option>
                        {descriptor.selection.map(item => <option value={item}>{item}</option>)}
                    </select>
                ]
                break

            case 'ASSET':
                component = [
                    <select ref='assets' value={value ? (value as {assetId: string}).assetId! : undefined} onChange={this.valueChanged}>
                        <option></option>
                        {!assets ? [] : Array.from(assets).map(asset => (
                            <option value={asset.id as string}>{asset.name}</option>
                        ))}
                    </select>
                ]
                break

            case 'ARRAY':
            default:
                component = []
        }

        // destruct component list to make function `ref` property
        return (
            <div ref='root'>
                {...component}
            </div>
        )
    }
}
