import * as Delir from 'delir-core'
import * as React from 'react'
import { ChromePicker } from 'react-color'

import AppActions from '../../actions/App'

import DragNumberInput from '../components/drag-number-input'
import Dropdown from '../components/dropdown'

import t from './_DelirValueInput.i18n'
import * as s from './delir-value-input.styl'

interface DelirValueInputProps {
    assets: Delir.Project.Asset[] | null
    descriptor: Delir.AnyParameterTypeDescriptor,
    value: string | number | boolean | {assetId: string} | Delir.Values.Point2D | Delir.Values.Point3D | Delir.Values.ColorRGB | Delir.Values.ColorRGBA
    onChange: (desc: Delir.AnyParameterTypeDescriptor, value: any) => void
}

export default class DelirValueInput extends React.PureComponent<DelirValueInputProps, any>
{

    public state = {
        value: this.props.value,
    }
    private ref: {
        numberInput?: DragNumberInput,
        propX?: DragNumberInput,
        propY?: DragNumberInput,
        propZ?: DragNumberInput,
        propWidth?: DragNumberInput,
        propHeight?: DragNumberInput,
        propDepth?: DragNumberInput,
        colorPicker?: ChromePicker,
        checkbox?: HTMLInputElement,
        textArea?: HTMLTextAreaElement,
        enumSelect?: HTMLSelectElement,
        assetSelect?: HTMLSelectElement,

        textSummary?: HTMLInputElement
        textInputDropdown?: Dropdown

        colorPickerDropdown?: Dropdown
    } = {}

    public componentWillReceiveProps(nextProps: Readonly<DelirValueInputProps>, nextContext: any)
    {
        if (this.props.value !== nextProps.value) {
            setTimeout(() => this.setState({value: nextProps.value}), 0)
        }
    }

    public render()
    {
        const {descriptor, assets} = this.props
        const {value} = this.state
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
                            backgroundColor: (value as Delir.Values.ColorRGBA).toString()
                        }}
                        onClick={this.openColorPicker}
                    />,
                    <Dropdown ref={this.bindColorPickerDropdown} className={s.colorPickerContainer}>
                        <button className={s.colorPickerCloser} onClick={this.closeColorPicker}>Close</button>
                        <ChromePicker ref={this.bindColorPicker} color={value.toString()} onChange={this.valueChanged} disableAlpha={descriptor.type === 'COLOR_RGB'} />
                    </Dropdown>
                ]
                break

            case 'BOOL':
                component = [<input ref={this.bindCheckbox} type='checkbox' className={s.checkbox} checked={value as boolean} onChange={this.valueChanged} />]
                break

            case 'STRING':
                component = [
                    <Dropdown ref={this.bindTextInputDropdown}>
                        <textarea ref={this.bindTextArea} className={s.textArea} onKeyDown={this.onKeydownTextArea} defaultValue={value as string} />
                    </Dropdown>,
                    <input ref={this.bindTextSummary} type='text' className={s.textInput} onFocus={this.onFocusTextInput} value={value as string} readOnly />
                ]
                break

            case 'FLOAT':
            case 'NUMBER':
                component = [<DragNumberInput ref={this.bindNumberInput} value={value as number} onChange={this.valueChanged} allowFloat={descriptor.type === 'FLOAT'} />]
                break

            case 'FLOAT':
            case 'CLIP':
            case 'PULSE':
                component = []
                break

            case 'ENUM':
                component = [
                    <select ref={this.bindEnumSelect} value={value ? (value as string) : ''} onChange={this.valueChanged}>
                        <option></option>
                        {descriptor.selection.map(item => <option value={item}>{item}</option>)}
                    </select>
                ]
                break

            case 'ASSET': {
                const acceptedAssets = assets.filter(asset => descriptor.extensions.includes(asset.fileType))

                component = [
                    <select ref={this.bindAssetSelect} value={value ? (value as {assetId: string}).assetId! : undefined} onChange={this.valueChanged}>
                        {acceptedAssets.length === 0 && (
                            <option selected disabled>{t('asset.empty')}</option>
                        )}
                        {acceptedAssets.length > 0 && ([
                            <option />,
                            ...acceptedAssets.map(asset => (<option value={asset.id as string}>{asset.name}</option>))
                        ])}
                    </select>
                ]
                break
            }

            case 'ARRAY':
            default:
                component = []
        }

        // destruct component list to make function `ref` property
        return (
            <div>
                {...component}
            </div>
        )
    }

    private valueChanged = () =>
    {
        const {descriptor} = this.props

        switch (descriptor.type) {
        //     case 'POINT_2D': {
        //         const {propX, propY} = this.ref
        //         this.props.onChange(descriptor, new Delir.Values.Point2D(propX.value, propY.value))
        //         break
        //     }

        //     case 'POINT_3D': {
        //         const {propX, propY, propZ} = this.ref
        //         this.props.onChange(descriptor, new Delir.Values.Point3D(propX.value, propY.value, propZ.value))
        //         break
        //     }

        //     case 'SIZE_2D': {
        //         const {propWidth, propHeight} = this.ref
        //         this.props.onChange(descriptor, new Delir.Values.Size2D(propWidth.value, propHeight.value))
        //         break
        //     }

        //     case 'SIZE_3D': {
        //         const {propWidth, propHeight, propDepth} = this.ref
        //         this.props.onChange(descriptor, new Delir.Values.Size3D(propWidth.value, propHeight.value, propDepth.value))
        //         break
        //     }

            case 'COLOR_RGB': {
                const {colorPicker} = this.ref
                const rgb = colorPicker.state.rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGB(rgb.r, rgb.g, rgb.b))
                break
            }

            case 'COLOR_RGBA': {
                const {colorPicker} = this.ref
                const rgba = colorPicker.state.rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGBA(rgba.r, rgba.g, rgba.b, rgba.a))
                break
            }

            case 'ENUM': {
                const {enumSelect} = this.ref
                this.props.onChange(descriptor, enumSelect.value)
                break
            }

            case 'ASSET': {
                const {assetSelect} = this.ref
                const newAsset = Array.from(this.props.assets!).find(asset => asset.id! === assetSelect.value) || null
                this.props.onChange(descriptor, newAsset)
                break
            }

            case 'BOOL': {
                const {checkbox} = this.ref
                checkbox.checked = !this.props.value
                this.props.onChange(descriptor, !this.props.value)
                break
            }

            case 'STRING': {
                const {textArea} = this.ref
                this.props.onChange(descriptor, textArea.value)
                break
            }

            case 'FLOAT':
            case 'NUMBER': {
                const input = this.ref.numberInput
                this.props.onChange(descriptor, input.value)
                break
            }
        }
    }

    private onFocusTextInput = (e: React.FocusEvent<HTMLInputElement>) =>
    {
        e.preventDefault()
        e.stopPropagation()
        this.ref.textInputDropdown.show(() => {
            setTimeout(() => this.ref.textArea.focus(), 0)
        })
    }

    private onKeydownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) =>
    {
        if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'Enter') {
            this.ref.textInputDropdown.hide()
            this.valueChanged()
        }
    }

    private openColorPicker = (e: React.MouseEvent<HTMLButtonElement>) =>
    {
        const {colorPickerDropdown} = this.ref
        colorPickerDropdown.show()

        e.preventDefault()
        e.stopPropagation()
    }

    private closeColorPicker = (e: React.KeyboardEvent<HTMLDivElement>) =>
    {
        const {colorPickerDropdown} = this.ref
        colorPickerDropdown.hide()
        this.valueChanged()

        e.preventDefault()
        e.stopPropagation()
    }

    private bindColorPickerDropdown = el => { this.ref.colorPickerDropdown = el }
    private bindColorPicker = el => { this.ref.colorPicker = el }
    private bindCheckbox = el => { this.ref.checkbox = el }
    private bindTextInputDropdown = el => { this.ref.textInputDropdown = el }
    private bindTextArea = el => { this.ref.textArea = el }
    private bindTextSummary = el => { this.ref.textSummary = el }
    private bindNumberInput = el => { this.ref.numberInput = el }
    private bindEnumSelect = el => { this.ref.enumSelect = el }
    private bindAssetSelect = el => { this.ref.assetSelect = el }
}
