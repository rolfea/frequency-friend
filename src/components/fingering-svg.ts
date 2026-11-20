import type { Fingering } from '../domain/fingering.js';

export interface FingeringSvgProps {
  width: number;
  height: number;
  casingRx: number;
  casingRy: number;
  casingStroke: number;
  valveRadius: number;
  valveStroke: number;
  valveCy: [number, number, number];
  classPrefix: string;
}

export function renderFingeringSvg(valves: Fingering, props: FingeringSvgProps): string {
  const cx = props.width / 2;
  const stroke = props.casingStroke;
  const casingW = props.width - stroke * 2;
  const casingH = props.height - stroke * 2;

  const valveCircles = props.valveCy
    .map(
      (cy, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${props.valveRadius}" fill="none"\n          class="${props.classPrefix}__valve ${valves[i] ? `${props.classPrefix}__valve--pressed` : ''}"\n          stroke="currentColor" stroke-width="${props.valveStroke}" />`,
    )
    .join('\n');

  return `
    <svg class="${props.classPrefix} ${props.classPrefix}__svg" viewBox="0 0 ${props.width} ${props.height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${stroke}" y="${stroke}" width="${casingW}" height="${casingH}" rx="${props.casingRx}" ry="${props.casingRy}"
        class="${props.classPrefix}__casing" fill="none" stroke="currentColor" stroke-width="${stroke}" />
      ${valveCircles}
    </svg>
  `.trim();
}
