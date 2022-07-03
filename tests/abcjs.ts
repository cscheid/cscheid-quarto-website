export function processAbcJs() {
  const nodes = Array.from(document.querySelectorAll("code.abc"));
  for (const node of nodes) {
    const text = (node as HTMLElement).innerText;
    const pre = node.parentElement!;
    const div = pre.parentElement!;
    div.removeChild(pre);
    div.classList.remove("sourceCode");
    ((window as any).ABCJS as any).renderAbc(div.id, text);
  }
}
