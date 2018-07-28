import * as React from 'react'
import * as classnames from 'classnames'

import * as s from './Button.sass'

interface Props {
    children?: React.ReactNode
    className?: string
    type?: 'normal' | 'primary'
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export default (props: Props) => {
    const {children, className, type, onClick} = props

    return (
        <button
            className={classnames(s.Button, className, {
                [s['Button--primary']]: type === 'primary',
            })}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
