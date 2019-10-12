import { lighten, rgba } from 'polished'

export const cssVars = {
  animate: {
    bgColorDuration: '200ms',
    function: 'cubic-bezier(.3, 1, .72, 1.06)',
  },
  colors: {
    error: '#f83737',
    theming: '#7b14ea',
    appBg: '#353535',
    popupBg: lighten(0.4, '#353535'),
    listArea: rgba('#000', 0.2),
    listItemHovered: rgba('#fff', 0.1),
  },
  style: {
    popupDropshadow: `0 0 4px ${rgba('#112', 0.5)}`,
  },
  size: {
    radius: '4px',
  },
}
