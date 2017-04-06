/**
 * preventDefault & stopPropagation on Event
 */
export default function cancelEvent(e: {preventDefault: () => void, stopPropagation: () => void}) {
    e.preventDefault()
    e.stopPropagation()
}