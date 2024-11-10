import { Ref } from 'vue';
import { clamp } from './helpers';

export function detectTrackpad(event: WheelEvent) {
  var isTrackpad = false;
  if ((event as any).wheelDeltaY) {
    if ((event as any).wheelDeltaY === event.deltaY * -3) {
      isTrackpad = true;
    }
  } else if (event.deltaMode === 0) {
    isTrackpad = true;
  }
  return isTrackpad;
}
export function isMultipleOf(n: number, multiples: number[]) {
  const factor = multiples.find((m) => n % m === 0);
  if (factor) {
    return n / factor;
  } else {
    return 1;
  }
}

export function useWheel({
  scale,
  translate,
  minScale,
  maxScale,
  relativeWrapperCoordinatesFromClientCoords,
  normalizeMatrixCoordinates,
  calcProjectionTranslate,
}: {
  scale: Ref<number>;
  translate: Ref<[number, number]>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
  relativeWrapperCoordinatesFromClientCoords: (clientX: number, clientY: number) => [number, number];
  normalizeMatrixCoordinates: (clientX: number, clientY: number) => [number, number];
  calcProjectionTranslate: (
    newScale: number,
    wrapperPosition: [number, number],
    canvasPosition: [number, number]
  ) => [number, number];
}) {
  function handleWheel(event: WheelEvent) {
    let { deltaX, deltaY, ctrlKey } = event;
    const mouseMultiples = [120, 100];
    const mouseFactor = ctrlKey ? 2 : 2;
    if (!detectTrackpad(event)) {
      if (Math.abs(deltaX) === 120 || Math.abs(deltaX) === 200) {
        deltaX = (deltaX / ((100 / mouseFactor) * isMultipleOf(deltaX, mouseMultiples))) * Math.sign(deltaX);
      }
      if (Math.abs(deltaY) === 120 || Math.abs(deltaY) === 200) {
        deltaY = (deltaY / ((100 / mouseFactor) * isMultipleOf(deltaY, mouseMultiples))) * Math.sign(deltaY);
      }
    }
    const currScale = scale.value;
    if (ctrlKey) {
      let PosNeg = -deltaY > 0
      const scaleDelta = 0.25 * currScale;

      const newScale = PosNeg ? clamp(currScale + scaleDelta, minScale.value, maxScale.value) : clamp(currScale - scaleDelta, minScale.value, maxScale.value) ;
      
      const [translateX, translateY] = calcProjectionTranslate(
        newScale,
        relativeWrapperCoordinatesFromClientCoords(event.clientX, event.clientY),
        normalizeMatrixCoordinates(event.clientX, event.clientY)
      );
      
      translate.value = [translateX, translateY];
      scale.value = newScale;
    } else {
      translate.value = [translate.value[0] - deltaX, translate.value[1] - deltaY];
    }

    event.preventDefault();
    event.stopPropagation();
  }

  return {
    handleWheel,
  };
}
