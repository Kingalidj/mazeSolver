//let cols, rows, maze, openSet, closedSet, start, end, path, current, noSolution, finished, grid, backgroundCol, wallCol, pathCol, mazeCurrent, stack;
let size = 5;
let step = 1500;
let restart = false;

function setup() {
  backgroundCol = color(48);
  wallCol = color(33);
  pathCol = color(66);
  solutionCol = color(255,63,128);
  preset();
}

function draw() {
  if (restart){
    delay(10);
    preset();
    restart = false;
  }  
  if (finished)restart = true;
  if(!finished) {
  clearPath();
  for (let i = 0; i < step; i++){
  solveMaze();
  }
  drawPath();
  }else{
    drawSolution();
  }
}

function windowResized() {
  preset();
}


//-------------------------------------------

function preset() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style('display', 'block');
  //canvas.style('z-index', '-1');
  canvas.parent('sketch-holder');
  createMaze();
  createGrid();
  drawWalls();
}
function drawWalls() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].show(backgroundCol);
    }
  }
}
function clearPath() {
  for (let i = 0; i < path.length; i++) {
    path[i].show(backgroundCol);
  }
}
function drawPath() {
  for (let i = 0; i < path.length; i++) {
    path[i].show(pathCol);
  }
}
function drawSolution() {
  for (let i = 0; i < path.length; i++) {
    path[i].show(solutionCol);
  }
}
function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}
function heuristic(a, b) {
  let d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}
function removeWalls(a, b) {
  let x = (a.i - b.i) / 2;
  let y = (a.j - b.j) / 2;
  maze[a.i - x][a.j].visited = true;
  maze[a.i][a.j - y].visited = true;
}
function createMaze() {
  stack = [];
  maze = [];
  let finished = false;
  createMazeGrid();
  while (!finished) {
    mazeCurrent.visited = true;
    let next = mazeCurrent.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(mazeCurrent);
      removeWalls(mazeCurrent, next);
      mazeCurrent = next;
    } else if (stack.length > 0) {
      mazeCurrent = stack.pop();
    }
    if (mazeCurrent == maze[0][0]) {
      finished = true;
    }
  }
}
function createMazeGrid() {
  noStroke();
  cols = floor(width / size);
  rows = floor(height / size);
  for (let i = 0; i < cols; i++) {
    maze[i] = [];
    for (let j = 0; j < rows; j++) {
      maze[i][j] = new cell(i, j);
    }
  }
  mazeCurrent = maze[0][0];
}
function createGrid() {
  openSet = [];
  closedSet = [];
  path = [];
  noSolution = false;
  finished = false;
  grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new spot(i, j);
    }
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }
  start = grid[0][round(rows / 2)];
  end = grid[cols - 2][round(rows / 2)];
  start.wall = false;
  end.wall = false;
  openSet.push(start);
}
function solveMaze() {
  if (openSet.length > 0) {
    let lowestIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIndex].f) lowestIndex = i;
    }
    current = openSet[lowestIndex];
    if (current === end) {
      finished = true;
      console.log("solved");
    }
    removeFromArray(openSet, current);
    closedSet.push(current);
    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG = current.g + 1;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
          }
        } else {
          neighbor.g = tempG;
          openSet.push(neighbor);
        }
        neighbor.h = heuristic(neighbor, end);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.previous = current;
      }
    }
  } else {
    noSolution = true;
    finished = true;
    console.log("failed");
  }
  if (!finished) {
    path = [];
    let temp = current;
    path.push(temp);
    while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
    }
  }
}
class cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.visited = false;
  }
  show() {
    fill(50);
    if (this.visited) fill(150);
    rect(this.i * size, this.j * size, size, size);
  }
  checkNeighbors() {
    let neighbors = [];
    if (this.i > 1 && !maze[this.i - 2][this.j].visited) neighbors.push(maze[this.i - 2][this.j]);
    if (this.i < cols - 2 && !maze[this.i + 2][this.j].visited) neighbors.push(maze[this.i + 2][this.j]);
    if (this.j > 1 && !maze[this.i][this.j - 2].visited) neighbors.push(maze[this.i][this.j - 2]);
    if (this.j < rows - 2 && !maze[this.i][this.j + 2].visited) neighbors.push(maze[this.i][this.j + 2]);
    if (neighbors.length > 0) {
      return random(neighbors);
    } else {
      return undefined;
    }
  }
}
class spot {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.wall = !maze[i][j].visited;
  }
  show(col) {
    fill(col);
    if (this.wall) fill(wallCol);
    rect(this.i * size, this.j * size, size, size)
  }
  addNeighbors(grid) {
    let i = this.i;
    let j = this.j;
    if (i < cols - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
  }
}
function delay(t) {
  let time = t * pow(10, 8);
  for (let i = 0; i < time; i++){

  }
}