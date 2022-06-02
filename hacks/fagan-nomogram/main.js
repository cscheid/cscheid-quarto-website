import * as cscheid from "/src/cscheid/cscheid.js";

cscheid.svg.setupD3Prototype();

var svg = d3.select("#main")
        .append("svg")
        .attr("viewBox", "0 0 920 400")
        .attr("width", "100%")
        .attr("height", "100%");

var preTestScaleLogOdds = d3.scaleLinear()
        .domain([3, -3])
        .range([20, 800]);

var postTestScaleLogOdds = d3.scaleLinear()
        .domain([-3, 3])
        .range([20, 800]);

var logLikelihoodRatioScale = d3.scaleLinear()
        .domain([-6, 6])
        .range([20, 800]);

var labels = ['pre-test probability',
              'likelihood ratio',
              'post-test probability'];

var yScale = d3.scaleLinear().domain([0,2]).range([100, 300]);

svg.append("g")
    .selectAll("text")
    .data(labels)
    .enter()
    .append("text")
    .attr("x", 810)
    .attr("y", function(d, i) { return yScale(i); })
    .attr("dy", 3)
    .text(function(d) { return d; })
    .attr("class", "label");

var preTestLineG = svg.append("g");
var preTestLine = preTestLineG
        .append("line")
        .attr("x1", preTestScaleLogOdds(-3))
        .attr("x2", preTestScaleLogOdds(3))
        .attr("y1", 100)
        .attr("y2", 100)
        .attr("class", "test-line");

var lrLineG = svg.append("g");
var lrLine = lrLineG
        .append("line")
        .attr("x1", logLikelihoodRatioScale(-4))
        .attr("x2", logLikelihoodRatioScale(4))
        .attr("y1", 200)
        .attr("y2", 200)
        .attr("class", "test-line");

var postTestLineG = svg.append("g");
var postTestLine = postTestLineG
        .append("line")
        .attr("x1", postTestScaleLogOdds(-3))
        .attr("x2", postTestScaleLogOdds(3))
        .attr("y1", 300)
        .attr("y2", 300)
        .attr("class", "test-line");

//////////////////////////////////////////////////////////////////////////////
// this could be solved automatically..

function expFmt(v) {
    var l = Math.pow(10, v);
    var r = fmt(l / (1 + l));
    return r.replace(/0+$/, "");
}

function lrFmt(v) {
    var l = Math.pow(10, v);
    if (l == ~~l)
        return String(l);
    else 
        return String(l).replace(/0+$/, "");
}

var preProbTicks = {
    list: [-3, -2, -0.954245, 0, 0.954245, 2, 3],
    scale: preTestScaleLogOdds,
    fmt: expFmt
};

var postProbTicks = {
    list: [-3, -2, -0.954245, 0, 0.954245, 2, 3],
    scale: postTestScaleLogOdds,
    fmt: expFmt
};

var lrTicks   = {
    list: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
    scale: logLikelihoodRatioScale,
    fmt: lrFmt
};

var fmt = d3.format(".3f");

function addTicks(ticks)
{
    return function(sel) {
        var gs = sel
            .enterMany(ticks.list)
                .append("g");
        gs.append("line")
            .attr("x1", function(d) { return ticks.scale(d); })
            .attr("x2", function(d) { return ticks.scale(d); })
            .attr("y1", -5).attr("y2", 5)
            .attr("class", "test-line");
        gs.append("text")
            .attr("x", function(d) { return ticks.scale(d); })
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .attr("class", "label")
            .text(function(d) { return ticks.fmt(d); });
    };
}

preTestLineG
    .append("g")
    .attr("transform", cscheid.svg.translate(0, 100))
    .callReturn(addTicks(preProbTicks));

lrLineG
    .append("g")
    .attr("transform", cscheid.svg.translate(0, 200))
    .callReturn(addTicks(lrTicks));

postTestLineG
    .append("g")
    .attr("transform", cscheid.svg.translate(0, 300))
    .callReturn(addTicks(postProbTicks));

var nomogramLine = svg.append("line")
        .attr("x1", preTestScaleLogOdds(-1))
        .attr("y1", 100)
        .attr("x2", postTestScaleLogOdds(0))
        .attr("y2", 300)
        .attr("class", "test-line");

function updateLine() {
    nomogramLine.attr("x1", preTestHandle.attr("cx"));
    nomogramLine.attr("x2", postTestHandle.attr("cx"));
}

function dragAttrs(sel) {
    return sel.attr("r", 5)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("cursor", "pointer");
}

var preTestHandle = svg.append("circle")
        .attr("cx", preTestScaleLogOdds(-1))
        .attr("cy", 100)
        .callReturn(dragAttrs)
        .call(d3.drag().on("drag", function() {
            d3.select(this).attr("cx", d3.event.x);
            var lrX = Number(lrHandle.attr("cx"));
            var dx = lrX - d3.event.x;
            postTestHandle.attr("cx", lrX + dx);
            updateLine();
        }));

var lrHandle = svg.append("circle")
        .attr("cx", 0.5 * (postTestScaleLogOdds(0) + preTestScaleLogOdds(-1)))
        .attr("cy", 200)
        .callReturn(dragAttrs)
        .call(d3.drag().on("drag", function() {
            d3.select(this).attr("cx", d3.event.x);
            var ptX = Number(preTestHandle.attr("cx"));
            var dx = d3.event.x - ptX;
            postTestHandle.attr("cx", d3.event.x + dx);
            updateLine();
        }));

var postTestHandle = svg.append("circle")
        .attr("cx", postTestScaleLogOdds(0))
        .attr("cy", 300)
        .callReturn(dragAttrs)
        .call(d3.drag().on("drag", function() {
            d3.select(this).attr("cx", d3.event.x);
            lrHandle.attr("cx", 0.5 * (d3.event.x + Number(preTestHandle.attr("cx"))));
            updateLine();
        }));
