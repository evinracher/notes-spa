import '@testing-library/jest-dom/jest-globals'
import { afterEach } from '@jest/globals'

// jsdom does not implement pointer capture or all PointerEvent properties.
if (!window.PointerEvent) {
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number
    readonly isPrimary: boolean

    constructor(type: string, options: PointerEventInit = {}) {
      super(type, options)
      this.pointerId = options.pointerId ?? 0
      this.isPrimary = options.isPrimary ?? false
    }
  }

  Object.defineProperty(window, 'PointerEvent', { value: TestPointerEvent })
}

const capturedPointers = new Map<number, Element>()

Object.defineProperties(Element.prototype, {
  setPointerCapture: {
    configurable: true,
    value(this: Element, pointerId: number) {
      capturedPointers.set(pointerId, this)
    },
  },
  hasPointerCapture: {
    configurable: true,
    value(this: Element, pointerId: number) {
      return capturedPointers.get(pointerId) === this
    },
  },
  releasePointerCapture: {
    configurable: true,
    value(this: Element, pointerId: number) {
      if (capturedPointers.get(pointerId) === this) capturedPointers.delete(pointerId)
    },
  },
})

afterEach(() => capturedPointers.clear())
