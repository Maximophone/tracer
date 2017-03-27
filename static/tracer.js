var width = 960,
    height = 500;

var modes = {
    POINT: "point",
    SPLINE: "spline",
    IMAGE: "image"};

var tag = "tag0";
var current_mode = modes.POINT;

var data = {'point':{},'spline':{}};
    
// var points = [];

var dragged = null,
    selected = null;

// var line = d3.svg.line();

var svg = d3.select(".tracerzone").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("tabindex", 1);

add_rect(svg);

d3.select(".tag")
    .on("change", update_tag);

d3.select("#mode")
    .on("change", update_mode)
  .selectAll("option")
    .data([
	"point",
	"spline"
    ])
    .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

function mousemove() {
    if (!dragged) return;
    var m = d3.mouse(svg.node());
    dragged[0] = Math.max(0, Math.min(width, m[0]));
    dragged[1] = Math.max(0, Math.min(height, m[1]));
    redraw_svg(svg,data,current_mode,tag);
}

function mouseup() {
    if (!dragged) return;
    mousemove();
    dragged = null;
}

function update_mode(){
    current_mode = this.value;
    redraw_svg(svg,data,current_mode,tag);
}

function update_tag(){
    tag = this.value;
    redraw_svg(svg,data,current_mode,tag);
}

// d3.select(window)
//     .on("mousemove", mousemove)
//     .on("mouseup", mouseup)
//     .on("keydown", keydown);

// d3.select("#interpolate")
//     .on("change", change)
//     .selectAll("option")
//     .data([
// 	"linear",
// 	"step-before",
// 	"step-after",
// 	"basis",
// 	"basis-open",
// 	"basis-closed",
// 	"cardinal",
// 	"cardinal-open",
// 	"cardinal-closed",
// 	"monotone"
//     ])
//     .enter().append("option")
//     .attr("value", function(d) { return d; })
//     .text(function(d) { return d; });

function mousedown() {

  switch(current_mode){
      case modes.POINT:
      if(!(tag in data['point'])){
	  data['point'][tag]=[];
      }
      data['point'][tag][0] = d3.mouse(svg.node());
      break;

      case modes.SPLINE:
      if(!(tag in data['spline'])){
	  data['spline'][tag]=[];
      }
      data['spline'][tag].push(d3.mouse(svg.node()));
      break;
  }
  redraw_svg(svg,data,current_mode,tag);
}

function add_rect(svg){
    rect = svg.append("rect")
	.attr("width", width)
	.attr("height", height)
	.on("mousedown", mousedown);
    return rect;
}

function clear_svg(svg){
    svg.selectAll("circle").remove();
    svg.selectAll("path").remove();
    return rect;
}

function redraw_svg(svg, data, mode, tag){

    rect = clear_svg(svg);

    switch(mode){
	case modes.POINT:
	restricted_data = [];
	for (var key in data['point']){
	    restricted_data.push([data['point'][key][0][0],data['point'][key][0][1],key]);
	}
	var circle = svg.selectAll("circle")
	    .data(restricted_data, function(d){return d;});
	circle.enter()
	    .append("circle")
	    .attr("r",2)
	    .attr("cx", function(d){return d[0];})
	    .attr("cy", function(d){return d[1];})
	    .classed("selected", function(d){
		return d[2]==tag;});
	circle.exit().remove();
	break;

	case modes.SPLINE:
	restricted_data = [];
	for (var key in data['spline']){
	    var line = d3.svg.line();
	    line.interpolate("cardinal");
	    svg.append("path")
		.datum(data['spline'][key])
	        .attr("class", "line tag-"+key)
	        .attr("d", line);
	   
	    var circle = svg.selectAll("circle .tag-"+key)
	        .data(data['spline'][key], function(d) { return d; });

	    circle.enter().append("circle")
	        .attr("class","tag-"+key)
	        .attr("r",2)
	        .on("mousedown", function(d) { selected = dragged = d; })

	    circle.classed("selected", function(d) { return d === selected; })
	        .attr("cx", function(d) { return d[0]; })
	        .attr("cy", function(d) { return d[1]; });

	    circle.exit().remove();
	
	}
	break;
	
    }
}

// function draw_svg(svg,mode){
//     switch(mode){
// 	case modes.SPLINE:
// 	    svg.append("path")
// 	        .datum(points)
// 	        .attr("class", "line")
// 	        .call(redraw);
// 	    break;
//     }


//     svg.node().focus();

//     function redraw() {
// 	svg.select("path").attr("d", line);

// 	var circle = svg.selectAll("circle")
// 	    .data(points, function(d) { return d; });

// 	circle.enter().append("circle")
// 	    .attr("r", 1e-6)
// 	    .on("mousedown", function(d) { selected = dragged = d; redraw(); })
// 	    .transition()
// 	    .duration(750)
// 	    .ease("elastic")
// 	    .attr("r", 6.5);

// 	circle
// 	    .classed("selected", function(d) { return d === selected; })
// 	    .attr("cx", function(d) { return d[0]; })
// 	    .attr("cy", function(d) { return d[1]; });

// 	circle.exit().remove();

// 	if (d3.event) {
// 	    d3.event.preventDefault();
// 	    d3.event.stopPropagation();
// 	}
//     }

//     function change() {
// 	line.interpolate(this.value);
// 	redraw();
//     }

//     function mousedown() {
// 	points.push(selected = dragged = d3.mouse(svg.node()));
// 	redraw();
//     }

//     function mousemove() {
// 	if (!dragged) return;
// 	var m = d3.mouse(svg.node());
// 	dragged[0] = Math.max(0, Math.min(width, m[0]));
// 	dragged[1] = Math.max(0, Math.min(height, m[1]));
// 	redraw();
//     }

//     function mouseup() {
// 	if (!dragged) return;
// 	mousemove();
// 	dragged = null;
//     }

//     function keydown() {
// 	if (!selected) return;
// 	switch (d3.event.keyCode) {
// 	case 8: // backspace
// 	case 46: { // delete
// 	    var i = points.indexOf(selected);
// 	    points.splice(i, 1);
// 	    selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
// 	    redraw();
// 	    break;
// 	}
// 	}
//     }

// }

console.log("done");
