const maincanvas = document.getElementById('gamearena');
const maincontext = maincanvas.getContext('2d');

const ghostcanvas = document.getElementById('ghostarena');
const ghostcontext = ghostcanvas.getContext('2d');

const bullpencanvas = document.getElementById('bullpenarea');
const bullpencontext = bullpencanvas.getContext('2d');

maincontext.scale(30, 30);
ghostcontext.scale(30, 30);
bullpencontext.scale(20, 20);

const gamepiece = { position: { x: 0, y: 0 }, matrix: null };
const bullpenpiece = { position: { x: 0, y: 0 }, matrix: null };

const bp = { h: bullpencanvas.height, w: bullpencanvas.width, c: "#ccc" };

const gamearena = canvas(20, 10);
const ghostarena = canvas(20, 10);
const bullpen = canvas(4, 2);

const colors = [
    null, 
    '0,     255,    255',   /* I cyan */
    '0,     0,      255',   /* J blue */
    '255,   165,    0',     /* L orange */
    '255,   255,    0',     /* O yellow */
    '0,     128,    0',     /* S green */
    '128,   0,      128',   /* T purple */
    '255,   0,      0'      /* Z red */
];

const bg = document.getElementById('bg');
const cube = document.getElementById('cube');
const tetris = document.getElementById('tetris');

var standby = assignPiece();
var cancelId = 0;

var dropCounter = 0;
var dropSpeed = 1000;
let originalDropSpeed = dropSpeed;
var time = 0;
let gameOverStatus = false;
let collisionNum = 0;

let playTime = 0;
var score = 0;
var level = 1;
var lines = 0;

maincontext.drawImage(bg, 0, 0, 10, 20);
document.addEventListener('keydown', kbcontrols);

function kbcontrols(event) {
    if (event.keyCode === 13) {
        document.querySelector("#startDirection").style.display = "none";
        setInterval(timer, 1000);
        document.removeEventListener('keydown', kbcontrols); //For the "Press ENTER to start"
        document.addEventListener('keydown', playercontrols);
        document.addEventListener("keyup", deactivateBtn);

        initiateNewGamePiece(standby);
        loadBullpen();
         
        requestAnimationFrame(run);
    }
}

function timer() {
    var date = new Date(null);
    if (gameOverStatus == false) {
        date.setSeconds(++playTime)
        if (playTime < 3600) {
            document.querySelector("#timer").innerHTML = date.toISOString().substr(14, 5);
        }
        else {
            document.querySelector("#timer").innerHTML = date.toISOString().substr(11, 8);
        }
        
    }
    else {
        date.setSeconds(playTime);
        if (playTime < 3600) {
            document.querySelector("#timer").innerHTML = date.toISOString().substr(14, 5);
        }
        else {
            document.querySelector("#timer").innerHTML = date.toISOString().substr(11, 8);
        }
    }
}

function playercontrols(event) {
    switch (event.keyCode) {
        case 37: /* left arrow; move left   */ shiftShape(-1); document.querySelector("#leftArrow").style.backgroundColor = "#AAAAFF"; break;
        case 39: /* right arrow; move right */ shiftShape(1); document.querySelector("#rightArrow").style.backgroundColor = "#AAAAFF"; break;
        case 32: /* space dropFast()        */ dropFast(); document.querySelector("#spacebar").style.backgroundColor = "#AAAAFF"; break;
        case 38: /* up arrow; rotate right  */ rotateShape(1); document.querySelector("#upArrow").style.backgroundColor = "#AAAAFF"; break;
        case 40: /* down arrow; drop piece  */ dropShape(); document.querySelector("#downArrow").style.backgroundColor = "#AAAAFF"; break;
        case 88: /* x; rotate right         */ rotateShape(1); document.querySelector("#xBtn").style.backgroundColor = "#AAAAFF"; break;
        case 90: /* z; rotate left          */ rotateShape(-1); document.querySelector("#zBtn").style.backgroundColor = "#AAAAFF"; break;
        case 27: /* esc; restart              */ restartGame(); break;
    }
}

function deactivateBtn(event) { //For the visual on-screen keyboard
    switch (event.keyCode) {
        case 37: document.querySelector("#leftArrow").style.backgroundColor = "#DDD"; break;
        case 39: document.querySelector("#rightArrow").style.backgroundColor = "#DDD"; break;
        case 32: document.querySelector("#spacebar").style.backgroundColor = "#DDD"; break;
        case 38: document.querySelector("#upArrow").style.backgroundColor = "#DDD"; break;
        case 40: document.querySelector("#downArrow").style.backgroundColor = "#DDD"; break;
        case 88: document.querySelector("#xBtn").style.backgroundColor = "#DDD"; break;
        case 90: document.querySelector("#zBtn").style.backgroundColor = "#DDD"; break;
    }
}

function assignPiece() {
    let pieces = 'TJLOSZI';
    return pieces[pieces.length * Math.random() | 0];
}

function canvas(height, width) {
    let space = [];

    while (height--) {
        space.push(new Array(width).fill(0));
    }

    return space;
}

function clearRow() {
    let rows = 0;

    loop: for (let y = gamearena.length - 1; y > 0; --y) {
        for (let x = 0; x < gamearena[y].length; ++x) {
            if (gamearena[y][x] === 0) {
                continue loop;
            }
        }

        let row = gamearena.splice(y, 1)[0].fill(0);
        gamearena.unshift(row);
        ++y;

        rows++;
        lines += 1;
    }
    updateScore();
}

function updateScore(rows) {
    switch (rows) {
        case 1: score += 10; break;
        case 2: score += 30; break;
        case 3: score += 50; break;
        case 4: score += 80; break;
    }
    if (lines >= 5 * level) {
        level += 1;
        if (dropSpeed > 100) {
            dropSpeed -= 100;
            originalDropSpeed = dropSpeed;
        }
    }
    // rows *= 2;
    displayScore();
}

function collision() {
    for (let y = 0; y < gamepiece.matrix.length; ++y) {
        for (let x = 0; x < gamepiece.matrix[y].length; ++x) {
            if (gamepiece.matrix[y][x] !== 0 && (gamearena[y + gamepiece.position.y] && gamearena[y + gamepiece.position.y][x + gamepiece.position.x]) !== 0) {
                if (dropSpeed == 0) { //if dropFast was used
                    dropSpeed = originalDropSpeed; //reset the dropSpeed after tetromino lands
                    document.addEventListener('keydown', playercontrols); //re-enable controls
                }
                return true;
            }
        }
    }
    return false;
}

function displayScore() {
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
    document.getElementById('lines').innerText = lines;
}

function dropShape() {
    if(gameOverStatus == false) {
        gamepiece.position.y++;

        if (collision()) {
            gamepiece.position.y--;
            fuse();
            if (gameOverStatus == false) {
                initiateNewGamePiece(standby);
                loadBullpen();
            }
            clearRow();
        }

        dropCounter = 0;
    }
}

function dropFast() {
    document.removeEventListener('keydown', playercontrols); //disable controls until the tetromino lands
    dropSpeed = 0;

    dropShape();
}

function fuse() {
    gamepiece.matrix.forEach((row, y) => {
        row.forEach((column, x) => {
            if (column !== 0)
            {
                try {
                    gamearena[y + gamepiece.position.y][x + gamepiece.position.x] = column;
                }
                catch {
                    console.log("Boundaries error"); //Refer to "Bugs" section of the README.md file in the repo.
                    gameOver();
                }
            }
        });
    });
}

function gameOver() {
    gameOverStatus = true;
    document.querySelector("#gameOverMsg").style.display = "block";

    //only prompt to enter name if the leaderboard successfully loaded from API & score is > 0
    if (document.querySelector("#leaderboard").style.display == "block" && score > 0) {
        document.querySelector("#namePrompt").style.display = "block";
        document.querySelector("#playername").focus();
        document.querySelector("#highscore").value = score;
    }
}

function restartGame() {
    window.location.reload();
}

function gamePiece(shape) {
    switch (shape) {
        case 'I': 
        return [
            [0, 0, 0, 0], 
            [1, 1, 1, 1], 
            [0, 0, 0, 0], 
            [0, 0, 0, 0]
        ]; 

        case 'J': 
        return [
            [2, 0, 0], 
            [2, 2, 2], 
            [0, 0, 0]
        ]; 

        case 'L': 
        return [
            [0, 0, 3], 
            [3, 3, 3], 
            [0, 0, 0]
        ]; 

        case 'O': 
        return [
            [4, 4], 
            [4, 4]
        ]; 

        case 'S': 
        return [
            [0, 5, 5], 
            [5, 5, 0], 
            [0, 0, 0]
        ]; 

        case 'T': 
        return [
            [0, 0, 0], 
            [6, 6, 6], 
            [0, 6, 0]
        ];

        case 'Z': 
        return [
            [7, 7, 0], 
            [0, 7, 7], 
            [0, 0, 0]
        ]; 
    }
}

function initiateNewGamePiece(n) {
    if (gameOverStatus == false) {
        gamepiece.matrix = gamePiece(n);
        gamepiece.position.x = (gamearena[0].length / 2 | 0) - (gamepiece.matrix[0].length / 2 | 0);
        gamepiece.position.y = 0;

        if (collision()) {
            collisionNum++;
            if (collisionNum >= 3) { //Let the tetrominos overlap for a bit before ending the game
                gameOver();
            }
        }
    }
}

function loadBullpen() {
    standby = assignPiece();

    bullpencontext.clearRect(0, 0, bp.w, bp.h);
    bullpencontext.fillStyle = "rgba(255, 255, 255, 0)";
    bullpencontext.fillRect(0, 0, bp.w, bp.h);

    bullpenpiece.matrix = gamePiece(standby);

    renderElement(bullpen, { x: 0, y: 1 }, bullpencontext);
    renderElement(bullpenpiece.matrix, { x: 0, y: 0 }, bullpencontext);
}

function drawCanvases() {
    maincontext.clearRect(0, 0, maincanvas.width, maincanvas.height);
    maincontext.drawImage(bg, 0, 0, 10, 20);

    renderElement(gamearena, { x: 0, y: 0 }, maincontext);
    renderElement(gamepiece.matrix, gamepiece.position, maincontext);
}

function drawGhosts() {
    renderGhost(ghostarena, { x: 0, y: 0 }, ghostcontext);
    renderGhost(gamepiece.matrix, gamepiece.position, maincontext);
}


function renderElement(element, offset, context) {
    element.forEach((row, ypos) => {
        row.forEach((color, xpos) => {
            if (color !== 0) {
                context.globalCompositeOperation='source-over'; //puts the Tetromino atop the other elements (like z-index)
                context.drawImage(cube, xpos + offset.x, ypos + offset.y, 1, 1);
                context.fillStyle = "rgba(" + colors[color] + ", 0.6)";
                context.fillRect(xpos + offset.x, ypos + offset.y, 1, 1);
            }
        });
    });
}

function renderGhost(element, offset, context) {
    element.forEach((row, ypos) => {
        row.forEach((color, xpos) => {
            if (color !== 0) 
            {
                context.globalCompositeOperation='destination-over'; //puts the ghost under the Tetromino (like z-index)
                context.fillStyle = "#999";
                context.fillRect(xpos + offset.x, ypos + offset.y, 1, 20);
            }
        });
    });
}

function rotate(shape, direction) {
    for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
        }
    }

    if (direction > 0) {
        shape.forEach((row) => { 
            row.reverse(); 
        });
    }
    else {
        shape.reverse();
    }
}

function rotateShape(direction) {
    let offset = 1;

    rotate(gamepiece.matrix, direction);

    while (collision()) {
        gamepiece.position += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));

        if (offset > gamepiece.matrix[0].length) {
            rotate(gamepiece.matrix, -direction);
            gamepiece.position.x = gamepiece.position;
            return;
        }
    }
}

function run(t = 0) {
    const newTime = t - time;

    dropCounter += newTime;

    if (dropCounter > dropSpeed) {
        dropShape();
    }

    time = t;

    drawCanvases();
    drawGhosts();
    cancelId = requestAnimationFrame(run);
}

function shiftShape(offset) {
    gamepiece.position.x += offset;

    if (collision()) {
        gamepiece.position.x -= offset;
    }
}