/** Red curtain mask: full viewport minus centered carousel window (even-odd). */
export function carouselRedMaskClip(heightVh: number, widthVw: number) {
  const left = 50 - widthVw / 2;
  const top = 50 - heightVh / 2;
  const right = 50 + widthVw / 2;
  const bottom = 50 + heightVh / 2;

  return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}% ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, ${left}% ${bottom}%, ${left}% ${top}%)`;
}
