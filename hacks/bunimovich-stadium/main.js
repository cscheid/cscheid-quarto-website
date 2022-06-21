import { geometry as G } from "/src/cscheid/cscheid.js";
import * as cscheid from "/src/cscheid/cscheid.js";

function makeBall(origin, velocity, originT) {
    return {
        originT: originT || 0,
        origin: origin,
        velocity: velocity
    };
}

function shapeBounce(shape, ball) {
    var intersection = shape.intersect(ball);
    if (intersection.t === Infinity ||
        isNaN(intersection.t) ||
        intersection.t <= ball.originT)
        return undefined;

    var normal = shape.normalAt(intersection.point);
    if (normal.dot(ball.velocity.unit()) >= 0)
        return undefined;

    return makeBall(intersection.point, ball.velocity.reflect(normal).neg(), intersection.t);
}

function halfPlane(point, normal) {
    normal = normal.unit();
    var tangent = G.vec2(normal.y, -normal.x);
    var p1 = point.plus(tangent), p2 = point.minus(tangent);

    return {
        intersect: function(ball) {
            var result = cscheid.geometry.lineLineIntersect(p1, p2, ball.origin, ball.origin.plus(ball.velocity));
            var distT = result.distance(ball.origin) / ball.velocity.length();
            if (normal.dot(ball.velocity) > 0)
                distT = -distT;
            var intersectT = ball.originT + distT;
            if (intersectT < ball.originT) {
                intersectT = Infinity;
            }
            return {
                t: intersectT,
                point: result
            };
        },
        normalAt: function(point) {
            return normal;
        }
    };
}

function halfInnerCircle(center, radius, normal) {
    var ellipse = G.ellipse()
            .transform(G.Transform.prototype.scale(radius, radius))
            .transform(G.Transform.prototype.translate(center.x, center.y));

    normal = normal.unit();
    return {
        intersect: function(ball) {
            var is;
            is = ellipse.lineIntersection(ball.origin, ball.origin.plus(ball.velocity));
            if (is.length !== 2)
                return undefined;
            
            var d1 = is[0].minus(ball.origin).unit();
            var d2 = is[1].minus(ball.origin).unit();
            var ballDirection = ball.velocity.unit();
            var result;
            // the intersections are only valid if they belong to the half-circle
            if (is[0].minus(center).unit().dot(normal) < 0 &&
                d1.dot(this.normalAt(is[0])) < 0 &&
                d1.dot(ballDirection) > cscheid.math.eps) {
                result = is[0];
            } else if (is[1].minus(center).unit().dot(normal) < 0 &&
                       d2.dot(this.normalAt(is[1])) < 0 &&
                       d2.dot(ballDirection) > cscheid.math.eps) {
                result = is[1];
            } else
                return undefined;
            var distT = result.distance(ball.origin) / ball.velocity.length();
            var intersectT = ball.originT + distT;

            return {
                t: intersectT,
                point: result
            };
        },
        normalAt: function(point) {
            return ellipse.gradient.apply(point).unit().neg();
        }
    };
}

function ellipseInterior(center, radiusX, radiusY) {
    var ellipse = G.ellipse()
            .transform(G.Transform.prototype.    scale(radiusX,  radiusY))
            .transform(G.Transform.prototype.translate(center.x, center.y));

    return {
        intersect: function(ball) {
            var is;
            is = ellipse.lineIntersection(ball.origin, ball.origin.plus(ball.velocity));
            if (is.length !== 2)
                return undefined;
            
            var d1 = is[0].minus(ball.origin).unit();
            var d2 = is[1].minus(ball.origin).unit();
            var ballDirection = ball.velocity.unit();
            var result;
            // the intersections are only valid if they belong to the half-circle
            if (d1.dot(this.normalAt(is[0])) < 0 &&
                d1.dot(ballDirection) > cscheid.math.eps) {
                result = is[0];
            } else if (d2.dot(this.normalAt(is[1])) < 0 &&
                       d2.dot(ballDirection) > cscheid.math.eps) {
                result = is[1];
            } else
                return undefined;
            var distT = result.distance(ball.origin) / ball.velocity.length();
            var intersectT = ball.originT + distT;

            return {
                t: intersectT,
                point: result
            };
        },
        normalAt: function(point) {
            return ellipse.gradient.apply(point).unit().neg();
        }
    };
}

//////////////////////////////////////////////////////////////////////////////

function decideNextBounce(ball, scene) {
    var bounces = [];
    scene.forEach(function(object) {
        var intersect = object.intersect(ball);
        if (intersect === undefined)
            return;
        if (intersect.t === Infinity)
            return;
        var bounce = shapeBounce(object, ball);
        if (bounce !== undefined) {
            bounces.push(bounce);
        }
    });
    bounces.sort(function(b1, b2) {
        if (b1.originT < b2.originT)
            return -1;
        else if (b1.originT > b2.originT)
            return 1;
        else
            return 0;
    });
    if (bounces.length === 0) {
        throw new Error("ball escaped?");
    }
    return bounces[0];
}

//////////////////////////////////////////////////////////////////////////////

var svg = d3.select("#main")
        .append("svg")
        .style("position", "absolute")
        .attr("width", 800)
        .attr("height", 400);

var bunimovichScene = [
    halfPlane(G.vec2(   0,  200), G.vec2( 0, -1)),
    halfPlane(G.vec2(   0, -200), G.vec2( 0,  1)),
    halfInnerCircle(G.vec2(-200, 0), 200, G.vec2( 1, 0)),
    halfInnerCircle(G.vec2( 200, 0), 200, G.vec2(-1, 0))];

var ellipticalScene = [ellipseInterior(G.vec2(0, 0), 400, 200)];

function addBunimovichBG(sel) {
    sel.attr("transform", "translate(400, 200)")
        .append("path")
        .attr("d", "M -200 -200 l 400 0 a 200 200 0 0 1 0 400 l -400 0 a 200 200 0 0 1 0 -400 ")
        .attr("fill", d3.lab(80,0,0));
}

function addEllipticalBG(sel) {
    sel.attr("transform", "translate(400, 200)")
        .append("ellipse")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("rx", 400)
        .attr("ry", 200)
        .attr("fill", d3.lab(80,0,0));
}

var stadiumBg = svg.append("g");

d3.select("#main").style("position", "relative");

var stadiumTrace = d3.select("#main")
        .append("canvas")
        .style("position", "absolute")
        .attr("width", 800)
        .attr("height", 400)
        .style("opacity", 0.7)
        .node();

d3.select("#main")
    .append("div")
    .style("position", "relative")
    .style("height", "420px")
    .style("width", "800px");

var ctx = stadiumTrace.getContext("2d");

var svgScene = svg.append("g")
        .attr("transform", cscheid.svg.translate(400, 200));

var balls = [];

function addBalls(n, center, direction, spread, speed) {
    var angleScale = d3.scaleLinear().domain([0,n]).range([-spread, spread]);
    for (var i=0; i<n; ++i) {
        var rot = G.Transform.prototype.rotate(angleScale(i + (0.5 *Math.random()-0.25)));
        balls.push({
            current: makeBall(center, rot.apply(direction).scale(speed))
        });
    }
}

var ballPen = svgScene.append("g");

[["#reset-bunimovich", bunimovichScene, addBunimovichBG],
 ["#reset-elliptical", ellipticalScene, addEllipticalBG]].forEach(function(l) {
     var [selector, scene, backgroundFunction] = l;
     
     d3.select(selector)
         .append("span")
         .style("min-width", "200px")
         .style("display", "inline-block")
         .text("Scene: " + selector.substr(7));

     d3.select(selector)
         .append("button")
         .text("300 balls")
         .on("click", function() { reset(300, scene, backgroundFunction); });
     
     d3.select(selector).append("span").text(" ");
     
     d3.select(selector)
         .append("button")
         .text("1 ball")
         .on("click", function() { reset(1, scene, backgroundFunction); });
 });

d3.select("#clear-tracks")
    .append("button")
    .text("clear tracks")
    .on("click", function() {
        ctx.clearRect(0,0,800,400);
    });

var batch = 0;
var speed = 500;
function reset(howMany, scene, backgroundFunction) {
    ++batch;
    balls = [];
    ctx.clearRect(0, 0, 800, 400);

    var bg = stadiumBg.selectAll("*").remove();
    backgroundFunction(stadiumBg);

    var randomAngle = Math.random() * 2 * Math.PI;
    
    addBalls(howMany, G.vec2(Math.random() * 100 - 50, Math.random() * 100 - 50),
             G.vec2(Math.cos(randomAngle), Math.sin(randomAngle)), Math.random() * 0.25, speed);

    var all = ballPen.selectAll("*");
    all.transition();
    all.remove();
    
    ballPen
        .selectAll("*")
        .data(balls)
        .enter()
        .append("circle")
        .each(function(ball) {
            ball.next = decideNextBounce(ball.current, scene);
        })
        .attr("cx", function(ball) { return ball.current.origin.x; })
        .attr("cy", function(ball) { return ball.current.origin.y; })
        .attr("r", 2)
        .attr("fill", "black")
        .call(transitionToNext(batch, scene));
};

reset(300, bunimovichScene, addBunimovichBG);

function transitionToNext(whichBatch, scene) {
    return function(sel) {
        sel.transition()
            .ease(d3.easeLinear)
            .duration(function(ball) {
                return (ball.next.originT - ball.current.originT) * 1000;
            })
            .attr("cx", function(ball, i) {
                return ball.next.origin.x;
            })
            .attr("cy", function(ball) { return ball.next.origin.y; })
            .on("end", function(ball) {
                ctx.beginPath();
                ctx.moveTo(ball.current.origin.x + 400, ball.current.origin.y + 200);
                ctx.lineTo(ball.next.origin.x + 400, ball.next.origin.y + 200);
                ctx.strokeStyle = "rgb(0,60,0)";
                ctx.stroke();
                ball.current = ball.next;
                ball.next = decideNextBounce(ball.current, scene);
                if (whichBatch === batch) {
                    d3.select(this).call(transitionToNext(whichBatch, scene));
                }
            })
        ;
    };
}
