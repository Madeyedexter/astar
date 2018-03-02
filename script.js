/* global $ */

/**
 * Represents a scene with grids.
 * @constructor
 */
var Scene = function (options) {
  //the canvas html element
  var canvas = document.getElementById("canvas");

  //the context for drawing on canvas
  var ctx = canvas.getContext("2d");

  var lineWidth = options.hasOwnProperty('lineWidth') && !isNaN(options.lineWidth) ? options.lineWidth : 0.5 ,
  startFillColor = options.hasOwnProperty('startFillColor') && typeof options.startFillColor === 'string' ? options.startFillColor : "#FF0000" ,
  endFillColor = options.hasOwnProperty('endFillColor') && typeof options.endFillColor === 'string' ? options.endFillColor : "#00FF00",
  gridColor = options.hasOwnProperty('gridColor') && typeof options.gridColor === 'string' ? options.gridColor : "#000000",
  cellWidth = isNaN(options.cellWidth) ? 10 : options.cellWidth;

  canvas.width = Math.floor((window.screen.width - 2 * cellWidth)/cellWidth)*cellWidth;
  canvas.height = Math.floor((window.screen.height - 2 * cellWidth)/cellWidth)*cellWidth;

  var numRows = Math.floor(canvas.height/cellWidth),
  numColumns = Math.floor(canvas.width/cellWidth);

  var grid = new Create2DArray(numRows, numColumns); //0 is navigatable, 1 is blocked

  function _fill_cell_round(cell, color, radius){
    radius = radius == undefined ? cellWidth / 2 : radius;
      ctx.fillStyle = typeof color === 'string' ? color : gridColor;
      ctx.beginPath();
      ctx.arc(cell.x + cellWidth/2, cell.y + cellWidth / 2, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();
  }

  this.fillCellRound = function (cell, color) {
      _fill_cell_round(cell,color,cellWidth/2);
    }

  this.drawPath =  function(path){
      path.forEach(function(value){
          var x = value.y * cellWidth;
          var y = value.x * cellWidth;
          _fill_cell_round({x:x,y:y},'blue',cellWidth/2-2);
      });
    }
  this.draw= function (cells) {
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
    }
  this.setCanavasWidth= function (width) {
      canvas.width = width;
    }
  this.setCanavasHeight= function (height) {
      canvas.height = height;
    }
  this.fillCell= function (cell, color) {
      ctx.fillStyle = typeof color === 'string' ? color : gridColor;
      ctx.fillRect(cell.x, cell.y, cellWidth, cellWidth);
    }
    
  this.getCellWidth= function () {
      return cellWidth;
    }
  this.getCanvasWidth= function () {
      return canvas.width;
    }
  this.getCanvasHeight= function () {
      return canvas.height;
    }
  this.getGrid= function() {
      return grid;
    }

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
  open = new PriorityQueue((cell1, cell2) => 
    {
      if(cell1.fscore == undefined) return 1; 
      if(cell2.fscore == undefined) return 1;
      return cell1.fscore - cell2.fscore;
    }),
  closed = [],
  blocks = [],
  isDragging = false,
  grid = scene.getGrid(),
  numRows = grid.length,
  numColumns = grid[0].length,
  state = 0,
  cameFrom = {};

  
  /**
   * function to calculate euclidean distance between two points.
   * @param {int} p - The start point
   * @param {int} q - The end point
   * @returns {number} - The heuristic distance between the input point.
   */
  function _euclidean_distance(p, q) {
    return Math.sqrt((p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y));
  }

  /**
   * function to calculate manhattan distance between two points.
   * @param {int} p - The start point
   * @param {int} q - The end point
   * @returns {number} - The heuristic distance between the input point.
   */
  function _manhattan_distance(p, q) {
    return Math.abs(p.x - q.x) + Math.abs(p.y - q.y);
  }  

  function isPointStartOrEnd(gridLocation){
    return (gridLocation.x == start.x && gridLocation.y == start.y) || (gridLocation.x == end.x && gridLocation.y == end.y);
  }

  function _cell_hash(cell){
    return String(cell.x) + String(cell.y);
  }

  /* event bindings */
  $('#canvas').off('click').on('click', function (evt) {
    var offset = $(this).offset();
    var x = evt.pageX - offset.left;
    var y = evt.pageY - offset.top;
    var point = {x: Math.floor(x / scene.getCellWidth()) * scene.getCellWidth(), y: Math.floor(y / scene.getCellWidth()) * scene.getCellWidth()};
    var gridLocation = {y: Math.floor(point.x/scene.getCellWidth()), x: Math.floor(point.y/scene.getCellWidth())};
    switch (state) {
    case 0:
      scene.fillCellRound(point, "red");
      start = gridLocation;
      state++;
      console.log('start: ',start);
      break;
    case 1:
      scene.fillCellRound(point, "green");
      end = gridLocation;

      console.log('end: ',end);
      state++;
      break;
    case 2:
      if(!isPointStartOrEnd(gridLocation)){
        scene.fillCell(point, "black");
        // y represents row, x represents column
        grid[gridLocation.x][gridLocation.y]=3; // 3 is blocked
        console.log('block: ',gridLocation);
      }
      break;
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
      var gridLocation = {y: Math.floor(point.x/scene.getCellWidth()), x: Math.floor(point.y/scene.getCellWidth())};
      if(!isPointStartOrEnd(gridLocation)){
        scene.fillCell(point, "black");
        // y represents row, x represents column
        grid[gridLocation.x][gridLocation.y]=3; // 3 is blocked
        console.log('drag block: ', gridLocation);
      }
    }
  });

  function _nodes_equal(point1, point2){
    return point1.x==point2.x && point1.y==point2.y;
  }


  function _generate_neighbors(cell){
    var left, right, up, down, neighbors = {};
    if(cell.x - 1 > -1 && grid[cell.x - 1][cell.y] != 3)
    neighbors.left = {x: cell.x -1, y: cell.y};
    if(cell.x + 1 < numRows && grid[cell.x + 1][cell.y] != 3)
      neighbors.right = {x: cell.x  + 1, y: cell.y};
    if(cell.y - 1 > -1 && grid[cell.x][cell.y - 1] != 3)
      neighbors.up = {x: cell.x, y: cell.y - 1};
    if(cell.y + 1 < numColumns && grid[cell.x][cell.y + 1] != 3)
      neighbors.down = {x: cell.x, y: cell.y + 1};
    return neighbors;
  }
  
  function _neighbor_distance(current, neighbor){
    return Math.abs(current.x - neighbor.x) + Math.abs(current.y - neighbor.y);
  }
  
  function _reconstruct_path(cameFrom, target){
    var total_path = [target];
    target = cameFrom.get(target);
    while(target!=undefined){
      total_path.push(target);
      target = cameFrom.get(target);
    }
    return total_path;
  }

  return {
    /**
     * Generates random blocks on a scene.
     */
    generateRandomBlocks: function (width, height) {
      if (typeof start === 'undefined' || typeof end === 'undefined')
        throw new Error('Before generating random blocks, please specify start and end points');
      if(state ==2)
      for (var i = 0; i < 4000; i++) {
        var x = Math.floor(Math.random() * width);
        var y = Math.floor(Math.random() * height);
        var point = {x: Math.floor(x / scene.getCellWidth()) * scene.getCellWidth(), y: Math.floor(y / scene.getCellWidth()) * scene.getCellWidth()};
        var gridLocation = {y: Math.floor(point.x/scene.getCellWidth()), x: Math.floor(point.y/scene.getCellWidth()) };
        if(!isPointStartOrEnd(gridLocation) && gridLocation.x < numRows && gridLocation.y < numColumns){
          scene.fillCell(point, "black");
          grid[gridLocation.x][gridLocation.y]=3; //3 is blocked
        }
      }
      else
        throw new Error('Path Finding Complete. Please reset.');
    },
    /**
     * Executes A-star search on the scene.
     */
    run: function () {
      var cameFrom = new KeyMap(_cell_hash), gscores = new KeyMap(_cell_hash);
      gscores.put(start, {score: 0});
      grid[start.x][start.y] = 1;
      open.insert({x: start.x, y: start.y, fscore: _manhattan_distance(start, end)});
      while(!open.isEmpty()){
        var current = open.poll();
        if(_nodes_equal(current, end))
          return _reconstruct_path(cameFrom, cameFrom.get(current));

        grid[current.x][current.y] = 2; //closed
        var neighbors = _generate_neighbors(current);


          
        for(var key in neighbors){
          var neighbor = neighbors[key];
          //if cell is already visited
          if(grid[neighbor.x][neighbor.y] == 2) // if neighbor already closed
            continue;

          if(grid[neighbor.x][neighbor.y] == 0){ //discovered new cell
            grid[neighbor.x][neighbor.y] = 1; // mark as open
            open.insert({x: neighbor.x,y:neighbor.y, fscore: 99999999999});
          }
          var tentative_g_score = gscores.get(current).score + _neighbor_distance(current, neighbor);
          if(gscores.get(neighbor) != undefined && tentative_g_score >= gscores.get(neighbor).score)
            continue;
          cameFrom.put(neighbor, current);
          gscores.put(neighbor, {score: tentative_g_score});
          open.increase_priority({x: neighbor.x, y: neighbor.y, fscore: tentative_g_score + _manhattan_distance(neighbor, end)}, _nodes_equal);
        }
      }
      return false;
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
  $('#btn-random-blocks').off('click').on('click', function () {
      astar.generateRandomBlocks(scene.getCanvasWidth(), scene.getCanvasHeight());
  });

  $('#btn-find-path').off('click').on('click', function () {
    var result = astar.run();
    if(result)
      scene.drawPath(result);
    else
      console.log(result);
  });

  $('#controls #btn-reset').off('click').on('click', function () {
    scene = new Scene({});
    scene.draw({});
    astar = new AStar(scene);
  });

  return {
  };
}

function PriorityQueue(compare){
  // an array whose elements are indexed from 1
  var _array = [null], _compare;
  if(typeof compare == 'function')
    _compare = compare;
  else throw new Error("Please specify a valid function to compare prioriies of elements in the priority queue.");

  /**
  * Inserts the node into the queue, maintaining it's priority.
  * Priority is decided by using the compare function.
  */
  this.insert = function(node){
    _array.push(node);
    _heap_increase_key();
  }

  /**
  * returns, removing the next element in the queue.
  */
  this.poll = function(){
    if(this.size() > 0){
      var new_length = _array.length - 1;
      var first = _array[1];
      _array[1] = _array[new_length];
      _array.length = new_length;
      if(_array.length > 1){
        _heapify(1);
      }
      return first;
    }
    return undefined;
  }

  /**
  * returns, but does not removes, the next element.
  */
  this.peek = function(){
    return _array[1];
  }

  /**
  * returns the number of elements in this queue.
  */
  this.size = function(){
    return _array.length - 1;
  }

  /**
  * returns true if the queue is empty, false otherwise.
  */
  this.isEmpty = function(){
    return this.size() == 0;
  }

  /**
  * Increases priority of an element
  */
  this.increase_priority = function(element, elements_equal){
    var position = -1;
    for(var index=1; index < _array.length; index++)
      if(elements_equal(_array[index], element)){
        position = index;
        break;
      }
    if(position != -1){
      _array[position] = element;
      _heap_increase_key(position);
    }
  }

  function _swap(i, j){
    var temp = _array[i];
    _array[i]=_array[j];
    _array[j]=temp;
  }

  function _heap_increase_key(i){
    //retrieve index of the newly inserted element
    i = _array.length-1;
    var parent = _parent(i);
    // swap with parent until max-heap or min-heap property is not satisfied.
    while(i > 1 && _compare(_array[parent], _array[i]) > 0 ){
      _swap(parent, i);
      i = parent;
      parent = _parent(i);
    }
  }

  function _heapify(i){
    var newIndex = i;
    var left_child = _left_child(i);
    var right_child = _right_child(i);
    if(left_child < _array.length && _compare(_array[left_child], _array[newIndex]) < 0)
      newIndex = left_child;
    if(right_child < _array.length && _compare(_array[right_child], _array[newIndex]) < 0)
      newIndex = right_child;
    if(newIndex != i){
      _swap(newIndex, i);
      _heapify(newIndex);
    }
  }
  
  function _parent(i){
    return i >> 1;
  }

  function _left_child(i){
    return i << 1;
  }

  function _right_child(i){
    return i << 1 | 1;
  }
}

function KeyMap(stringify){
  
  var map = {};

  var _size=0;
  
  this.put = function(key, value){
    var string = stringify(key);
    if(map[string] == undefined)
      _size++;
    map[string] = value;
  }

  this.print = function(){
    console.log(map);
  }
  
  this.get = function(key){
    return map[stringify(key)];
  }
  
  this.remove = function(key){
    var string = stringify(key);
    if(map[string] != undefined)
      _size--;
    delete map[stringify(key)];
  }
  
  this.each = function(callback){
    for(var key in map){
      callback(key, map[key]);
    }
  }

  this.keys = function(){
    return map.keys();
  }

  this.size = function(){
    return _size;
  }
}

var controls = new Controls();
