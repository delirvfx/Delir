import classnames from 'classnames'
import React, { FunctionComponent } from 'react'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  resizable?: boolean
  allowFocus?: boolean
  className?: string
}

export const Pane: FunctionComponent<Props> = props => {
  const { className, allowFocus, resizable, children, ...rest } = props

  return (
    <div
      className={classnames('_workspace-pane', className, {
        '_workspace-pane--allow-focus': allowFocus,
      })}
      tabIndex={allowFocus ? -1 : void 0}
      {...rest}
    >
      {resizable ? <div className="_workspace-pane-handle" /> : null}
      {children}
    </div>
  )
}

Pane.defaultProps = {
  allowFocus: false,
  resizable: true,
  draggable: false,
}
