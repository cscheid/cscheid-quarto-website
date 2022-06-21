export function sizePlot(svg)
{
    svg.setAttribute("viewbox", `0 0 ${svg.width} ${svg.height}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.removeAttribute("font-family"); // allow this to revert to css font
    return svg;
}