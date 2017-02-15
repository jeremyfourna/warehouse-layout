var width = 1900;
var height = 1000;

var warehouseConfig = {
	aisles: 38,
	racks: 70,
	levels: 4,
	boxes: 6
};

var locationWithLowItems = locationList.filter(function(cur) {
	return cur.items_count <= 5;
});

var pickerTour = ["MZ1-2531A03", "MZ1-2813D05", "MZ1-3019D01", "MZ1-0332A03", "MZ1-0719A03", "MZ1-0719A03", "MZ1-0910A02", "MZ1-0919A03", "MZ1-2708A03", "MZ1-2709A01", "MZ1-2714D04", "MZ1-2723D03", "MZ1-2724D05", "MZ1-2903A02", "MZ1-2938A02", "MZ1-3140A02", "MZ1-2910A02", "MZ1-2910A02", "MZ1-2542A02", "MZ1-2705A01", "MZ1-2739A03", "MZ1-2913A01", "MZ1-2926D05", "MZ1-2926D05", "MZ1-3108A03", "MZ1-3117A02", "MZ1-3119A03", "MZ1-3329A03", "MZ1-3340A02", "MZ1-2926D05", "MZ1-3119A03", "MZ1-0538A02", "MZ1-3104A03", "MZ1-3105A01", "MZ1-3110A03", "MZ1-3137A01", "MZ1-3204D05", "MZ1-3309A03", "MZ1-3312A01", "MZ1-3315A03", "MZ1-3316A02", "MZ1-3317A01", "MZ1-3338A02", "MZ1-3204D05", "MZ1-3312A01", "MZ1-2934A03", "MZ1-3103A02", "MZ1-3136D05", "MZ1-3305A03", "MZ1-3305A03", "MZ1-3328A03", "MZ1-3203D02", "MZ1-3305A03"];

// defineLocationInGrid :: Object -> Object -> Number -> Number -> [Number, Number]
function defineLocationInGrid(warehouseConfig, dashboardWidth, dashboardHeight, location) {

	function letterToNumber(letter) {
		if (letter.toUpperCase() === "A") {
			return 1;
		} else if (letter.toUpperCase() === "B") {
			return 2;
		} else if (letter.toUpperCase() === "C") {
			return 3;
		} else if (letter.toUpperCase() === "D") {
			return 4;
		} else {
			return 0;
		}
	}

	function defineWidth(warehouseConfig, dashboardWidth, aisle, rack, level) {

		function oddOrEvenRack(rack) {
			if (rack % 2 === 0) {
				return spaceByAisle / 2;
			} else {
				return 0;
			}
		}

		if (aisle > warehouseConfig.aisles) {
			return 0;
		}

		if (level > warehouseConfig.levels) {
			return 0;
		}

		var spaceByAisle = dashboardWidth / warehouseConfig.aisles;
		var widthForAisle = (aisle - 1) * spaceByAisle;
		var widthForRack = oddOrEvenRack(rack);
		var widthForLevel = (level - 1) / warehouseConfig.levels * warehouseConfig.levels * 6;
		//console.log("width", widthForAisle, widthForRack, widthForLevel);
		return widthForAisle + widthForRack + widthForLevel;
	}

	function defineHeight(warehouseConfig, dashboardHeight, rack, box) {

		function oddOrEvenRack(heightForRack, rack) {
			if (rack <= 2) {
				return 0;
			} else if (rack % 2 === 0) {
				rack -= 1;
			}

			return rack * heightForRack;
		}

		if (rack > warehouseConfig.racks) {
			return 0;
		}

		if (box > warehouseConfig.boxes) {
			return 0;
		}

		var spaceByRack = dashboardHeight / warehouseConfig.racks;
		var heightForRack = oddOrEvenRack(spaceByRack, rack);
		var heightForBox = (box - 1) / warehouseConfig.boxes * warehouseConfig.boxes * 7;
		//console.log("height", heightForRack, heightForBox);
		return heightForRack + heightForBox;
	}

	var val = location.description.slice(4, 11);
	var aisle = Number(val.slice(0, 2));
	var rack = Number(val.slice(2, 4));
	var level = letterToNumber(val.slice(4, 5));
	var box = Number(val.slice(5, 7));
	var locationWidth = Math.round(defineWidth(warehouseConfig, dashboardWidth, aisle, rack, level));
	var locationHeight = Math.round(defineHeight(warehouseConfig, dashboardHeight, rack, box));

	//console.log(locationWidth, locationHeight);
	return [locationWidth, locationHeight, location.class];
}

function highlightPickerTour(listOfSteps, location) {
	if (location.description === listOfSteps[0]) {
		return "start";
	} else if (location.description === listOfSteps[listOfSteps.length - 1]) {
		return "end";
	} else if (listOfSteps.filter(function(cur) {
			return cur === location.description
		}).length !== 0) {
		return "step";
	} else {
		return "point";
	}
}

// Replace d3.range() with your Array of data
var data = locationWithLowItems.map(function(cur) {
	cur.class = highlightPickerTour(pickerTour, cur);
	return defineLocationInGrid(warehouseConfig, width, height, cur);
});

var quadtree = d3.geom.quadtree()
	.extent([
		[-1, -1],
		[width + 1, height + 1]
	])
	(data);

var color = d3.scale.linear()
	.domain([0, 8]) // max depth of quadtree
	.range(["#efe", "#060"]);

var svg = d3.select("body").append("div")
	.attr("width", width)
	.attr("height", height)
	.on("click", function(d) {
		var xy = d3.mouse(d3.selectAll('svg')[0][0]);
		svg.selectAll("#pt")
			.attr("cx", xy[0])
			.attr("cy", xy[1]);
		clicked();
	});

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
	.on("click", function(d) {
		var xy = d3.mouse(d3.selectAll('svg')[0][0]);
		svg.selectAll("#pt")
			.attr("cx", xy[0])
			.attr("cy", xy[1]);
		clicked();
	});

var rect = svg.selectAll(".node")
	.data(nodes(quadtree))
	.enter().append("rect")
	.attr("class", "node")
	.attr("x", function(d) {
		return d.x1;
	})
	.attr("y", function(d) {
		return d.y1;
	})
	.attr("width", function(d) {
		return d.x2 - d.x1;
	})
	.attr("height", function(d) {
		return d.y2 - d.y1;
	});

var point = svg.selectAll(".point")
	.data(data)
	.enter().append("circle")
	.attr("class", function(d) {
		return d[2];
	})
	.attr("cx", function(d) {
		return d[0];
	})
	.attr("cy", function(d) {
		return d[1];
	})
	.attr("r", 3);

svg.append("circle")
	.attr("id", "pt")
	.attr("r", 3)
	.attr("cx", width / 2)
	.attr("cy", height / 2)
	.style("fill", "yellow");

// PDS Collect a list of nodes to draw rectangles, adding extent and depth data
function nodes(quadtree) {
	var nodes = [];
	quadtree.depth = 0; // root
	quadtree.visit(function(node, x1, y1, x2, y2) {
		node.x1 = x1;
		node.y1 = y1;
		node.x2 = x2;
		node.y2 = y2;
		nodes.push(node);
		for (var i = 0; i < 4; i++) {
			if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
		}
	});
	return nodes;
}


// calculate euclidean distance of two points with coordinates: a(ax, ay) and b(bx, by)
function euclidDistance(ax, ay, bx, by) {
	return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
}

// calculate mindist between searchpoint and rectangle
function mindist(x, y, x1, y1, x2, y2) {
	var dx1 = x - x1,
		dx2 = x - x2,
		dy1 = y - y1,
		dy2 = y - y2;

	if (dx1 * dx2 < 0) { // x is between x1 and x2
		if (dy1 * dy2 < 0) { // (x,y) is inside the rectangle
			return 0; // return 0 as point is in rect
		}
		return Math.min(Math.abs(dy1), Math.abs(dy2));
	}
	if (dy1 * dy2 < 0) { // y is between y1 and y2
		// we don't have to test for being inside the rectangle, it's already tested.
		return Math.min(Math.abs(dx1), Math.abs(dx2));
	}
	return Math.min(Math.min(euclidDistance(x, y, x1, y1), euclidDistance(x, y, x2, y2)), Math.min(euclidDistance(x, y, x1, y2), euclidDistance(x, y, x2, y1)));
}


// Find the nodes within the specified rectangle.
function knearest(bestqueue, resultqueue, x, y, k) {
	// sort children according to their mindist/dist to searchpoint
	bestqueue.sort(function(a, b) {
		// add minidst to nodes if not there already
		[a, b].forEach(function(val, idx, array) {
			if (val.mindist == undefined) {
				val.scanned = true;
				if (val.leaf) {
					val.point.scanned = true;
					val.mindist = euclidDistance(x, y, val.x, val.y);
				} else {
					val.mindist = mindist(x, y, val.x1, val.y1, val.x2, val.y2);
				}
			}
		});
		return b.mindist - a.mindist;
	});

	// add nearest leafs if any
	for (var i = bestqueue.length - 1; i >= 0; i--) {
		var elem = bestqueue[i];
		if (elem.leaf) {
			elem.point.selected = true;
			bestqueue.pop();
			resultqueue.push(elem);
		} else {
			break;
		}
		if (resultqueue.length >= k) {
			break;
		}
	}

	// check if enough points found
	if (resultqueue.length >= k || bestqueue.length == 0) {
		// return if k neighbors found
		return;
	} else {
		// add child nodes to bestqueue and recurse
		var vistitednode = bestqueue.pop();
		vistitednode.visited = true;
		// add nodes to queue
		vistitednode.nodes.forEach(function(val, idx, array) {
			bestqueue.push(val);
		});
		// recursion
		knearest(bestqueue, resultqueue, x, y, k);
	}
}


function clicked() {
	pt = d3.selectAll('#pt');
	var x = +pt.attr('cx'),
		y = +pt.attr('cy');

	// TODO these values should be stored seperately so that points don't have to be visited after each query
	// idea assign unique ids to quadtree nodes and have a separate mindist array
	point.each(function(d) {
		d.scanned = d.selected = false;
		d.mindist = undefined;
	});
	rect.each(function(d) {
		d.visited = false;
		d.mindist = undefined;
	});

	//get nearest neighbors
	var bestqueue = new Array(quadtree);
	var resultqueue = [];
	knearest(bestqueue, resultqueue, x, y, 60);

	point.classed("scanned", function(d) {
		return d.scanned;
	});
	point.classed("selected", function(d) {
		return d.selected;
	});
	rect.style('fill', function(d) {
		return d.visited ? color(d.depth) : 'none';
	});
}

clicked();
