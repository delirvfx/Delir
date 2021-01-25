import classNames from 'classnames'
import React from 'react'

export const Icon = ({ kind, className }: { kind: string; className?: string }) => (
  <i className={classNames('fa', `fa-${kind}`, className)} />
)
