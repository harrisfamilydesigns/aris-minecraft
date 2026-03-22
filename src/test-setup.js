import '@testing-library/jest-dom'

// Mock canvas context for tests
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      fillStyle: null,
    }
  }
  return null
}
