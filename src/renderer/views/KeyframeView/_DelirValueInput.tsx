import * as React from 'react'
import {Component, PropTypes} from 'react'
import parseColor from 'parse-color'
import * as Delir from 'delir-core'

import EditorStateActions from '../../actions/editor-state-actions'

import DragNumberInput from '../components/drag-number-input'

import * as s from './delir-value-input.styl'

interface DelirValueInputProps {
    assets: Set<Delir.Project.Asset>|null
    descriptor: Delir.AnyParameterTypeDescriptor,
    value: string|number|boolean|Delir.Project.Asset|Delir.Values.Point2D|Delir.Values.Point3D
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
        color: HTMLInputElement,
        checkbox: HTMLInputElement,
        textarea: HTMLTextAreaElement,
        assets: HTMLSelectElement,
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

        //     case 'COLOR_RGB': {
        //         const {color} = this.refs
        //         const values = parseColor(color.value)
        //         this.props.onChange(descriptor, new Delir.Values.ColorRGB(
        //             values.rgb[0],
        //             values.rgb[1],
        //             values.rgb[2],
        //         ))
        //         break
        //     }

        //     case 'COLOR_RGBA': {
        //         const {color} = this.refs
        //         const values = parseColor(color.value)
        //         this.props.onChange(descriptor, new Delir.Values.ColorRGBA(
        //             values.rgb[0],
        //             values.rgb[1],
        //             values.rgb[2],
        //             values.rgb[3],
        //         ))
        //         break
        //     }

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

        //     case 'STRING': {
        //         const {textarea} = this.refs
        //         this.props.onChange(descriptor, textarea.value)
        //         break
        //     }

            case 'NUMBER': {
                const input = this.refs.input
                this.props.onChange(descriptor, input.value)
                break
            }
        }
    }

    render()
    {
        const {descriptor, value, assets} = this.props
        let component: JSX.Element[] = []

        switch (descriptor.type) {
        //     case 'POINT_2D':
        //         component = [
        //             <DragNumberInput ref='propX' defaultValue={value.x} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propY' defaultValue={value.y} onChange={this.valueChanged} />
        //         ]
        //         break
        //     case 'POINT_3D':
        //         component = [
        //             <DragNumberInput ref='propX' defaultValue={value.x} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propY' defaultValue={value.y} onChange={this.valueChanged} />,
        //             <span className='separator'>,</span>,
        //             <DragNumberInput ref='propZ' defaultValue={value.z} onChange={this.valueChanged} />
        //         ]
        //         break
        //     case 'SIZE_2D':
        //         component = [
        //             <DragNumberInput ref='propWidth' defaultValue={value.width} onChange={this.valueChanged} />,
        //             <span className='separator'>x</span>,
        //             <DragNumberInput ref='propHeight' defaultValue={value.height} onChange={this.valueChanged} />
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

        //     case 'COLOR_RGB':
        //         component = [<input ref='color' type='color' defaultValue='' />]
        //         break
        //     case 'COLOR_RGBA':
        //         component = [<input ref='color' type='color' defaultValue='' />]
        //         break

            case 'BOOL':
                component = [<input ref='checkbox' type='checkbox' className={s.checkbox} checked={value as boolean} onChange={this.valueChanged} />]
                break

        //     case 'STRING':
        //         component = [<textarea ref='textarea' />]
        //         break
            case 'NUMBER':
                component = [<DragNumberInput ref='input' defaultValue={value as number} onChange={this.valueChanged} />]
                break

            case 'FLOAT':
            case 'ENUM':
            case 'CLIP':
            case 'PULSE':
                component = []
                break

            case 'ASSET':
                component = [
                    <select ref='assets' defaultValue={value ? (value as Delir.Project.Asset).id! : undefined} onChange={this.valueChanged}>
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