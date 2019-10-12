import React, { ReactNodeArray } from 'react'

export const preserveLineBreak = (str: string): ReactNodeArray => {
  const lines = str.split('\n')
  return lines.map((line, idx) => [idx > 0 ? <br /> : '', line]).flat(Infinity)
}
