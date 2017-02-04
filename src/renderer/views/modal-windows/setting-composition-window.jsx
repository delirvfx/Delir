import React, {PropTypes} from 'react'
import ModalWindow from '../electron/modal-window'

export default class NewCompositionWindow extends React.Component
{
    static propTypes = {
        show: PropTypes.bool.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        query: PropTypes.string.isRequired,
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
