export default function popupWindowParams(preferredWidth: number, preferredHeight: number) {
  const width = Math.min(preferredWidth, window.screen.availWidth);
  const height = Math.min(preferredHeight, window.screen.availHeight);

  return Object.entries({
    toolbar: 0,
    menubar: 0,
    location: 0,
    status: 0,
    scrollbars: 1,
    resizable: 0,
    chrome: 'yes',
    width,
    height,
    left: Math.round((window.innerWidth - width) / 2 + window.screenX),
    top: Math.round((window.innerHeight - height) / 3 + window.screenY),
  })
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}
