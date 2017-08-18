import * as React from 'react'
import {remote} from 'electron'

const openExternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    remote.shell.openExternal(e.currentTarget.href)
    e.preventDefault()
}

export default (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const {onClick, children, ...passingProps} = props
    return <a {...passingProps} onClick={openExternal}>{children}</a>
}
