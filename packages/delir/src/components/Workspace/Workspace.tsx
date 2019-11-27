import classnames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'

export interface Props extends React.DOMAttributes<HTMLDivElement> {
  className?: string
  acceptPaneDragIn?: boolean
  direction: 'vertical' | 'horizontal'
}

export const Workspace: FunctionComponent<Props> = ({
  children,
  className,
  acceptPaneDragIn,
  direction,
  ...misc
}: Props) => {
  return (
    <div className={classnames('_workspace', `_workspace--${direction}`, className)} {...misc}>
      {children}
    </div>
  )
}

Workspace.defaultProps = {
  acceptPaneDragIn: false,
}
