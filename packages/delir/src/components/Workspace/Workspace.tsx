import classnames from 'classnames'
import _ from 'lodash'
import React, { FunctionComponent } from 'react'

export interface Props extends React.DOMAttributes<HTMLDivElement> {
  className?: string
  acceptPaneDragIn?: boolean
  direction: 'vertical' | 'horizontal'
}

export const Workspace: FunctionComponent<Props> = props => {
  const miscProps = _.omit(props, ['children', 'className', 'acceptPaneDragIn', 'direction'])
  return (
    <div className={classnames('_workspace', `_workspace--${props.direction}`, props.className)} {...miscProps}>
      {props.children}
    </div>
  )
}

Workspace.defaultProps = {
  acceptPaneDragIn: false,
}
