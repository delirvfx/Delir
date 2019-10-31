import { lighten, rgba } from 'polished'

export const cssVars = {
  animate: {
    bgColorDuration: '200ms',
    function: 'cubic-bezier(.3, 1, .72, 1.06)',
  },
  textColors: {
    muted: '#888',
  },
  colors: {
    error: '#f83737',
    theming: '#7b14ea',
    appBg: '#353535',
    popupBg: lighten(0.08, '#353535'),
    listArea: rgba('#000', 0.2),
    listItemHovered: rgba('#fff', 0.08),
    dragover: rgba('#fff', 0.08),
  },
  style: {
    activeBoxShadow: `0 0 0 3px ${rgba('#aa5bff', 0.4)}`,
    popupDropshadow: `0 0 4px ${rgba('#112', 0.5)}`,
  },
  size: {
    radius: '4px',
  },
}
