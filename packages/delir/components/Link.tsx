import { remote } from 'electron'
import * as React from 'react'

const openExternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    remote.shell.openExternal(e.currentTarget.href)
    e.preventDefault()
}

interface Props {
    href: string
    className?: string
    children: React.ReactChild
}

export default (props: Props) => {
    const { href, className, children } = props
    return (
        <a href={href} className={className} onClick={openExternal}>
            {children}
        </a>
    )
}
