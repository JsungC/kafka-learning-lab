export function localJump(e: React.MouseEvent<HTMLElement>) {
  e.preventDefault();
  const target = document.querySelector(e.currentTarget.getAttribute("href")!);
  if (target instanceof HTMLElement) {
    target.scrollIntoView();
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
}
