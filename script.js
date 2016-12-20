var start={x:800, y: 150, cost: 0, fscore: 0};
var end={x:150, y:50};
var blocked=[];
var open=[start];
var canvas;
var ctx;
var isDragging=false;


function draw(){
  //line width
  ctx.lineWidth=0.5;
  for(var i=0; i<=600; i+=10){
    ctx.moveTo(0,i);
    ctx.lineTo(1000,i);
    ctx.stroke();
  }
  
  for(i=0; i<=1000; i+=10){
    ctx.moveTo(i,0);
    ctx.lineTo(i,600);
    ctx.stroke();
  }
  
  ctx.fillStyle="#FF0000";
  ctx.fillRect(start.x, start.y, 10, 10);
  ctx.fillStyle="#00FF00";
  ctx.fillRect(end.x, end.y, 10, 10);
  

  //blocked.push({x:50, y:900});
  
  
}

function heuristicEuclideanDistance(p,q){
  return Math.sqrt((p.x-q.x)*(p.x-q.x)+(p.y-q.y)*(p.y-q.y));
}

function astar(){
  
  
  
  while(open.length !== 0){
    
    open=open.sort(function(p,q){return p.fscore-q.fscore;});
    
    var current=open[0];
    
    if(current.x===end.x && current.y===end.y){
      return reconstructPath(current.cameFrom, current);
    }
    blocked.push(current);
	// open.forEach(function(val){
		// $("#fscores").append(val.fscore+', ');
	// });
    open.splice(0,1);
    for( i=0;i<open.length; i++){
		var color='rgba(225,225,225,1)';
      fillBlock(open[i].x, open[i].y,color);
	  ctx.font = "8px Arial";
ctx.fillStyle = "black";
ctx.textAlign = "center";
if(open[i].cost !== undefined)
ctx.fillText(open[i].cost, open[i].x+5, open[i].y+8);
	  
    }
	
    var right={x: current.x+10, y: current.y, cost: current.cost+1};
    var left={x: current.x-10, y: current.y,  cost: current.cost+1};
    var up={x: current.x, y: current.y-10,  cost: current.cost+1};
    var down={x: current.x, y: current.y+10, cost: current.cost+1};
    var neighbors=[right, left, up, down];
    for(var i=0; i<neighbors.length; i++){
      if(!contains(blocked, neighbors[i])){
		var neighbor=neighbors[i];
        if(neighbor.x < 0 || neighbor.x > 999){
          blocked.push(neighbor);
          continue;
        }
        if(neighbor.y < 0 || neighbor.y > 799){
          blocked.push(neighbor);
          continue;
        }
      // The distance from start to a neighbor
	  var cc= current.cost===undefined?0:current.cost;
      var tentative_gScore = cc + 1;
      if(!contains(open, neighbor))
	  {
		  open.push(neighbor);
		  neighbor.fscore=tentative_gScore;
	  }
	  else if(tentative_gScore >= neighbor.cost)
		  continue;		// This is not a better path.
      // This path is the best until now. Record it!
      neighbor.cameFrom = current;
      neighbor.cost= tentative_gScore;
      neighbor.fscore = neighbor.cost + heuristicEuclideanDistance(neighbor, end);
    }
    }
  }
    return;
  
}

function reconstructPath(cameFrom, current){
  var total_path=[];
  total_path.push(cameFrom);
  while(cameFrom.cameFrom !== undefined){
    cameFrom=cameFrom.cameFrom;
    total_path.push(cameFrom);
    
  }
  
  return total_path;
}

function contains(arr, point){
  for(var i=0;i<arr.length; i++){
    //console.log(i);
    if(arr[i].x==point.x && arr[i].y==point.y){
		
      return true;
    }
  }
  return false;
}

function findPath(){
  var path=astar();
  if(path !== undefined){
    ctx.fillStyle="rgba(0,0,255,1)";
    for( i=0;i<path.length-1; i++){
      fillBlock(path[i].x, path[i].y,'yellow');
	  ctx.font = "8px Arial";
ctx.fillStyle = "black";
ctx.textAlign = "center";
if(path[i].cost !== undefined)
ctx.fillText(path[i].cost, path[i].x+5, path[i].y+8);
    }
  }
  else{
    alert("No Path Exists!");
  }
}

function randomBlocks(){
  //add random blockades
  
  ctx.fillStyle="#000000";
  for(i=0; i< 2000; i++){
    var x=Math.floor((Math.random() * 100))*10;
    var y=Math.floor((Math.random() * 100))*10;
    if(x!==start.x||y !== start.y){
      if(x!==end.x||y !== end.y){
        blocked.push({x:x, y:y});
  ctx.fillRect(x,y, 10, 10);
      }
    }
  }
}

$(document).ready(function(){
  canvas=document.getElementById("canvas");
  ctx=canvas.getContext("2d");
  $("#canvas")
  .mousedown(function(evt){
    isDragging = true;
  }).mousemove(function(evt){
    if(isDragging){
      var x=Math.floor(evt.offsetX/10)*10;
      var y=Math.floor(evt.offsetY/10)*10;
      fillBlock(x, y, "#000000");
      blocked.push({x:x, y:y});
    }
  }).mouseup(function(evt){
    var wasDragging = isDragging;
    isDragging = false;
    if (!wasDragging) {
      var x=Math.floor(evt.offsetX/10)*10;
      var y=Math.floor(evt.offsetY/10)*10;
      fillBlock(x, y, "#000000");
      blocked.push({x:x, y:y});
    }
});
  
});
$(document).ready(function(){
	$("#canvas").mousemove(function(evt){
		//find gscore
		var x=Math.floor(evt.offsetX/10)*10;
		var y=Math.floor(evt.offsetY/10)*10;
		for(var i=0; i<open.length; i++){
			if(open[i].x==x && open[i].y==y){
				$("#gscore").text("GScore Open: "+open[i].cost);
				break;
			}
		}
		for(var i=0; i<blocked.length; i++){
			if(blocked[i].x==x && blocked[i].y==y){
				$("#gscore").text("GScore Closed: "+blocked[i].cost);
				break;
			}
		}
	});
});
function fillBlock(x, y, color){
  ctx.fillStyle=color;
  ctx.fillRect(x, y, 10, 10);
}