import * as React from 'react'
import * as classnames from 'classnames'

import s from './style.styl'

interface ModalProps {
    title?: string,
    message: string,
}

export default class Modal extends React.Component<ModalProps, any>
{
    render()
    {
        const {title, message} = this.props

        return (
            <div className={s.root}>
                {title && <h1>{title}</h1>}
                <p>{message}</p>
                <div className={s.footer}>
                    <button className={classnames(s.button, s.buttonCancel)}>キャンセル</button>
                    <button className={classnames(s.button, s.primary)}>OK</button>
                </div>
            </div>
        )
    }
}