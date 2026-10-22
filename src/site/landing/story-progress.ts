export function storyScroll(journey: HTMLElement) {
  const travel = journey.offsetHeight - window.innerHeight;
  return travel > 0 ? Math.max(0, Math.min(1, -journey.getBoundingClientRect().top / travel)) : 0;
}

export function storyProgress(journey: HTMLElement) {
  const scroll = storyScroll(journey);
  if (scroll < 0.18) return 0;
  if (scroll < 0.31) return (scroll - 0.18) / 0.26;
  if (scroll < 0.53) return 0.5;
  if (scroll < 0.66) return 0.5 + (scroll - 0.53) / 0.26;
  return 1;
}
