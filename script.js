/**
 * Represents a scene with grids.
 * @constructor
 */
var Scene = function (options) {
  //the canvas html element
  var canvas = document.getElementById("canvas");

  //the context for drawing on canvas
  var ctx = canvas.getContext("2d");

  var lineWidth = options.hasOwnProperty('lineWidth') && !isNaN(options.lineWidth) ? options.lineWidth : 0.5;
  var startFillColor = options.hasOwnProperty('startFillColor') && typeof options.startFillColor === 'string' ? options.startFillColor : "#FF0000";
  var endFillColor = options.hasOwnProperty('endFillColor') && typeof options.endFillColor === 'string' ? options.endFillColor : "#00FF00";
  var gridColor = options.hasOwnProperty('gridColor') && typeof options.gridColor === 'string' ? options.gridColor : "#000000";
  var cellWidth = isNaN(options.cellWidth) ? 10 : options.cellWidth;

  canvas.width = window.screen.width - 2 * cellWidth;
  canvas.height = window.screen.height - 2 * cellWidth;

  return {
    draw: function (cells) {
      var start = cells.start;
      var end = cells.end;
      var paths = cells.paths;
      var blocks = cells.blocks;

      ctx.lineWidth = lineWidth;
      ctx.fillStyle = gridColor;

      //horizontal lines
      for (var i = 0; i <= canvas.height; i += cellWidth) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      //vertical lines
      for (i = 0; i <= canvas.width; i += 10) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

    },
    setCanavasWidth: function (width) {
      canvas.width = width;
    },
    setCanavasHeight: function (height) {
      canvas.height = height;
    },
    fillCell: function (cell, color) {
      ctx.fillStyle = typeof color === 'string' ? color : gridColor;
      ctx.fillRect(cell.x, cell.y, cellWidth, cellWidth);
    },
    fillCellRound: function (cell, color) {
      var radius = cellWidth / 2;
      ctx.fillStyle = typeof color === 'string' ? color : gridColor;
      ctx.beginPath();
      ctx.arc(cell.x + radius, cell.y + radius, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
    },
    getCellWidth: function () {
      return cellWidth;
    },
    getCanvasWidth: function () {
      return canvas.width;
    },
    getCanvasHeight: function () {
      return canvas.height;
    }
  };
};

/**
 * Represents the astar algorithm.
 * @constructor
 * @param {Scene} scene - A Scene object on which the algorithm should preform the search.
 * @param {object} start - An object with properties x and y.
 * @param {object} end - An object with properties x and y.
 */
var AStar = function (scene) {
  var start,
  end,
  open = [],
  closed = [],
  blocks = [],
  isDragging = false,
  numRows = Math.floor(scene.getCanvasWidth()/scene.getCellWidth()),
  numColumns = Math.floor(scene.getCanvasHeight()/scene.getCellWidth()),
  grid = new Create2DArray(numRows, numColumns), //0 is navigatable, 1 is blocked
  state = 0;

  /**
   *
   * Creates a 2D array of dimension row x column, filling it with zeroes.
   */
  function Create2DArray(rows, columns){
    var array = [], row=[];
    while(columns--) row.push(0);
    while(rows--) array.push(row.slice());
    return array;
  }
  /**
   * private function to calculate euclidean distance between two points.
   * @param {int} p - The start point
   * @param {int} q - The end point
   * @returns {number} - The heuristic distance between the input point.
   */
  function heuristicEuclideanDistance(p, q) {
    return Math.sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y));
  }

  /**
   * Checks if an array of points contains a point.
   * @param {array} array - An array of points
   * @param {point} point - A point to search for in array.
   * @returns {boolean} - true if the point exists in the array, false otherwise.
   */
  function contains(array, point) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].x == point.x && arr[i].y == point.y) {
        return true;
      }
    }
    return false;
  }

  function isPointStartOrEnd(point){
    return (point.x == start.x && point.y == start.y) || (point.x == end.x && point.y == end.y);
  }

  /* event bindings */
  $('#canvas').on('click', function (evt) {
    var offset = $(this).offset();
    var x = evt.pageX - offset.left;
    var y = evt.pageY - offset.top;
    var point = {x: Math.floor(x / scene.getCellWidth()) * scene.getCellWidth(), y: Math.floor(y / scene.getCellWidth()) * scene.getCellWidth()};
    var gridIndex = {x: Math.floor(point.x/scene.getCellWidth()), y: Math.floor(point.y/scene.getCellWidth())};
    switch (state) {
    case 0:
      scene.fillCellRound(point, "red");
      start = {x: gridIndex.x, y: gridIndex.y, gscore: 0, hscore: 0};
      open.push(start);
      state++;
      return;
    case 1:
      scene.fillCellRound(point, "green");
      end = {x: gridIndex.x, y: gridIndex.y};
      state++;
      return;
    case 2:
      if(!isPointStartOrEnd(point)){
        scene.fillCell(point, "black");
        grid[gridIndex.x][gridIndex.y]=1;
      }
      return;
    }
  });

  $('#canvas').on('mousedown', function (evt) {
    isDragging = true;
  });

  $('#canvas').on('mouseup', function (evt) {
    isDragging = false;
  });

  $('#canvas').on('mousemove', function (evt) {
    if (isDragging && state == 2) {
      var offset = $(this).offset();
      var x = evt.pageX - offset.left;
      var y = evt.pageY - offset.top;
      var point = {x: Math.floor(x / scene.getCellWidth()) * scene.getCellWidth(), y: Math.floor(y / scene.getCellWidth()) * scene.getCellWidth()};
      var gridIndex = {x: Math.floor(point.x/scene.getCellWidth()), y: Math.floor(point.y/scene.getCellWidth())};
      if(!isPointStartOrEnd(point)){
        scene.fillCell(point, "black");
        grid[gridIndex.x][gridIndex.y]=1;
      }
    }
  });

  function arePointsEqual(point1, point2){
    return point1.x==point2.x && point1.y==point2.y;
  }

  function generateSuccessors(point){
    var cellWidth = scene.getCellWidth();
    
  }

  return {
    /**
     * Generates random blocks on a scene.
     */
    generateRandomBlocks: function (width, height) {
      if (typeof start === 'undefined' || typeof end === 'undefined')
        throw new Error('Before generating random blocks, please specify start and end points');
      for (i = 0; i < 2000; i++) {
        var x = Math.floor(Math.random() * width);
        var y = Math.floor(Math.random() * height);
        var point = {x: Math.floor(x / scene.getCellWidth()) * scene.getCellWidth(), y: Math.floor(y / scene.getCellWidth()) * scene.getCellWidth()};
        if(!isPointStartOrEnd(point)){
          scene.fillCell(point, "black");
          blocks.push(point);
        }
      }
    },
    /**
     * Executes A-star search on the scene.
     */
    run: function () {
      do{
        begin = open.pop();
        var successors = generateSuccessors(begin);
        

      }
      while(open.length!==0 || !arePointsEqual(begin, end));
    },
    /**
     *
     */
    reconstructPath: function (cameFrom, current) {
      var total_path = [];
      total_path.push(cameFrom);
      while (cameFrom.cameFrom !== undefined) {
        cameFrom = cameFrom.cameFrom;
        total_path.push(cameFrom);
      }
      return total_path;
    }
  };
}

var Controls = function () {
  var control = $('#controls');
  var messages = $('#spn-messages');
  var scene = new Scene({});
  scene.draw({});
  var astar = new AStar(scene);

  //bind click handlers on control buttons
  $('#controls #btn-random-blocks').on('click', function () {
    try {
      astar.generateRandomBlocks(scene.getCanvasWidth(), scene.getCanvasHeight());
    } catch (err) {
      messages.text(err.name + ": " + err.message);
    }
  });

  $('#controls #btn-find-path').on('click', function () {
    try {
      astar.run();
    } catch (err) {
      messages.text(err);
      alert(err);
    }
  });

  $('#controls #btn-reset').on('click', function () {
    scene = new Scene({});
    scene.draw({});
    astar = new AStar(scene);
  });

  return {};
}

var controls = new Controls();
