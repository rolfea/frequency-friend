// Mocks the 2D canvas context so VexFlow can measure text metrics under jsdom
// without printing noisy "Not implemented" warnings during unit tests.

function mockCanvasContext(): CanvasRenderingContext2D {
  return {
    measureText: () => ({
      width: 10,
      actualBoundingBoxAscent: 8,
      actualBoundingBoxDescent: 2,
    }),
    font: '10px Bravura',
  } as unknown as CanvasRenderingContext2D;
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;
(HTMLCanvasElement.prototype.getContext as unknown as (
  contextId: string,
  options?: unknown,
) => CanvasRenderingContext2D | null) = function (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown,
) {
  if (contextId === '2d') {
    return mockCanvasContext() as unknown as CanvasRenderingContext2D;
  }
  return originalGetContext.call(this, contextId, options) as CanvasRenderingContext2D | null;
};
