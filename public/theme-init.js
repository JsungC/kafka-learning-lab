// Apply the theme before the page paints, including on static subpath hosting.
(() => {
  let theme;
  try {
    theme = localStorage.getItem("kafka-lab-theme");
  } catch {
    /* Use system preference when storage is unavailable. */
  }
  if (theme !== "light" && theme !== "dark")
    theme = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b111b' : '#f7f9fc');
})();
