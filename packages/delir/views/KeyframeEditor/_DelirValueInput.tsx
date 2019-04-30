import * as Delir from '@delirvfx/core'
import * as React from 'react'
import { ChromePicker } from 'react-color'

import DragNumberInput from '../../components/drag-number-input'
import Dropdown from '../../components/dropdown'

import t from './_DelirValueInput.i18n'
import * as s from './delir-value-input.styl'

interface DelirValueInputProps {
    assets: ReadonlyArray<Delir.Entity.Asset> | null
    descriptor: Delir.AnyParameterTypeDescriptor
    value: Delir.Entity.KeyframeValueTypes
    onChange: (desc: Delir.AnyParameterTypeDescriptor, value: Delir.Entity.KeyframeValueTypes) => void
}

export default class DelirValueInput extends React.PureComponent<DelirValueInputProps, any> {
    public state = {
        value: this.props.value,
    }
    private ref = {
        numberInput: React.createRef<DragNumberInput>(),
        propX: React.createRef<DragNumberInput>(),
        propY: React.createRef<DragNumberInput>(),
        propZ: React.createRef<DragNumberInput>(),
        propWidth: React.createRef<DragNumberInput>(),
        propHeight: React.createRef<DragNumberInput>(),
        propDepth: React.createRef<DragNumberInput>(),
        colorPicker: React.createRef<ChromePicker>(),
        checkbox: React.createRef<HTMLInputElement>(),
        textArea: React.createRef<HTMLTextAreaElement>(),
        enumSelect: React.createRef<HTMLSelectElement>(),
        assetSelect: React.createRef<HTMLSelectElement>(),

        textSummary: React.createRef<HTMLInputElement>(),
        textInputDropdown: React.createRef<Dropdown>(),

        colorPickerDropdown: React.createRef<Dropdown>(),
    }

    public componentWillReceiveProps(nextProps: Readonly<DelirValueInputProps>, nextContext: any) {
        if (this.props.value !== nextProps.value) {
            setTimeout(() => this.setState({ value: nextProps.value }), 0)
        }
    }

    public render() {
        const { descriptor, assets } = this.props
        const { value } = this.state
        let component: JSX.Element | null
        switch (descriptor.type) {
            // case 'POINT_2D':
            //     component = [
            //         <DragNumberInput ref='propX' value={value.x} onChange={this.valueChanged} />,
            //         <span className='separator'>,</span>,
            //         <DragNumberInput ref='propY' value={value.y} onChange={this.valueChanged} />
            //     ]
            //     break
            // case 'POINT_3D':
            //     component = [
            //         <DragNumberInput ref='propX' value={value.x} onChange={this.valueChanged} />,
            //         <span className='separator'>,</span>,
            //         <DragNumberInput ref='propY' value={value.y} onChange={this.valueChanged} />,
            //         <span className='separator'>,</span>,
            //         <DragNumberInput ref='propZ' value={value.z} onChange={this.valueChanged} />
            //     ]
            //     break
            // case 'SIZE_2D':
            //     component = [
            //         <DragNumberInput ref='propWidth' value={value.width} onChange={this.valueChanged} />,
            //         <span className='separator'>x</span>,
            //         <DragNumberInput ref='propHeight' value={value.height} onChange={this.valueChanged} />
            //     ]
            //     break
            // case 'SIZE_3D':
            //     component = [
            //         <DragNumberInput ref='propWidth' onChange={this.valueChanged} />,
            //         <span className='separator'>x</span>,
            //         <DragNumberInput ref='propHeight' onChange={this.valueChanged} />,
            //         <span className='separator'>x</span>,
            //         <DragNumberInput ref='propDepth' onChange={this.valueChanged} />
            //     ]
            //     break

            case 'COLOR_RGB':
            case 'COLOR_RGBA':
                component = (
                    <>
                        <button
                            className={s.colorPickerOpenner}
                            style={{
                                backgroundColor: (value as Delir.Values.ColorRGBA).toString(),
                            }}
                            onClick={this.openColorPicker}
                        />
                        <Dropdown ref={this.ref.colorPickerDropdown} className={s.colorPickerContainer}>
                            <button className={s.colorPickerCloser} onClick={this.closeColorPicker}>
                                Close
                            </button>
                            <ChromePicker
                                ref={this.ref.colorPicker}
                                color={
                                    value
                                        ? '#000'
                                        : ((value as unknown) as Delir.Values.ColorRGB | Delir.Values.ColorRGBA)
                                }
                                disableAlpha={descriptor.type === 'COLOR_RGB'}
                            />
                        </Dropdown>
                    </>
                )
                break

            case 'BOOL':
                component = (
                    <input
                        ref={this.ref.checkbox}
                        type="checkbox"
                        className={s.checkbox}
                        checked={value as boolean}
                        onChange={this.valueChanged}
                    />
                )
                break

            case 'STRING':
                component = (
                    <>
                        <Dropdown ref={this.ref.textInputDropdown}>
                            <textarea
                                ref={this.ref.textArea}
                                className={s.textArea}
                                onKeyDown={this.onKeydownTextArea}
                                defaultValue={value as string}
                            />
                        </Dropdown>
                        <input
                            ref={this.ref.textSummary}
                            type="text"
                            className={s.textInput}
                            onFocus={this.onFocusTextInput}
                            value={value as string}
                            readOnly
                        />
                    </>
                )
                break

            case 'FLOAT':
            case 'NUMBER':
                component = (
                    <DragNumberInput
                        ref={this.ref.numberInput}
                        value={value as number}
                        onChange={this.valueChanged}
                        allowFloat={descriptor.type === 'FLOAT'}
                    />
                )
                break

            case 'FLOAT':
                // case 'CLIP':
                // case 'PULSE':
                component = <></>
                break

            case 'ENUM':
                component = (
                    <>
                        <select
                            ref={this.ref.enumSelect}
                            value={value ? (value as string) : ''}
                            onChange={this.valueChanged}
                        >
                            <option />
                            {descriptor.selection.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </>
                )
                break

            case 'ASSET': {
                const acceptedAssets = assets!.filter(asset => descriptor.extensions.includes(asset.fileType))
                const valueAssetId = value ? (value as Delir.Values.AssetPointer).assetId : ''

                component = (
                    <>
                        <select ref={this.ref.assetSelect} onChange={this.valueChanged}>
                            {acceptedAssets.length === 0 && (
                                <option selected disabled>
                                    {t(t.k.asset.empty)}
                                </option>
                            )}
                            {acceptedAssets.length > 0 && (
                                <>
                                    <option />
                                    {...acceptedAssets.map(asset => (
                                        <option key={asset.id} value={asset.id} selected={asset.id === valueAssetId}>
                                            {asset.name}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </>
                )
                break
            }

            case 'CODE':
                component = null
                break

            // case 'ARRAY':
            default:
                component = <></>
        }

        // destruct component list to make function `ref` property
        return <>{component}</>
    }

    private valueChanged = () => {
        const { descriptor } = this.props

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
                const { colorPicker } = this.ref
                // FIXME: Use onChange handler argument
                const rgb = (colorPicker.current!.state as any).rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGB(rgb.r, rgb.g, rgb.b))
                break
            }

            case 'COLOR_RGBA': {
                const { colorPicker } = this.ref
                // FIXME: Use onChange handler argument
                const rgba = (colorPicker.current!.state as any).rgb
                this.props.onChange(descriptor, new Delir.Values.ColorRGBA(rgba.r, rgba.g, rgba.b, rgba.a))
                break
            }

            case 'ENUM': {
                const { enumSelect } = this.ref
                this.props.onChange(descriptor, enumSelect.current!.value)
                break
            }

            case 'ASSET': {
                const { assetSelect } = this.ref
                const assetPointer = assetSelect.current!.value !== '' ? { assetId: assetSelect.current!.value } : null
                this.props.onChange(descriptor, assetPointer)
                break
            }

            case 'BOOL': {
                const { checkbox } = this.ref
                checkbox.current!.checked = !this.props.value
                this.props.onChange(descriptor, !this.props.value)
                break
            }

            case 'STRING': {
                const { textArea } = this.ref
                this.props.onChange(descriptor, textArea.current!.value)
                break
            }

            case 'FLOAT':
            case 'NUMBER': {
                const input = this.ref.numberInput
                this.props.onChange(descriptor, input.current!.value)
                break
            }
        }
    }

    private onFocusTextInput = (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault()
        e.stopPropagation()
        this.ref.textInputDropdown.current!.show(() => {
            setTimeout(() => this.ref.textArea.current!.focus(), 0)
        })
    }

    private onKeydownTextArea = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey === true || e.ctrlKey === true) && e.key === 'Enter') {
            this.ref.textInputDropdown.current!.hide()
            this.valueChanged()
        }
    }

    private openColorPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { colorPickerDropdown } = this.ref
        colorPickerDropdown.current!.show()

        e.preventDefault()
        e.stopPropagation()
    }

    private closeColorPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { colorPickerDropdown } = this.ref
        colorPickerDropdown.current!.hide()
        this.valueChanged()

        e.preventDefault()
        e.stopPropagation()
    }
}
