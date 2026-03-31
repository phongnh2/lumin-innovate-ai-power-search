export default function popupWindow({ url, title, w, h }: { url: string | URL; title: string; w: number; h: number }) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const width = windowWidth > w ? w : windowWidth * 0.8;
  const height = windowHeight > h ? h : windowHeight * 0.8;
  const left = (window.innerWidth / 2 - width / 2).toFixed();
  const top = (window.innerHeight / 2 - height / 2).toFixed();
  return window.open(url, title, `width=${width}, height=${height}, top=${top}, left=${left}`);
}
