/**
* Represents a scene with grids.
* @constructor
*/
var Scene = function(options){
 //the canvas html element 
 var canvas = document.getElementById("canvas");
 
 //the context for drawing on canvas
 var ctx=canvas.getContext("2d");
 //
 var isDragging = false;

 var lineWidth = options.hasOwnProperty('lineWidth') && !isNaN(options.lineWidth) ? options.lineWidth : 0.5;
 var startFillColor = options.hasOwnProperty('startFillColor') && typeof options.startFillColor === 'string' ? options.startFillColor : "#FF0000";
 var endFillColor = options.hasOwnProperty('endFillColor') && typeof options.endFillColor === 'string' ? options.endFillColor : "#00FF00";
 var gridColor = options.hasOwnProperty('gridColor') && typeof options.gridColor === 'string' ? options.gridColor : "#000000";
 var cellWidth = isNaN(options.cellWidth) ? 10 : options.cellWidth;

 function fillCellRound(cell, color){
  ctx.fillStyle=typeof color === 'string' ? color : gridColor;
  ctx.beginPath();
  ctx.arc(cell.x/2, cell.y/2, cellWidth/2, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
 }
 
 canvas.width = window.screen.width - 2*cellWidth;
 canvas.height = window.screen.height - 2*cellWidth;

 return {
          draw: function(cells){
            var start = cells.start;
            var end = cells.end;
            var paths = cells.paths;
            var blocks = cells.blocks;

            ctx.lineWidth=lineWidth;
            ctx.fillStyle=gridColor;

            //horizontal lines
            for(var i=0; i<=canvas.height; i+=cellWidth){
              ctx.moveTo(0,i);
              ctx.lineTo(canvas.width,i);
              ctx.stroke();
            }
            //vertical lines
            for(i=0; i<=canvas.width; i+=10){
               ctx.moveTo(i,0);
               ctx.lineTo(i,canvas.height);
               ctx.stroke();
            }

          },
          setCanavasWidth: function(width){
            canvas.width = width;
          },
          setCanavasHeight: function(height){
            canvas.height = height;
          },
          fillCell: function (cell, color){
            ctx.fillStyle=typeof color === 'string' ? color : gridColor;
            ctx.fillRect(cell.x, cell.y, cellWidth, cellWidth);
          },
          fillCellRound: function(cell, color){
            ctx.beginPath();
            ctx.arc(cell.x/2, cell.y/2, cellWidth/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
          },
          getCellWidth: function(){
            return cellWidth;
          }
        };
};






/**
* Represents the astar algorithm.
* @constructor
* @param {object} scene - A Scene object on which the algorithm should preform the search.
* @param {object} start - An object with properties x and y.
* @param {object} end - An object with properties x and y.
*/
var AStar = function(scene){
  var start, end, open = [], blocks = [], state = 0;
  /**
  * private function to calculate euclidean distance between two points.
  * @param {int} p - The start point
  * @param {int} q - The end point
  * @returns {number} - The heuristic distance between the input point.
  */
  function heuristicEuclideanDistance(p,q){
    return Math.sqrt((p.x-q.x)*(p.x-q.x)+(p.y-q.y)*(p.y-q.y));
  }
  
  /**
  * Checks if an array of points contains a point.
  * @param {array} array - An array of points
  * @param {point} point - A point to search for in array.
  * @returns {boolean} - true if the point exists in the array, false otherwise.
  */
  function contains(array, point){
  for(var i=0;i<arr.length; i++){
    if(arr[i].x==point.x && arr[i].y==point.y){
      return true;
      }
    }
    return false;
  }

  /* event bindings */
  $('#canvas').on('click', function(evt){
  var xfloor = Math.floor(evt.offsetX/10)*10;
  var yfloor = Math.floor(evt.offsetY/10)*10;
  console.log(evt.pageX - $(this).offset().left);
  switch(state){
    case 0: scene.fillCellRound({x: xfloor, y: yfloor}, "red");
    start = {x: xfloor, y: yfloor, gscore: 0, hscore: 0};
    state++;
    return;
    case 1: scene.fillCellRound({x: xfloor, y: yfloor}, "green");
    end = {x: xfloor, y: yfloor};
    state++;
    return;
    case 2: return;

  }
 });

  $('#canvas').on('mousemove', function(evt){

  });


  /* Exceptions */
  function PointException(message){
    var name = arguments.callee.name;
    return {
      getName: function(){
        return name;
      },
      getMessage: function(){
        return message;
      }
    };    
  }

  return {
    /**
    * Generates random blocks on a scene.
    */
    generateRandomBlocks: function(){
      if(typeof start === 'undefined' || typeof end === 'undefined')
        throw new PointException('Before generating random blocks, please specify start and end points');
      for(i=0; i< 2000; i++){
        var x=Math.floor((Math.random() * 100))*10;
        var y=Math.floor((Math.random() * 100))*10;
        if(x!== start.x && y!== start.y && x!==end.x && y!==end.y){
          blocked.push({x:x, y:y});
          scene.fillCell(x, y, null);
        }
      }
    },
    /**
    * Executes A-star search on the scene.
    */
    run: function(){

    },
    /**
    *
    */
    reconstructPath: function (cameFrom, current){
      var total_path=[];
      total_path.push(cameFrom);
      while(cameFrom.cameFrom !== undefined){
        cameFrom=cameFrom.cameFrom;
        total_path.push(cameFrom);
      }
      return total_path;
    }
  };
};


var Controls = function(){

  var control = $('#controls');
  var messages = $('#spn-messages');
  var scene = new Scene({});
  scene.draw({});
  var astar = new AStar(scene);

  //bind click handlers on control buttons
  $('#controls #btn-random-blocks').on('click', function(){
    try{
      astar.generateRandomBlocks();
    }
    catch(err){
      messages.html(err.getName()+": "+ err.getMessage());
    }
  });

  $('#controls #btn-find-path').on('click', function(){
    try{
      astar.run();
    }
    catch(err){
      messages.html(err);
      alert(err);
    }
  });

  $('#controls #btn-reset').on('click', function(){
    scene = new Scene({});
    scene.draw({});
    astar = new AStar(scene);
  });


  return {

  };
}


var controls = new Controls();
