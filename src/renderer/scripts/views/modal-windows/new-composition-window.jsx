import React, {PropTypes} from 'react'
import ModalWindow from '../electron/modal-window'

export default class NewCompositionWindow extends React.Component
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
