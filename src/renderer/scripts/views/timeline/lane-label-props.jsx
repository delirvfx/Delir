import React, {PropTypes, Children} from 'React'

import LabelInput from '../components/label-input'
import DragNumberInput from '../components/drag-number-input'

export default class LaneLabelProps extends React.Component
{
    static propTypes = {
        descriptor: PropTypes.arrayOf(PropTypes.object).isRequired,
    }

    render()
    {
        const {descriptor} = this.props

        return (
            <ul className='timeline_lane-props'>
                {descriptor.map((prop, idx) => (
                    <li key={idx} className='timeline_lane-prop'>
                        <span>{prop.label}</span>
                        <PropInput type={prop.type} />
                    </li>
                ))}
            </ul>
        )
    }

    renderInputByType(type, )
    {

    }
}

class PropInput extends React.Component
{
    static propTypes = {
        type: PropTypes.oneOf([
            'POINT_2D', 'POINT_3D', 'SIZE_2D', 'SIZE_3D',
            'COLOR_RGB', 'COLOR_RGBA', 'BOOL', 'STRING',
            'NUMBER', 'FLOAT', 'ENUM', 'LAYER', 'PULSE',
            'ASSET', 'ARRAY',
        ]),
        value: PropTypes.any,
    }

    render()
    {
        let inputs
        switch (this.props.type) {
            case 'POINT_2D': inputs = [<DragNumberInput />, ',', <DragNumberInput />]; break;
            case 'POINT_3D': inputs = [<DragNumberInput />, ',', <DragNumberInput />, ',', <DragNumberInput />]; break;
            case 'SIZE_2D': inputs = [<DragNumberInput />, 'x', <DragNumberInput />]; break;
            case 'SIZE_3D': inputs = [<DragNumberInput />, 'x', <DragNumberInput />, 'x', <DragNumberInput />]; break;
            case 'COLOR_RGB': inputs = [<LabelInput />] ; break;
            case 'COLOR_RGBA': inputs = [<input type='color' />]  ; break;
            case 'BOOL': inputs = [<input type='checkbox' />]; break;
            case 'STRING': inputs = [<textarea />] ; break;
            case 'NUMBER': inputs =  [<DragNumberInput defaultValue={0} />] ; break;
            // case 'FLOAT': inputs =  ; break;
            // case 'ENUM': inputs =  ; break;
            // case 'LAYER': inputs =  ; break;
            // case 'PULSE': inputs =  ; break;
            case 'ASSET': inputs = [<LabelInput />] ; break;
            // case 'ARRAY': inputs =  ; break;
        }

        return (
            <div>
                {Children.map(inputs, el => el)}
            </div>
        )
    }
}
