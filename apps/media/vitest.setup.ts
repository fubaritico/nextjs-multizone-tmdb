import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement HTMLDialogElement methods — needed by TrailerCard/Modal
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open')
}

globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // noop
  }
  unobserve() {
    // noop
  }
  disconnect() {
    // noop
  }
}

globalThis.IntersectionObserver = class IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]

  observe() {
    // noop
  }
  unobserve() {
    // noop
  }
  disconnect() {
    // noop
  }
  takeRecords() {
    return []
  }
} as unknown as typeof IntersectionObserver
