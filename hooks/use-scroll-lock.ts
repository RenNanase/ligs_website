import { useEffect, useRef } from 'react'

interface ScrollLockOptions {
  lock?: boolean
  reserveScrollBarGap?: boolean
}

export function useScrollLock(options: ScrollLockOptions = {}) {
  const { lock = false, reserveScrollBarGap = true } = options
  const originalStyles = useRef<Partial<CSSStyleDeclaration>>({})
  const scrollTarget = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!lock) return

    // Store the current scroll target
    scrollTarget.current = document.body

    // Store original styles
    const target = scrollTarget.current
    if (target) {
      originalStyles.current = {
        overflow: target.style.overflow,
        position: target.style.position,
        top: target.style.top,
        width: target.style.width,
        paddingRight: target.style.paddingRight,
        touchAction: target.style.touchAction,
        overscrollBehavior: target.style.overscrollBehavior,
      }

      // Get the scroll bar width
      const scrollBarWidth = reserveScrollBarGap ? window.innerWidth - document.documentElement.clientWidth : 0

      // Apply scroll lock styles
      Object.assign(target.style, {
        overflow: 'hidden',
        position: 'fixed',
        top: `-${window.scrollY}px`,
        width: scrollBarWidth ? `calc(100% - ${scrollBarWidth}px)` : '100%',
        paddingRight: scrollBarWidth ? `${scrollBarWidth}px` : '',
        touchAction: 'none',
        overscrollBehavior: 'contain',
      })
    }

    return () => {
      // Restore original styles
      const target = scrollTarget.current
      if (target && originalStyles.current) {
        const scrollY = target.style.top
        Object.assign(target.style, originalStyles.current)
        
        // Restore scroll position
        if (scrollY) {
          const y = parseInt(scrollY || '0', 10) * -1
          window.scrollTo(0, y)
        }
      }
    }
  }, [lock, reserveScrollBarGap])

  return null
}
