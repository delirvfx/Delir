import React, { ComponentClass, createContext, FC, ReactNode, useCallback, useContext } from 'react'
import { Fragment } from 'react'
import { useMemo } from 'react'
import { animated, useTransition } from 'react-spring'
import styled from 'styled-components'
import { useImmer } from 'use-immer'
import uuid from 'uuid'
import s from './ModalOwner.sass'

interface MountModal {
  <T>(arg: (resolver: (result: T) => void) => ReactNode): PromiseLike<T> & { promise: Promise<T>; abort: () => void }
}

export interface ModalMounterProps {
  mountModal: MountModal
}

const context = createContext<MountModal | null>(null)

const ModalWrapper = styled.div`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
`

export const useModalMounter = () => {
  const mountModal = useContext(context)!
  return { mountModal }
}

export const withModalMounter = function<P>(Component: ComponentClass<P>): FC<P> {
  return (props: any) => {
    const { mountModal } = useModalMounter()
    return <Component mountModal={mountModal} {...props} />
  }
}

export const ModalOwner: React.FC = ({ children }: { children: (modals: ReactNode[]) => ReactNode }) => {
  const [modals, updateState] = useImmer<Record<string, ReactNode>>({})

  const mountModal = useCallback((factory: (resolve: any) => ReactNode) => {
    const modalId = uuid.v4()
    const unmount = () =>
      updateState(draft => {
        delete draft[modalId]
      })

    const promise = new Promise(resolve => {
      const callback = (value: any) => {
        resolve(value)
        unmount()
      }

      updateState(draft => {
        draft[modalId] = <Fragment key={modalId}>{factory(callback)}</Fragment>
      })
    })

    return {
      abort: () => unmount(),
      promise: promise as Promise<any>,
      then: (fullfiled: any, rejected: any): any => {
        return promise.then(fullfiled, rejected)
      },
    }
  }, [])

  const modalsArray = useMemo(() => Object.entries(modals), [modals])
  const transitions = useTransition(modalsArray.length > 0, null, {
    from: {
      backdropFilter: 'blur(0px)',
      opacity: 0,
      pointerEvents: 'none',
    },
    enter: {
      backdropFilter: 'blur(2px)',
      opacity: 1,
      pointerEvents: 'all',
    },
    leave: {
      backdropFilter: 'blur(0px)',
      opacity: 0,
      pointerEvents: 'none',
    },
  })

  return (
    <context.Provider value={mountModal}>
      {children}
      {transitions.map(({ item, props }) =>
        item ? (
          <animated.div className={s.root} style={props}>
            {modalsArray.map(([key, modal]) => (
              <ModalWrapper key={key}>{modal}</ModalWrapper>
            ))}
          </animated.div>
        ) : null,
      )}
    </context.Provider>
  )
}

ModalOwner.displayName = 'ModalOwner'
