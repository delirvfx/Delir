import * as React from 'react'
import {PropTypes} from 'react'

import ModalWindow from '../electron/modal-window'

export interface NewCompositionWindowProps {
    show: boolean,
    width: number,
    height: number,
    onHide: () => any,
    onResponse: (param: {[name: string]: string|number}) => any,
}

export default class NewCompositionWindow extends React.Component<NewCompositionWindowProps, any>
{
    static propTypes = {
        show: PropTypes.bool.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        onHide: PropTypes.func.isRequired,
        onResponse: PropTypes.func.isRequired,
    }

    render()
    {
        return (
            <ModalWindow
                url='new-composition.html'
                show={this.props.show}
                width={this.props.width}
                height={this.props.height}
                onHide={this.props.onHide}
                onResponse={this.props.onResponse}
            />
        )
    }
}
