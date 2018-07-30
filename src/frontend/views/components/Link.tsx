import { remote } from 'electron'
import * as React from 'react'

const openExternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    remote.shell.openExternal(e.currentTarget.href)
    e.preventDefault()
}

export default (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const {onClick, children, ...passingProps} = props
    return <a {...passingProps} onClick={openExternal}>{children}</a>
}
