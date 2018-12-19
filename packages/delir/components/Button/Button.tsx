import * as classnames from 'classnames'
import * as React from 'react'

import * as s from './Button.styl'

interface Props {
    children?: React.ReactNode
    className?: string
    type?: 'normal' | 'primary'
    htmlType?: string
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = (props: Props) => {
    const { children, className, type, htmlType, onClick } = props

    return (
        <button
            type={htmlType || 'button'}
            className={classnames(s.Button, className, {
                [s['Button--primary']]: type === 'primary',
            })}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

export default Button
