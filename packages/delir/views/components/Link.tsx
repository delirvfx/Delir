import { remote } from 'electron'
import * as React from 'react'

const openExternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    remote.shell.openExternal(e.currentTarget.href)
    e.preventDefault()
}

interface Props {
    href: string
    children: React.ReactChild
}

export default (props: Props) => {
    const {href, children} = props
    return <a href={href} onClick={openExternal}>{children}</a>
}
