var width = 960,
    height = 500;

var modes = {
    POINT: "point",
    SPLINE: "spline",
    LINE: "line",
    IMAGE: "image"};

var tag = "Po";
var current_mode = modes.POINT;

var data = {'point':{},'spline':{},'width':960,'height':0};
var im_string = "";
var im_format = "";
    
var dragged = null,
    selected = null;

var svg = d3.select(".tracerzone").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("tabindex", 1);

add_rect(svg);

labels = [
	"Po",
	"Ar",
	"Ba",
	"Post Ra",
	"Go",
	"Ante Ra",
	"LIA",
	"B",
	"Pog",
	"Gn",
	"Me",
	"LIE",
	"UIE",
	"UIA",
	"ENA",
	"Or",
	"Na",
	"Se",
	"S",
	"ENP",
	"A"
    ];

label_cycle = {};

for(var i = 0; i<labels.length; i++){
    label_cycle[labels[i]] = labels[(i+1)%labels.length];
}

// d3.select(".tag")
//     .on("change", update_tag);

d3.select("#tag")
    .on("change", update_tag)
  .selectAll("option")
    .data(labels)
    .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

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
    .on("mouseup", mouseup)
    .on("keydown", keydown);

d3.select("#save_button")
    .on("click",save_data);

function save_data(){
    console.log("saving data");

    im_and_data = {
	image:im_string,
	format:im_format,
	data:data
    };
    var http = new XMLHttpRequest();
    http.open("POST", "/save_data", true);
    http.setRequestHeader("Content-type","application/json");
    http.send(JSON.stringify(im_and_data));
    http.onload = function() {
        alert(http.responseText);
    }
}

function resize(width,height,wanted_width){
    return height*(wanted_width/width);
}

function handleFileSelect(){
    var files = d3.event.target.files;
    var file = files[0];
    var reader = new FileReader();

    reader.onload = (function(theFile){
	return function(e){

	    var image = new Image();
	    image.src = e.target.result;
	    
	    // save image as a string
	    im_string = e.target.result.replace("data:"+ theFile.type +";base64,", '');
	    im_format = theFile.type;

	    image.onload = function() {
		// access image size here

		width = 960;
		height = resize(this.width,this.height,width);

		data.width = width;
		data.height = height;

		d3.select("svg")
		    .attr("width",width)
		    .attr("height",height);

		d3.select("rect")
		    .attr("width",width)
		    .attr("height",height);

		d3.select("image")
		    .attr("width",width)
		    .attr("height",height);
	    };

	    d3.select("svg")
	        .insert("image","rect")
	        // .attr("width",width)
	        // .attr("height",height)
	        .attr("xlink:href",e.target.result);
	    };
	})(file);

    reader.readAsDataURL(file);
}

d3.select('#fileupload')
    .on('change',handleFileSelect);
// document.getElementById('fileupload').addEventListener('change', handleFileSelect, false);

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

function update_tag(value){
    tag = value;
    if(tag===undefined){
	tag = this.value;
    }
    redraw_svg(svg,data,current_mode,tag);
}

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

function keydown() {
  switch (d3.event.keyCode) {
    case 65:
      console.log("pressed");
      new_tag = label_cycle[tag];
      tag_box = d3.select('#tag')
          .property("value",new_tag);

      update_tag(new_tag);
    // case 8: // backspace
    // case 46: { // delete
    //   var i = points.indexOf(selected);
    //   points.splice(i, 1);
    //   selected = points.length ? points[i > 0 ? i - 1 : 0] : null;
    //   redraw();
      break;
  }
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
    svg.selectAll("text").remove();
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
	    .attr("r",3)
	    .attr("cx", function(d){return d[0];})
	    .attr("cy", function(d){return d[1];})
	    .classed("selected", function(d){
		return d[2]==tag;});
	circle.exit().remove();
	
	var label = svg.selectAll("text")
	    .data(restricted_data, function(d){return d;});
	label.enter()
	    .append("text")
	    .attr("x", function(d){return d[0];})
	    .attr("y", function(d){return d[1];})
	    .text(function(d){return d[2];});
	label.exit().remove();

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
	        .attr("r",5)
	        .on("mousedown", function(d) { selected = dragged = d; })

	    circle.classed("selected", function(d) { return d === selected; })
	        .attr("cx", function(d) { return d[0]; })
	        .attr("cy", function(d) { return d[1]; });

	    circle.exit().remove();
	
	}
	break;
	
    }
}

console.log("done");
