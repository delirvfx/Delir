import * as React from 'react'
import {PropTypes} from 'react'
import ModalWindow from '../electron/modal-window'

export interface SettingCompositionWindowProps {
    show: boolean,
    width: number,
    height: number,
    query: {[name: string]: string|number},
    onHide: () => any,
    onResponse: (param: {[name: string]: string|number}) => any,
}

export default class SettingCompositionWindow extends React.Component<SettingCompositionWindowProps, any>
{
    static propTypes = {
        show: PropTypes.bool.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        query: PropTypes.object.isRequired,
        onHide: PropTypes.func.isRequired,
        onResponse: PropTypes.func.isRequired,
    }

    render()
    {
        return (
            <ModalWindow
                url='setting-composition.html'
                show={this.props.show}
                width={this.props.width}
                height={this.props.height}
                query={this.props.query}
                onHide={this.props.onHide}
                onResponse={this.props.onResponse}
            />
        )
    }
}
