import * as _ from 'lodash'
import * as React from 'react'
import {PropTypes} from 'react'
import * as Delir from 'delir-core'
import connectToStores from '../../utils/connectToStores'

import Workspace from '../components/workspace'
import Pane from '../components/pane'
import DragNumberInput from '../components/drag-number-input'
import SelectList from '../components/select-list'

import ProjectModifyActions from '../../actions/project-modify-actions'

import {default as EditorStateStore, EditorState} from '../../stores/editor-state-store'
import RendererService from '../../services/renderer'

import s from './style.styl'

interface KeyframeViewProps {
    activeLayer: Delir.Project.Layer|null
    editor: EditorState
}

interface ValueInputProps {
    descriptions: Delir.AnyParameterTypeDescriptor[],
    onChange: (value: any) => void
}

class ValueInputProxy extends React.Component<ValueInputProps, any>
{
    static propTypes = {
        descriptors: PropTypes.arrayOf(
            PropTypes.instanceOf(Delir.TypeDescriptor)
        ),
        onChange: PropTypes.func.isRequired
    }

    render()
    {

    }
}

// @connectToStores([EditorStateStore], () => ({
//     editor: EditorStateStore.getState(),
// }))
export default class KeyframeView extends React.Component<KeyframeViewProps, any> {
    static propTypes = {
        activeLayer: PropTypes.instanceOf(Delir.Project.Layer)
    }

    castValue = (desc: Delir.AnyParameterTypeDescriptor, value: string|number) =>
    {

        return value
    }

    selectProperty = ({currentTarget}: React.MouseEvent<HTMLDivElement>) =>
    {
        const propName: string = currentTarget.dataset.propName!
    }

    valueChanged = (propName: string, value: any) =>
    {
        const {activeLayer} = this.props
        const descriptors = activeLayer
            ? RendererService.pluginRegistry!.getParametersById(activeLayer.renderer) || []
            : []

        const desc = descriptors.find(desc => desc.propName === propName)
        if (! desc) {
            console.log('unmatch')
            return
        }

        const castedValue: any = this.castValue(desc, value)
        const newOptions = _.set(_.cloneDeep(activeLayer!.rendererOptions), propName, castedValue)

        ProjectModifyActions.modifyLayer(activeLayer!.id!, {
            rendererOptions: newOptions
        })
    }

    buildInput = (descriptor: Delir.AnyParameterTypeDescriptor, value: string|number|boolean|Delir.Project.Asset) =>
    {
        let component
        switch (descriptor.type) {
            case 'POINT_2D':
                component = [
                    <DragNumberInput data-prop-name={`${descriptor.propName}.x`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>,</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.y`} onChange={this.valueChanged.bind(null, descriptor.propName)} />
                ]
            case 'POINT_3D':
                component = [
                    <DragNumberInput data-prop-name={`${descriptor.propName}.x`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>,</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.y`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>,</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.z`} onChange={this.valueChanged.bind(null, descriptor.propName)} />
                ]
            case 'SIZE_2D':
                component = [
                    <DragNumberInput data-prop-name={`${descriptor.propName}.width`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>x</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.height`} onChange={this.valueChanged.bind(null, descriptor.propName)} />
                ]
            case 'SIZE_3D':
                component = [
                    <DragNumberInput data-prop-name={`${descriptor.propName}.width`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>x</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.height`} onChange={this.valueChanged.bind(null, descriptor.propName)} />,
                    <span className='separator'>x</span>,
                    <DragNumberInput data-prop-name={`${descriptor.propName}.depth`} onChange={this.valueChanged.bind(null, descriptor.propName)} />
                ]
            case 'COLOR_RGB':
                component = [<input type='color' defaultValue='' />]
            case 'COLOR_RGBA':
                component = [<input type='color' defaultValue='' />]
            case 'BOOL':
                component = [<input type='checkbox' checked={(value as boolean)} onChange={this.valueChanged.bind(null, descriptor.propName)} />]
            case 'STRING':
                component = [<textarea />]
            case 'NUMBER':
                component = [<DragNumberInput defaultValue={0} />]
            // case 'FLOAT': inputs =
            // case 'ENUM': inputs = [<select>{this.props.typeDescriptor.selection.map(value => <option value={value}>{value}</option>)}</select>]
            // case 'LAYER': inputs =
            // case 'PULSE': inputs =
            // case 'ASSET': inputs = [<LabelInput />]
            // case 'ARRAY': inputs =
        }

        return component
    }

    render()
    {
        const {activeLayer} = this.props
        const descriptors = activeLayer
            ? RendererService.pluginRegistry!.getParametersById(activeLayer.renderer) || []
            : []

        console.log(activeLayer, descriptors)

        return (
            <Workspace direction='horizontal' className={s.keyframeView}>
                <Pane className={s.propList}>
                    <SelectList>
                        {descriptors.map(desc => (
                            <div
                                key={activeLayer!.id + desc.propName}
                                className={s.propItem}
                                data-prop-name={desc.propName}
                                onClick={this.selectProperty}
                            >
                                <span className={s.propItemName}>{desc.label}</span>
                                <div className={s.propItemInput}>
                                    {this.buildInput(desc, activeLayer!.rendererOptions[desc.propName])}
                                </div>
                            </div>
                        ))}
                    </SelectList>
                </Pane>
                <Pane>
                    <div className={s.keyframes}>
                    </div>
                </Pane>
            </Workspace>
        )
    }
}