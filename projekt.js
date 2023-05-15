"use strict";

class Canvas {
    //TWORZENIE GRY
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.maze = [];
    }

    static instances = 0;
    static games = 0;
    static customGames = 0;
    static lostGames = 0;
    static drawnWalls = 0;
    static sidewinderCount = 0;
    static aldousBroderCount = 0;
    static depthFirstSearchCount = 0;
    static huntAndKillCount = 0;
    static ellerCount = 0;
    static exportedGames = 0;
    static exportedGamesAsFile = 0;
    static importedGames = 0;

    start(mode) {
        //DODAWANIE KAWAŁKÓW LABIRYNTU DO LABIRYNTU
        Canvas.instances++;
        if (mode == "generator") Canvas.games++;
        else Canvas.customGames++;
        for (let i = 0; i < this.row; i++) {
            let rows = [];
            for (let i2 = 0; i2 < this.col; i2++) {
                let part = new Index(i2, i); //i2 = KOLUMNY i = RZĘDY
                rows.push(part);
            }
            this.maze.push(rows);
        }
        this.addNeighbors();
    }

    drawWalls(ctx) {
        //RYSOWANIE ŚCIAN NA PODSTAWIE ISTNIENIA ŚCAINY true/false
        Canvas.drawnWalls++;
        if (!niewidoczneScianyValue) {
            for (let i = 0; i < this.col; i++) {
                let Y = i * (cvs.height / this.row); //OBECNA POZYCJA OSI Y
                for (let i2 = 0; i2 < this.row; i2++) {
                    let X = i2 * (cvs.width / this.col); //OBECNA POZYCJA OSI X
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = "black";
                    if (this.maze[i][i2].walls.wallN) {
                        //ŚCIANA GÓRNA
                        ctx.beginPath();
                        ctx.moveTo(X, Y); // X TAKI SAM, Y TAKI SAM
                        ctx.lineTo(X + cvs.width / this.col, Y); //X ZMIENIA SIE O JEDEN CELL, Y JEST TAKI SAM
                        ctx.stroke();
                    }
                    if (this.maze[i][i2].walls.wallS) {
                        //ŚCIANA DOLNA
                        ctx.beginPath();
                        ctx.moveTo(X, parseInt(Y + cvs.height / this.row)); // X TAKI SAM, Y PRZESUNIĘTY O JEDEN CELL
                        ctx.lineTo(parseInt(X + cvs.width / this.col), Y + cvs.height / this.row); // X PRZEUNIĘTY O JEDEN CELL, Y PRZESUNIĘTY O JDEDN SELL
                        ctx.stroke();
                    }
                    if (this.maze[i][i2].walls.wallW) {
                        //ŚCIANA LEWA
                        ctx.beginPath();
                        ctx.moveTo(X, Y);
                        ctx.lineTo(X, Y + cvs.height / this.row); //Y PRZESUNIĘTY O JEDEN CELL
                        ctx.stroke();
                    }
                    if (this.maze[i][i2].walls.wallE) {
                        //ŚCIANA PRAWA
                        ctx.beginPath();
                        ctx.moveTo(X + cvs.width / this.col, Y); // X PRZESUNIĘTY O JEDEN CELL
                        ctx.lineTo(X + cvs.width / this.col, Y + cvs.height / this.row); //X I Y PRZESUNIĘTY O JEDEN CELL
                        ctx.stroke();
                    }
                }
            }
        }
        renderDetailistInformations();
    }

    addNeighbors() {
        //DODAWANIE SĄSIADUJĄCYCH KOMÓREK
        this.maze.flat().forEach(function (e) {
            e.neighbors = [];
        });
        for (let i = 0; i < this.row; i++) {
            for (let i2 = 0; i2 < this.col; i2++) {
                if (i === 0) {
                    this.maze[i][i2].neighbors.push(undefined);
                } else {
                    this.maze[i][i2].neighbors.push(this.maze[i - 1][i2]);
                }
                this.maze[i][i2].neighbors.push(this.maze[i][i2 + 1]);
                if (i === this.row - 1) {
                    this.maze[i][i2].neighbors.push(undefined);
                } else {
                    this.maze[i][i2].neighbors.push(this.maze[i + 1][i2]);
                }
                this.maze[i][i2].neighbors.push(this.maze[i][i2 - 1]);
            }
        }
    }

    async sidewinder() {
        Canvas.sidewinderCount++;
        let currentPos = [0, 0];
        let run = [];
        for (let i = 0; i < this.col - 1; i++) {
            this.maze[0][i].walls.wallE = false;
            this.maze[0][i + 1].walls.wallW = false;
        }
        for (let i = 1; i < this.col; i++) {
            run = [];
            for (let i2 = 0; i2 < this.row; i2++) {
                let random = Math.floor(Math.random() * 2);
                currentPos = [i, i2];
                run.push([...currentPos]);
                if (random == 0 && i2 < this.row - 1) {
                    this.maze[currentPos[0]][currentPos[1]].walls.wallE = false;
                    this.maze[currentPos[0]][currentPos[1] + 1].walls.wallW = false;
                } else if (run.length != 0) {
                    let random2 = run[parseInt(Math.random() * run.length)];
                    this.maze[random2[0]][random2[1]].walls.wallN = false;
                    this.maze[random2[0] - 1][random2[1]].walls.wallS = false;

                    run = [];
                }
                if (animatedGenerationInput.checked) await animatedGeneration();
            }
        }
        enableInputs();
        createToast("toastInfo", "Labirynt został pomyślnie utworzony");
    }

    async mazeMain(tryby, modes) {
        // PIERWSZA METODA GENEROWANIA LABIRYNTU
        let currentPos = [0, 0]; // OBCENA POZYCJA
        const history = [];
        this.maze[0][0].visited = true;
        if (tryby[0].checked) Canvas.depthFirstSearchCount++;
        else Canvas.huntAndKillCount++;
        for (let i = 0; i < this.row * this.col * 3; i++) {
            let random = parseInt(Math.random() * 4);
            let item = this.maze[currentPos[0]][currentPos[1]];
            if (random == 0 && currentPos[0] > 0 && this.maze[currentPos[0] - 1][currentPos[1]] && !this.maze[currentPos[0] - 1][currentPos[1]].visited) {
                this.maze[currentPos[0]][currentPos[1]].walls.wallN = false;
                currentPos[0]--;
                this.maze[currentPos[0]][currentPos[1]].walls.wallS = false;
                item.visited = true;
                history.push([...currentPos]);
            } else if (random == 1 && currentPos[1] < this.col - 1 && this.maze[currentPos[0]][currentPos[1] + 1] && !this.maze[currentPos[0]][currentPos[1] + 1].visited) {
                this.maze[currentPos[0]][currentPos[1]].walls.wallE = false;
                currentPos[1]++;
                this.maze[currentPos[0]][currentPos[1]].walls.wallW = false;
                item.visited = true;
                history.push([...currentPos]);
            } else if (random == 2 && currentPos[0] < this.row - 1 && this.maze[currentPos[0] + 1][currentPos[1]] && !this.maze[currentPos[0] + 1][currentPos[1]].visited) {
                this.maze[currentPos[0]][currentPos[1]].walls.wallS = false;
                currentPos[0]++;
                this.maze[currentPos[0]][currentPos[1]].walls.wallN = false;
                item.visited = true;
                history.push([...currentPos]);
            } else if (random == 3 && currentPos[1] > 0 && this.maze[currentPos[0]][currentPos[1] - 1] && !this.maze[currentPos[0]][currentPos[1] - 1].visited) {
                this.maze[currentPos[0]][currentPos[1]].walls.wallW = false;
                currentPos[1]--;
                this.maze[currentPos[0]][currentPos[1]].walls.wallE = false;
                item.visited = true;
                history.push([...currentPos]);
            } else if (testerEl(this.maze[currentPos[0]][currentPos[1]].neighbors)) {
                if (tryby[0].checked) {
                    for (let i2 = history.length - 1; i2 > 0; i2--) {
                        try {
                            if (!this.maze[history[i2][0] - 1][history[i2][1]].visited || !this.maze[history[i2][0]][history[i2][1] + 1].visited || !this.maze[history[i2][0] + 1][history[i2][1]].visited || !this.maze[history[i2][0]][history[i2][1] - 1].visited) {
                                currentPos = history[i2];
                                item.visited = true;
                                break;
                            }
                        } catch (error) {}
                    }
                } else {
                    for (let i2 = 0; i2 < this.row; i2++) {
                        for (let i3 = 0; i3 < this.col; i3++) {
                            if (!this.maze[i2][i3].visited) {
                                try {
                                    if (this.maze[i2 - 1][i3].visited || this.maze[i2][i3 + 1].visited || this.maze[i2 + 1][i3].visited || this.maze[i2][i3 - 1].visited) {
                                        if (this.maze[i2 - 1][i3].visited) {
                                            currentPos = [i2 - 1, i3];
                                        } else if (this.maze[i2][i3 + 1].visited) {
                                            currentPos = [i2, i3 + 1];
                                        } else if (this.maze[i2 + 1][i3].visited) {
                                            currentPos = [i2 + 1, i3];
                                        } else if (this.maze[i2][i3 - 1].visited) {
                                            currentPos = [i2, i3 - 1];
                                        }
                                        item.visited = true;
                                        i2, (i3 = 100);
                                    }
                                } catch (error) {}
                            }
                        }
                    }
                }
            }
            if (this.maze.flat().every(end)) break;

            if (animatedGenerationInput.checked) await animatedGeneration();
            else if (modes[2].checked && i % 50 == 0) await animatedGeneration();
        }
        await animatedGeneration();
        enableInputs();
        createToast("toastInfo", "Labirynt został pomyślnie utworzony");
    }

    async aldousBroder() {
        Canvas.aldousBroderCount++;
        let oneTimeX = Math.floor(Math.random() * (this.col - 1));
        let oneTimeY = Math.floor(Math.random() * (this.row - 1));
        let currentPosAB = [oneTimeX, oneTimeY];
        this.maze[oneTimeX][oneTimeY].visited = true;
        for (let i = 0; i < Infinity; i++) {
            let random = parseInt(Math.random() * 4);
            let item = this.maze[currentPosAB[0]][currentPosAB[1]];
            if (item.neighbors[random] != undefined) {
                if (random == 0 && currentPosAB[0] > 0 && !this.maze[currentPosAB[0] - 1][currentPosAB[1]].visited) {
                    this.maze[currentPosAB[0] - 1][currentPosAB[1]].visited = true;
                    this.maze[currentPosAB[0]][currentPosAB[1]].walls.wallN = false;
                    this.maze[currentPosAB[0] - 1][currentPosAB[1]].walls.wallS = false;
                    currentPosAB = chooseFromVisited(this.maze.flat());
                } else if (random == 1 && currentPosAB[1] < this.col - 1 && !this.maze[currentPosAB[0]][currentPosAB[1] + 1].visited) {
                    this.maze[currentPosAB[0]][currentPosAB[1] + 1].visited = true;
                    this.maze[currentPosAB[0]][currentPosAB[1]].walls.wallE = false;
                    this.maze[currentPosAB[0]][currentPosAB[1] + 1].walls.wallW = false;
                    currentPosAB = chooseFromVisited(this.maze.flat());
                } else if (random == 2 && currentPosAB[0] < this.row - 1 && !this.maze[currentPosAB[0] + 1][currentPosAB[1]].visited) {
                    this.maze[currentPosAB[0] + 1][currentPosAB[1]].visited = true;
                    this.maze[currentPosAB[0]][currentPosAB[1]].walls.wallS = false;
                    this.maze[currentPosAB[0] + 1][currentPosAB[1]].walls.wallN = false;
                    currentPosAB = chooseFromVisited(this.maze.flat());
                } else if (random == 3 && currentPosAB[1] > 0 && !this.maze[currentPosAB[0]][currentPosAB[1] - 1].visited) {
                    this.maze[currentPosAB[0]][currentPosAB[1] - 1].visited = true;
                    this.maze[currentPosAB[0]][currentPosAB[1]].walls.wallW = false;
                    this.maze[currentPosAB[0]][currentPosAB[1] - 1].walls.wallE = false;
                    currentPosAB = chooseFromVisited(this.maze.flat());
                } else if (testerEl(this.maze[currentPosAB[0]][currentPosAB[1]].neighbors)) {
                    currentPosAB = chooseFromVisited(this.maze.flat());
                }
            }
            if (animatedGenerationInput.checked) await animatedGeneration();
            else if (modes[2].checked && i % 300 == 0) await animatedGeneration();
            if (this.maze.flat().every(end)) break;
        }
        await animatedGeneration();
        enableInputs();
        createToast("toastInfo", "Labirynt został pomyślnie utworzony");
    }

    async eller() {
        Canvas.ellerCount++;
    }

    async solve(testing, time) {
        let currentPos = [currentCell[0], currentCell[1]];
        let history = [];
        let orientation = 0;
        let neighbour = undefined;
        gra = false;
        this.maze.flat().forEach(function (el) {
            el.visitedIndex = 0;
        });

        if (widocznoscValue != 0) ctx.clearRect(0, 0, cvs.width, cvs.height);
        for (let i = 0; i < this.col * this.row * 100; i++) {
            if (i == 1 && repeated == 1) {
                return;
            }

            repeated = 0;
            let facing = this.maze[currentPos[0]][currentPos[1]].neighbors;
            let possibleMoves = [];

            if (animatedSolve.checked && time > 0) await sleep(time);

            for (let j = 0; j < 4; j++) {
                let neighbour = facing[j];
                if (neighbour == undefined) continue;
                if (currentPos[0] > neighbour.indexY && !this.maze[currentPos[0]][currentPos[1]].walls.wallN) {
                    possibleMoves.push(neighbour);
                } // n
                if (currentPos[1] < neighbour.indexX && !this.maze[currentPos[0]][currentPos[1]].walls.wallE) {
                    possibleMoves.push(neighbour);
                } // e
                if (currentPos[0] < neighbour.indexY && !this.maze[currentPos[0]][currentPos[1]].walls.wallS) {
                    possibleMoves.push(neighbour);
                } // s
                if (currentPos[1] > neighbour.indexX && !this.maze[currentPos[0]][currentPos[1]].walls.wallW) {
                    possibleMoves.push(neighbour);
                } // w
            }
            let lowestIndex = 100;
            for (let j = 0; j < possibleMoves.length; j++) {
                if (possibleMoves[j].visitedIndex < lowestIndex) {
                    lowestIndex = possibleMoves[j].visitedIndex;
                }
            }
            if (history.length > 0) {
                if (history[history.length - 1].indexX > currentPos[1]) {
                    orientation = 3; // w
                }
                if (history[history.length - 1].indexX < currentPos[1]) {
                    orientation = 1; // e
                }
                if (history[history.length - 1].indexY > currentPos[0]) {
                    orientation = 0; // n
                }
                if (history[history.length - 1].indexY < currentPos[0]) {
                    orientation = 2; // s
                }
            }
            history.push(this.maze[currentPos[0]][currentPos[1]]);
            for (let j = 0; j < 4; j++) {
                let tempj = j + orientation;
                if (tempj > 3) tempj -= 4;
                neighbour = facing[tempj];
                if (neighbour == undefined) continue;
                if (neighbour.visitedIndex > lowestIndex) continue;
                if (possibleMoves.includes(neighbour)) {
                    currentPos = [neighbour.indexY, neighbour.indexX];
                    if (!testing) {
                        ctx.fillStyle = "aqua";
                        ctx.fillRect(neighbour.indexX * (cvs.width / this.col), neighbour.indexY * (cvs.height / this.row), cvs.width / this.col - 2, cvs.height / this.row - 2);
                        ctx.fillStyle = "yellow";
                        ctx.fillRect(history[history.length - 1].indexX * (cvs.width / this.col), history[history.length - 1].indexY * (cvs.height / this.row), cvs.width / this.col - 2, cvs.height / this.row - 2);
                    }
                    if (history.length > 0) {
                        history[history.length - 1].visitedIndex += 1;
                    }
                    if (!testing && history.some((el) => el.indexX == currentPos[1] && el.indexY == currentPos[0])) ctx.clearRect(history[history.length - 1].indexX * (cvs.width / this.col), history[history.length - 1].indexY * (cvs.height / this.row), cvs.width / this.col - 2, cvs.height / this.row - 2);
                    break;
                }
            }
            if (currentPos[0] == koniecY && currentPos[1] == koniecX) {
                if (!testing) {
                    Canvas.lostGames++;
                    finalMultiplier = 0;
                    this.drawWalls(ctx);
                    gracz.renderEnd();
                    ctx.beginPath();
                    ctx.arc(gracz.x, gracz.y, gracz.size, 0, Math.PI * 2);
                    ctx.lineWidth = 3.5;
                    ctx.fillStyle = "red";
                    ctx.fill();
                    ctx.stroke();
                    blockMovement = true;
                    renderDetailistInformations();
                    await sleep(2000);
                    gameEnd(false);
                }
                return true;
            }
        }
        return false;
    }
}

class Player {
    // TWORZENIE GRACZA
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.endPositionX = 1000 - x;
        this.endPositionY = 1000 - y;
    }

    static renderCount = 0;
    static renderEndCount = 0;
    static moveUpCount = 0;
    static moveDownCount = 0;
    static moveLeftCount = 0;
    static moveRightCount = 0;
    static randomizeEndCount = 0;

    randomizeEnd() {
        //Losowanie końca
        Player.randomizeEndCount++;
        let randomEndX = Math.floor(Math.random() * 10) * 100;
        let randomEndY = Math.floor(Math.random() * 10) * 100;
        this.endPositionX -= randomEndX;
        this.endPositionY -= randomEndY;
    }

    render() {
        // AKTUALIZOWANIE POZYCJI GRACZA
        Player.renderCount++;

        ctx.fillStyle = "black";
        ctx.rect(0, 0, cvs.width, cvs.height);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.lineWidth = 3.5;
        if (widocznoscValue != 0) {
            ctx.clearRect(this.x - this.size * (widocznoscValue - 1), this.y - this.size * (widocznoscValue - 1), this.size * (widocznoscValue - 1) * 2, this.size * (widocznoscValue - 1) * 2);
        } else {
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            ctx.clearRect(0, 0, cvs.width, cvs.height);
        }
        ctx.fillStyle = "red";
        if (!niewidocznyGraczValue) {
            ctx.fill();
            ctx.stroke();
        }
        this.renderEnd();
    }

    render2() {
        ctx2.beginPath();
        ctx2.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx2.lineWidth = 3.5;
        ctx2.fillStyle = "red";
        ctx2.fill();
        ctx2.stroke();
    }

    renderEnd() {
        Player.renderEndCount++;
        if (!niewidocznyKoniecValue) {
            ctx.beginPath();
            ctx.arc(this.endPositionX, this.endPositionY, this.size, 0, 2 * Math.PI);
            ctx.fillStyle = "yellow";
            ctx.lineWidth = 3.5;
            ctx.fill();
            ctx.stroke();
        }
        renderDetailistInformations();
    }

    renderEnd2() {
        ctx2.beginPath();
        ctx2.arc(this.endPositionX, this.endPositionY, this.size, 0, 2 * Math.PI);
        ctx2.fillStyle = "yellow";
        ctx2.lineWidth = 3.5;
        ctx2.fill();
        ctx2.stroke();
    }

    async moveUp(moves) {
        // (moves => liczba klatek podczas ruchu)
        if (currentCell[0] > 0 && !gra.maze[currentCell[0]][currentCell[1]].walls.wallN && !gra.maze[currentCell[0] - 1][currentCell[1]].walls.wallS) {
            Player.moveUpCount++;
            currentCell[0]--;
            for (let i = 0; i < moves; i++) {
                this.y -= (this.size / moves) * 2;
                this.move();
                await sleep(1);
            }
            updateLocalStorageMainInformations();
        }
    }

    async moveRight(moves) {
        // (moves => liczba klatek podczas ruchu)
        if (currentCell[1] < gra.col && !gra.maze[currentCell[0]][currentCell[1]].walls.wallE && !gra.maze[currentCell[0]][currentCell[1] + 1].walls.wallW) {
            Player.moveRightCount++;
            currentCell[1]++;
            for (let i = 0; i < moves; i++) {
                this.x += (this.size / moves) * 2;
                this.move();
                await sleep(1);
            }
            updateLocalStorageMainInformations();
        }
    }

    async moveDown(moves) {
        // (moves => liczba klatek podczas ruchu)
        if (currentCell[0] < gra.row && !gra.maze[currentCell[0]][currentCell[1]].walls.wallS && !gra.maze[currentCell[0] + 1][currentCell[1]].walls.wallN) {
            Player.moveDownCount++;
            currentCell[0]++;
            for (let i = 0; i < moves; i++) {
                this.y += (this.size / moves) * 2;
                this.move();
                await sleep(1);
            }
            updateLocalStorageMainInformations();
        }
    }

    async moveLeft(moves) {
        // (moves => liczba klatek podczas ruchu)
        if (currentCell[1] > 0 && !gra.maze[currentCell[0]][currentCell[1]].walls.wallW && !gra.maze[currentCell[0]][currentCell[1] - 1].walls.wallE) {
            Player.moveLeftCount++;

            currentCell[1]--;
            for (let i = 0; i < moves; i++) {
                this.x -= (this.size / moves) * 2;
                this.move();
                await sleep(1);
            }
            updateLocalStorageMainInformations();
        }
    }

    move() {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.render();
        gra.drawWalls(ctx);
        numberOfMoves++;
    }
}

class Index {
    // TWORZENIE KOMÓRKI
    constructor(indexX, indexY) {
        this.indexX = indexX;
        this.indexY = indexY;
        this.visited = false;
        this.visited2 = false;
        this.walls = {
            wallN: true,
            wallE: true,
            wallS: true,
            wallW: true,
        };
        this.visitedIndex = 0;
    }
}

function end(el) {
    //sprawdzanie czy generowanie się zakończyło
    return el.visited;
}

function testerEl(el) {
    //testowanie czy tworzenie labiryntu się nie zablokowało
    let index = 0;
    for (let i = 0; i < 4; i++) {
        if (el[i] == undefined || el[i].visited) index++;
        if (index == 4) return true;
    }
}

function chooseFromVisited(el) {
    //Losowe wybieranie komórki z odwiedzonych komórek
    let visitedEl = [];
    el.forEach(function (e) {
        if (e.visited == true) visitedEl.push([e.indexY, e.indexX]);
    });
    let randomOfVisited = Math.floor(Math.random() * visitedEl.length);
    return visitedEl[randomOfVisited];
}

const sleep = async function (milliseconds) {
    //Oczekiwanie przez określoną ilość czasu
    await new Promise(function (resolve) {
        return setTimeout(resolve, milliseconds);
    });
};

async function animatedGeneration() {
    //Animowanie generowaia
    await sleep(1);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    gracz.render();
    gra.drawWalls(ctx);
}

function timerFunction() {
    sec += 1;
    if (sec == 60) {
        sec = 0;
        m++;
    }
    time.innerText = `Czas spędzony na poziomie: ${m < 10 ? `0${m}` : m}:${sec < 10 ? `0${sec}` : sec}`;
}

async function generateMaze() {
    if (tryby[0].checked) {
        await gra.mazeMain(tryby, modes);
        trybyMode = "DepthFirstSearch";
        levelHTML.innerHTML += "<span>Tryb generowania: DepthFirstSearch</span>";
    } else if (tryby[1].checked) {
        await gra.sidewinder();
        trybyMode = "SideWinder";
        levelHTML.innerHTML += "<span>Tryb generowania: Sidewinder</span>";
    } else if (tryby[2].checked) {
        await gra.mazeMain(tryby, modes);
        trybyMode = "Hunt-and-Kill";
        levelHTML.innerHTML += "<span>Tryb generowania: Hunt-and-Kill</span>";
    } else if (tryby[3].checked) {
        await gra.aldousBroder();
        trybyMode = "Aldous-Broder";
        levelHTML.innerHTML += "<span>Tryb generowania: Aldous-Broder</span>";
    } else if (tryby[4].checked) {
        await gra.eller();
        tryby = "Ellers Algorithm";
        levelHTML.innerHTML += "<span>Tryb generowania: Ellers Algorithm</span>";
    }
}

async function mainFunction() {
    //Tworzenie gry
    if (window.innerWidth < 800 || modes[0].checked || modes[1].checked || modes[2].checked || importedCustomGame != undefined) {
        if (tryby[0].checked || tryby[1].checked || tryby[2].checked || tryby[3].checked || tryby[4].checked || importedCustomGame != undefined) {
            cvs.scrollIntoView();
            cvs.scrollIntoView();
            if (!disableNotification.checked) {
                if (warningBox.classList.length > 15) warningBox.classList.add("warningBoxRemoveAnimation");
                warningBox.classList.remove("warningBoxAddAnimation");
            }
            gameIndex++;
            disableInputs();
            if (timer != undefined) {
                clearInterval(timer);
                sec = 0;
                m = 0;
            }
            timer = setInterval(timerFunction, 1000);
            ctx.clearRect(0, 0, cvs.width, cvs.height);

            levelHTML.innerText = "OBECNY POZIOM: ";

            importedCustomGameWin = false;
            allowOperations = false;
            if (importedCustomGame == undefined) {
                if (window.innerWidth < 800 || modes[0].checked) {
                    gra = new Canvas(10, 10);
                    gracz = new Player(50, 50, 50);
                    modesMode = " Łatwy ";
                    punkty = 1000;
                } else if (modes[1].checked) {
                    gra = new Canvas(20, 20);
                    gracz = new Player(25, 25, 25);
                    modesMode = " Średni ";
                    punkty = 2000;
                } else {
                    gra = new Canvas(40, 40);
                    gracz = new Player(12.5, 12.5, 12.5);
                    modesMode = " Trudny ";
                    punkty = 4000;
                }
                levelHTML.innerHTML = `<span>Obecny poziom: ${modesMode}</span>`;
                gra.start("generator");
                await generateMaze();
                currentCell = [0, 0];
                if (losowyKoniec.checked) {
                    gracz.randomizeEnd();
                    koniecX = gracz.endPositionX - gracz.x;
                    koniecY = gracz.endPositionY - gracz.y;
                    if (gracz.x == 50) {
                        koniecX = koniecX.toString().slice(0, 1);
                        koniecY = koniecY.toString().slice(0, 1);
                    } else {
                        koniecX = parseInt(koniecX) / (gracz.x * 2);
                        koniecY = parseInt(koniecY) / (gracz.y * 2);
                    }
                } else if (importedCustomGame == undefined) {
                    koniecX = gra.col - 1;
                    koniecY = gra.row - 1;
                }
            } else {
                gra = importedCustomGame;
                gracz = importedCustomPlayer;
                modesMode = customMode;
                levelHTML.innerHtml = `<span>Obecny poziom: ${modesMode}</span>`;
                trybyMode = "Custom";
                levelHTML.innerHTML += "<span>Tryb generowania: Custom</span>";
                importedCustomGameWin = true;
                enableInputs();
            }

            allowOperations = true;
            constGame = [gra];
            constPlayer = [gracz];
            if (!disableGallery.checked) addToGallery();
            gracz.render();
            gra.drawWalls(ctx);
            losowyKoniec.removeAttribute("disabled");
            pseudoMultipliers = [];
            multipliers = [];
            finalMultiplier = 1;

            widocznoscValue = widocznosc.value;
            niewidocznyKoniecValue = niewidocznyKoniec.checked;
            odwroconeSterowanieValue = odwroconeSterowanie.checked;
            niewidoczneScianyValue = niewidoczneSciany.checked;
            niewidocznyGraczValue = niewidocznyGracz.checked;
            if (losowyKoniec.checked) multipliers.push(1.1);
            if (niewidoczneScianyValue) multipliers.push(2);
            if (niewidocznyKoniecValue) multipliers.push(1.2);
            if (odwroconeSterowanieValue && obrotCanvasa.value != 180) multipliers.push(1.4);
            if (niewidocznyGraczValue) multipliers.push(2);

            if (obrotCanvasa.value != 0) {
                multipliers.push(parseFloat(obrotCanvasa[obrotCanvasa.value / 45].dataset.pkt));
                if (obrotCanvasa.value == 180 && odwroconeSterowanieValue) multipliers.pop();
            }
            canvasMain.style.transform = "rotate(" + obrotCanvasa.value + "deg)";

            if (widocznoscValue != 0) multipliers.push((1 / widocznoscValue) * 10);
            for (let i = 0; i < multipliers.length; i++) {
                finalMultiplier *= multipliers[i];
            }
            mnoznik.innerText = `OBENCY MNOŻNIK PUNKTÓW: ${finalMultiplier}`;
            importedCustomGame = undefined;

            modifiedPlayerX = gracz.x;
            modifiedPlayerY = gracz.y;
            modifiedPlayerEndX = gracz.endPositionX;
            modifiedPlayerEndY = gracz.endPositionY;

            updateLocalStorageMainInformations();
            updateLocalStorageGalleryInformations();
            renderDetailistInformations();
        } else {
            createToast("toastError", "Nie wybrano trybu generowania");
        }
    } else {
        createToast("toastError", "Nie wybrano poziomu");
    }
}

function disableInputs() {
    inputs.forEach(function (e) {
        e.setAttribute("disabled", "");
    });
}

function enableInputs() {
    inputs.forEach(function (e) {
        e.removeAttribute("disabled");
    });
}

function addToGallery() {
    gra.drawWalls(ctx);
    let image = cvs.toDataURL("image/png");
    listOfImages.push({
        imageNumber: gameIndex,
        imageSrc: image,
        gameDifficulty: modesMode,
        imageGeneration: trybyMode,
        gra: [...constGame],
        gracz: [...constPlayer],
        endPositionX: koniecX,
        endPositionY: koniecY,
        currentCellX: 0,
        currentCellY: 0,
        currentRandomEndPos: [gracz.endPositionX, gracz.endPositionY],
    });
    updateGallery();
}

function updateGallery() {
    gallery.innerHTML = "";
    listOfImages.forEach(function (el) {
        gallery.innerHTML += `<div class="imageContainer">
                                <img src="${el.imageSrc}" alt="Zdjęcie labiryntu ${el.imageGeneration}" >
                                <div class="overlay" tabindex="0">
                                    <span>${el.imageNumber}</span>
                                    <span>${el.gameDifficulty}</span>
                                    <span>${el.imageGeneration}</span>
                                    <button class="removeImg">&times;</button>
                                    <button class="mazeFromImg" title="Wczytaj">&#8681;</button>
                                </div>
                              </div>`;
    });
}

function checkArrow(currentParentIndex) {
    if (currentParentIndex != 0) leftArrow.classList.add("displayBlock");
    else leftArrow.classList.remove("displayBlock");

    if (currentParentIndex != listOfImages.length - 1) rightArrow.classList.add("displayBlock");
    else rightArrow.classList.remove("displayBlock");
}

function nextGallery(currentImage) {
    currentImage = listOfImages[currentParentIndex + 1].imageSrc;
    popupImages.src = currentImage;
    currentParentIndex++;
    checkArrow(currentParentIndex);
}

function previousGallery(currentImage) {
    currentImage = listOfImages[currentParentIndex - 1].imageSrc;
    popupImages.src = currentImage;
    currentParentIndex--;
    checkArrow(currentParentIndex);
}

function gameEnd(win) {
    //Koniec gry
    punkty -= sec * 20;
    punkty -= m * 20 * 60;
    punkty *= finalMultiplier;
    if (importedCustomGameWin) punkty = 0;
    levelHTML.innerText = "OBECNY POZIOM:";
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    clearInterval(timer);

    saves.push({
        gra: [...constGame],
        gracz: [...constPlayer],
        endPositionX: koniecX,
        endPositionY: koniecY,
        currentCellX: 0,
        currentCellY: 0,
        currentRandomEndPos: [gracz.endPositionX, gracz.endPositionY],
        isCustom: importedCustomGameWin,
        gameNumber: gameHistoryIndex,
        gameDifficulty: modesMode,
        gameGenerationMode: trybyMode,
        timeM: m,
        timeS: sec,
        playerMoves: numberOfMoves,
        points: Math.floor(punkty, 2),
        color: "white",
    });
    if (importedCustomGameWin) saves[saves.length - 1].color = "wheat";
    else if (!win) saves[saves.length - 1].color = "grey";

    updateSaves();

    gameHistoryIndex++;
    sec = 0;
    m = 0;
    gra = false;
    gracz = false;
    koniecY, (koniecX = 0);
    numberOfMoves = 0;
    blockMovement = false;
    importedCustomGame = undefined;
    importedCustomGameWin = false;
    currentCell = [0, 0];

    if (win && !importedCustomGame) createToast("toastWin", "Gratulacje ukończono labirynt");

    localStorage.removeItem("gameInformations");
    updateLocalStorageSavesInformations();
    historia.scrollIntoView();
    historia.scrollIntoView();
}

function updateSaves() {
    gameHistory.innerHTML = "";
    saves.forEach(function (el) {
        let part = `<div class="part" style="background-color: ${el.color}">
                        <span>Gra numer: ${el.gameNumber} | </span> 
                        <span>Poziom trudności: ${el.gameDifficulty} | </span>
                        <span>Tryb generowania: ${el.gameGenerationMode} | </span>
                        <span>czas: minuty: ${el.timeM} sekundy: ${el.timeS} | </span> 
                        <span>Licba Ruchów ${el.playerMoves} | </span> 
                        <span>PUNKTY: ${el.points}</span>
                        <button class="btn1" id="saveBtn">Wczytaj grę</button>
                        <button class='deleteBtn'>&times;</button>
                    </div>`;

        gameHistory.innerHTML += part;
    });
}

async function endingFunction() {
    //Zakończenie gry
    await sleep(100);
    gameEnd(true);
}

function removeToast(toast) {
    //usuwanie powiadomienia
    toast.classList.add("hide");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    setTimeout(function () {
        toast.remove();
    }, 500);
}

function createToast(id, text) {
    //Tworzenie powiadomienia
    if (disableNotification.checked) return;

    notifications.innerHTML = "<li></li>";
    const toast = document.querySelector(".notifications li");
    toast.className = `toast ${id}`;
    toast.innerHTML = `<div class="column">
                         <span>${text}</span>
                      </div>
                      <i id='deleteToast'>&times;</i>`;

    let deleteToast = document.querySelector("#deleteToast");

    deleteToast.addEventListener("click", function () {
        removeToast(toast);
    });

    toast.timeoutId = setTimeout(function () {
        removeToast(toast);
    }, 3000);
}

function renderDetailistInformations() {
    //aktualizowanie informacji szczegółowych
    detailistInformations.innerText = `Instancje: ${Canvas.instances}
                                       Stworzone gry: ${Canvas.games}
                                       Poddane gry ${Canvas.lostGames}
                                       Narysowane ściany ${Canvas.drawnWalls}
                                       Sidewinder: ${Canvas.sidewinderCount}
                                       Aldous-Broder ${Canvas.aldousBroderCount}
                                       Depth-First-Search: ${Canvas.depthFirstSearchCount}
                                       Hunt-and-Kill: ${Canvas.huntAndKillCount}
                                       Eller: ${Canvas.ellerCount}
                                       Wyrenderowany gracz: ${Player.renderCount}
                                       Wyrenderowany koniec: ${Player.renderEndCount}
                                       Ruch w góre: ${Player.moveUpCount}
                                       Ruch w dół: ${Player.moveDownCount}
                                       Ruch w lewo: ${Player.moveLeftCount}
                                       Ruch w prawo: ${Player.moveRightCount}
                                       Losowy koniec: ${Player.randomizeEndCount}
                                       Stworzobe gry: ${Canvas.customGames}
                                       Wyeksportowane gry: ${Canvas.exportedGames}
                                       Wyeksportowane gry jako plik ${Canvas.exportedGamesAsFile}
                                       Zimportowane gry: ${Canvas.importedGames}`;
}

//Custom games

function mainCreator() {
    //Tworzenie schematu
    if (window.innerWidth < 800 || customModes[0].checked || customModes[1].checked || customModes[2].checked || modifiedMaze != undefined) {
        ctx2.clearRect(0, 0, cvs.width, cvs.height);

        changable.forEach(function (el) {
            el.checked = false;
        });

        if (modifiedMaze == undefined) {
            if (window.innerWidth < 800 || customModes[0].checked) {
                customGame = new Canvas(10, 10);
                customPlayer = new Player(50, 50, 50);
                customMode = "ŁATWY";
            }
            if (customModes[1].checked) {
                customGame = new Canvas(20, 20);
                customPlayer = new Player(25, 25, 25);
                customMode = "ŚREDNI";
            }
            if (customModes[2].checked) {
                customGame = new Canvas(40, 40);
                customPlayer = new Player(12.5, 12.5, 12.5);
                customMode = "TRUDNY";
            }
        } else {
            customGame = new Canvas(modifiedMaze.row, modifiedMaze.col);
            customGame.maze = modifiedMaze.maze;
            customPlayer = new Player(modifiedPlayer.x, modifiedPlayer.y, modifiedPlayer.size);
            modifiedMaze = undefined;
            modifiedPlayer = undefined;
        }
        customPlayerX = customPlayer.x * 2;
        customPlayerY = customPlayer.y * 2;
        customGame.start("creator");
        customGame.drawWalls(ctx2);
        customPlayer.render2();
        customPlayer.renderEnd2();
        setCreatorInputs()

        makingHistory = [];
        rewindMakingHistory = [];
        updateLocalStorageCreatorInformations()
        createToast("toastInfo", "Pomyślnie utworzono schemat");
    } else {
        createToast("toastError", "Nie wybrano poziomu");
    }
}

function setCreatorInputs() {
    customInputs.forEach(function (e) {
        e.removeAttribute("disabled");
        e.setAttribute("max", customGame.col - 1);
    });

    customPlayerPositionX.value = 0;
    customPlayerPositionY.value = 0;

    customEndPositionX.value = customGame.col - 1;
    customEndPositionY.value = customGame.row - 1;
}

function getCursorPosition(canvas, event) {
    //pozyskiwanie pozycji kursora
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    mousePosition = [y, x];
}

function changePlayerPosition() {
    //zmienianie pozycji gracz na schemacie
    if (customPlayerPositionX.value > customGame.col - 1) customPlayerPositionX.value = customGame.col - 1;
    if (customPlayerPositionX.value < 0) customPlayerPositionX.value = 0;
    if (customPlayerPositionY.value > customGame.row - 1) customPlayerPositionY.value = customGame.row - 1;
    if (customPlayerPositionY.value < 0) customPlayerPositionY.value = 0;

    customPlayer.x = customPlayerX / 2 + customPlayerX * customPlayerPositionX.value;
    customPlayer.y = customPlayerY / 2 + customPlayerY * customPlayerPositionY.value;
    ctx2.clearRect(0, 0, cvs.width, cvs.height);
    customPlayer.render2();
    customGame.drawWalls(ctx2);
    customPlayer.renderEnd2();
    updateLocalStorageCreatorInformations()
}

function changeEndPosition() {
    //zmienianie pozycji końca na schemacie
    if (customEndPositionX.value > customGame.col - 1) customEndPositionX.value = customGame.col - 1;
    if (customEndPositionX.value < 0) customEndPositionX.value = 0;
    if (customEndPositionY.value > customGame.row - 1) customEndPositionY.value = customGame.row - 1;
    if (customEndPositionY.value < 0) customEndPositionY.value = 0;

    customPlayer.endPositionX = customPlayerX / 2 + customPlayerX * customEndPositionX.value;
    customPlayer.endPositionY = customPlayerY / 2 + customPlayerY * customEndPositionY.value;
    ctx2.clearRect(0, 0, cvs.width, cvs.height);
    customPlayer.render2();
    customGame.drawWalls(ctx2);
    customPlayer.renderEnd2();
    updateLocalStorageCreatorInformations()
}

function placeDeleteWalls(value1, value2, value3) {
    //Stawianie i usuwanie ścian (value1 => sprawdzanie czy ściana istnieje czy nie) (value2 => stawianie lub usuwanie ściany) (value3 => oznaczanie w histori czy ściana została postawiona czy usunięta)
    ctx2.clearRect(0, 0, cvs.width, cvs.height);
    if (((mousePosition[0] / (cvs2.offsetWidth / customGame.row)) % 1) - ((mousePosition[1] / (cvs2.offsetWidth / customGame.row)) % 1) < 0) {
        if ((mousePosition[0] / (cvs2.offsetWidth / customGame.row)) % 1 < 0.5 && mousePositionCell[0] > 0 && customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallN == value1) {
            customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallN = value2;
            customGame.maze[mousePositionCell[0] - 1][mousePositionCell[1]].walls.wallS = value2;

            makingHistory.push([mousePositionCell[0], mousePositionCell[1], 1, value3]);
        } else if ((mousePosition[1] / (cvs2.offsetWidth / customGame.row)) % 1 > 0.5 && mousePositionCell[1] < customGame.col - 1 && customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallE == value1) {
            customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallE = value2;
            customGame.maze[mousePositionCell[0]][mousePositionCell[1] + 1].walls.wallW = value2;

            makingHistory.push([mousePositionCell[0], mousePositionCell[1], 2, value3]);
        }
    } else {
        if ((mousePosition[0] / (cvs2.offsetWidth / customGame.row)) % 1 > 0.5 && mousePositionCell[0] < customGame.row - 1 && customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallS == value1) {
            customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallS = value2;
            customGame.maze[mousePositionCell[0] + 1][mousePositionCell[1]].walls.wallN = value2;

            makingHistory.push([mousePositionCell[0], mousePositionCell[1], 3, value3]);
        } else if ((mousePosition[1] / (cvs2.offsetWidth / customGame.row)) % 1 < 0.5 && mousePositionCell[1] > 0 && customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallW == value1) {
            customGame.maze[mousePositionCell[0]][mousePositionCell[1]].walls.wallW = value2;
            customGame.maze[mousePositionCell[0]][mousePositionCell[1] - 1].walls.wallE = value2;

            makingHistory.push([mousePositionCell[0], mousePositionCell[1], 4, value3]);
        }
    }
    customGame.drawWalls(ctx2);
    customPlayer.render2();
    customPlayer.renderEnd2();
    updateLocalStorageCreatorInformations()
}

function exportMaze(asFile) {
    //Eksportowanie własnej gry
    currentCell = [parseInt(customPlayerPositionY.value), parseInt(customPlayerPositionX.value)];
    koniecX = customEndPositionX.value;
    koniecY = customEndPositionY.value;
    customGame.solve(true, 0).then(function (result) {
        if (result == true) {
            if (!asFile) {
                customPlayer.x = customPlayerX;
                customPlayer.y = customPlayerY;

                importedCustomGame = customGame;
                importedCustomPlayer = customPlayer;
                importedCustomGameWin = true;

                customPlayer.x += customPlayerX * customPlayerPositionX.value - customPlayerX / 2;
                customPlayer.y += customPlayerY * customPlayerPositionY.value - customPlayerY / 2;

                Canvas.exportedGames++;
                mainFunction();
                cvs.scrollIntoView();
                cvs.scrollIntoView();
            } else {
                let objectToDownload = {
                    gra: [customGame],
                    gracz: [customPlayer],
                    gameDifficulty: customMode,
                    currentCellX: currentCell[0],
                    currentCellY: currentCell[1],
                    endPositionX: koniecX,
                    endPositionY: koniecY,
                    currentRandomEndPos: [customPlayer.endPositionX, customPlayer.endPositionY],
                };

                fileToDownload = stringifyObject(objectToDownload);
                let blob = new Blob([fileToDownload], { type: "text/plain" });
                let href = URL.createObjectURL(blob);
                let fileDownloader = Object.assign(document.createElement("a"), {
                    href,
                    download: "customMaze.txt",
                });
                fileDownloader.click();
                URL.revokeObjectURL(href);
                Canvas.exportedGamesAsFile++;
            }

            customPlayerPositionX.setAttribute("value", 0);
            customPlayerPositionY.setAttribute("value", 0);

            customEndPositionX.setAttribute("value", customGame.col - 1);
            customEndPositionY.setAttribute("value", customGame.row - 1);

            renderDetailistInformations();
            createToast("toastInfo", "Labirynt został pomyślnie wyeksportowany");
            asFile = false;
        } else {
            createToast("toastError", "Eksportowanie labiryntu się nie powiodło: Labirynt nie ma rozwiązań");
        }
    });
}

function rewindHistoryMain(value, history) {
    //głowna funkcja modyfikująca historią (value => usunięcie lub postawienie ściany) (history => histori ruchów lub historia cofnięcia ruchów)
    let [x, y, side] = history[history.length - 1];
    let cell = customGame.maze[x][y].walls;

    switch (side) {
        case 1:
            cell.wallN = value;
            customGame.maze[x - 1][y].walls.wallS = value;
            break;
        case 2:
            cell.wallE = value;
            customGame.maze[x][y + 1].walls.wallW = value;
            break;
        case 3:
            cell.wallS = value;
            customGame.maze[x + 1][y].walls.wallN = value;
            break;
        case 4:
            cell.wallW = value;
            customGame.maze[x][y - 1].walls.wallE = value;
            break;
    }

    ctx2.clearRect(0, 0, cvs.width, cvs.height);
    customPlayer.render2();
    customGame.drawWalls(ctx2);
    customPlayer.renderEnd2();
    updateLocalStorageCreatorInformations()
}

function rewindHistoryFunction() {
    //cofanie histori ruchów
    if (makingHistory.length != 0) {
        if (makingHistory[makingHistory.length - 1][3] == 0) {
            rewindHistoryMain(true, makingHistory);
        } else {
            rewindHistoryMain(false, makingHistory);
        }
        rewindMakingHistory.push(makingHistory.pop());
    }
}

function rewindMakingHistoryFunction() {
    //przywracanie histori ruchów
    if (rewindMakingHistory.length != 0) {
        if (rewindMakingHistory[rewindMakingHistory.length - 1][3] == 0) {
            rewindHistoryMain(false, rewindMakingHistory);
        } else {
            rewindHistoryMain(true, rewindMakingHistory);
        }
        makingHistory.push(rewindMakingHistory.pop());
    }
}

function importFromObject(object, objectIndex, addNeighbors) {
    importedCustomGame = new Canvas(object[objectIndex].gra[0].row, object[objectIndex].gra[0].col);
    importedCustomGame.maze = object[objectIndex].gra[0].maze;
    if (addNeighbors) importedCustomGame.addNeighbors();
    importedCustomPlayer = new Player(500 / importedCustomGame.row, 500 / importedCustomGame.col, object[objectIndex].gracz[0].size);
    customMode = object[objectIndex].gameDifficulty;
    koniecX = object[objectIndex].endPositionX;
    koniecY = object[objectIndex].endPositionY;
    currentCell[0] = object[objectIndex].currentCellX;
    currentCell[1] = object[objectIndex].currentCellY;
    importedCustomPlayer.endPositionX = object[objectIndex].currentRandomEndPos[0];
    importedCustomPlayer.endPositionY = object[objectIndex].currentRandomEndPos[1];
    mainFunction();
}

function stringifyObject(object) {
    return JSON.stringify(object, function (key, value) {
        if (key != "neighbors") {
            return value;
        }
    });
}

function localStorageCSSManipulation() {
    localStoragePopup.classList.remove("localStorageAnimationStart");
    localStoragePopup.classList.add("localStorageAnimationEnd");
    setTimeout(function () {
        localStoragePopup.classList.add("displayNone");
    }, 1000);
}

function updateLocalStorageMainInformations() {
    let object = {
        gra: gra,
        gracz: gracz,
        gameDifficulty: customMode,
        currentCellX: currentCell[0],
        currentCellY: currentCell[1],
        endPositionX: koniecX,
        endPositionY: koniecY,
        sec: sec,
        m: m,
        currentLevel: modesMode,
        currentGeneration: trybyMode,
        currentRandomEndPos: [gracz.endPositionX, gracz.endPositionY],
        widocznoscValue: widocznoscValue,
        niewidocznyKoniecValue: niewidocznyKoniecValue,
        odwroconeSterowanieValue: odwroconeSterowanieValue,
        niewidoczneScianyValue: niewidoczneScianyValue,
        niewidocznyGraczValue: niewidocznyGraczValue,
        finalMultiplier: finalMultiplier,
    };
    let stringifiedObject = stringifyObject(object);
    localStorage.setItem("gameInformations", stringifiedObject);
}

function updateLocalStorageSavesInformations() {
    let object = {
        saves: saves,
        gameNumber: gameHistoryIndex,
    };
    let stringifiedObject = stringifyObject(object);
    localStorage.setItem("savesInformations", stringifiedObject);
}

function updateLocalStorageGalleryInformations() {
    let object = {
        listOfImages: listOfImages,
        gameIndex: gameIndex,
    };
    let stringifiedObject = stringifyObject(object);
    localStorage.setItem("galleryInformations", stringifiedObject);
}

function updateLocalStorageCreatorInformations() {
    let object = {
        customGame: customGame,
        customPlayer: customPlayer,
        customPlayerX: customPlayerX,
        customPlayerY: customPlayerY,
        makingHistory: makingHistory,
        rewindMakingHistory: rewindMakingHistory,
        customMode: customMode,
        customPlayerPositionX: customPlayerPositionX.value,
        customPlayerPositionY: customPlayerPositionY.value,
        customEndPositionX: customEndPositionX.value,
        customEndPositionY: customEndPositionY.value,
    }
    let stringifiedObject = stringifyObject(object)
    localStorage.setItem("creatorInformations", stringifiedObject)
}

function getLocalStorageMainInformations() {
    let gameInformations = JSON.parse(localStorage.getItem("gameInformations"));
    widocznoscValue = gameInformations.widocznoscValue;
    niewidocznyKoniecValue = gameInformations.niewidocznyKoniecValue;
    odwroconeSterowanieValue = gameInformations.odwroconeSterowanieValue;
    niewidoczneScianyValue = gameInformations.niewidoczneScianyValue;
    niewidocznyGraczValue = gameInformations.niewidocznyGraczValue;
    finalMultiplier = gameInformations.finalMultiplier;
    gra = new Canvas(gameInformations.gra.col, gameInformations.gra.row);
    gracz = new Player(gameInformations.gracz.x, gameInformations.gracz.y, gameInformations.gracz.size);
    constGame = [gra];
    constPlayer = [gracz];
    gra.maze = gameInformations.gra.maze;
    gracz.endPositionX = gameInformations.currentRandomEndPos[0];
    gracz.endPositionY = gameInformations.currentRandomEndPos[1];
    gra.addNeighbors();
    gracz.render(ctx);
    gra.drawWalls(ctx);
    koniecX = gameInformations.endPositionX;
    koniecY = gameInformations.endPositionY;
    currentCell[0] = gameInformations.currentCellX;
    currentCell[1] = gameInformations.currentCellY;
    modesMode = gameInformations.currentLevel;
    trybyMode = gameInformations.currentGeneration;
    levelHTML.innerHTML = `<span>Obecny poziom: ${modesMode}</span>
                           <span>Tryb generowania: ${trybyMode}</span>`;
    m = gameInformations.m;
    sec = gameInformations.sec;
    timer = setInterval(timerFunction, 1000);
    addToGallery();
}

function getLocalStorageSavesInformations() {
    let savesInformations = JSON.parse(localStorage.getItem("savesInformations"));
    saves = savesInformations.saves;
    gameHistoryIndex = savesInformations.gameNumber;
    updateSaves();
}

function getLocalStorageGalleryInformations() {
    let galleryInformations = JSON.parse(localStorage.getItem("galleryInformations"));
    listOfImages = galleryInformations.listOfImages;
    gameIndex = galleryInformations.gameIndex;
    updateGallery();
}

function getLocalStorageCreatorInformations() {
    let creatorInformations = JSON.parse(localStorage.getItem("creatorInformations"))
    customGame = new Canvas(creatorInformations.customGame.col, creatorInformations.customGame.row)
    customGame.maze = creatorInformations.customGame.maze
    customGame.addNeighbors()
    customPlayer = new Player(creatorInformations.customPlayer.x, creatorInformations.customPlayer.y, creatorInformations.customPlayer.size)
    customPlayerX = creatorInformations.customPlayerX
    customPlayerY = creatorInformations.customPlayerY
    customInputs.forEach(function (e) {
        e.removeAttribute("disabled");
        e.setAttribute("max", customGame.col - 1);
    });
    customPlayerPositionX.value = creatorInformations.customPlayerPositionX
    customPlayerPositionY.value = creatorInformations.customPlayerPositionY
    customEndPositionX.value = creatorInformations.customEndPositionX
    customEndPositionY.value = creatorInformations.customEndPositionY
    changePlayerPosition()
    changeEndPosition()
    makingHistory = creatorInformations.makingHistory
    rewindMakingHistory = creatorInformations.rewindMakingHistory
    customMode = creatorInformations.customMode
}

function getLocalStorageInputStates() {
    let states = localStorage.getItem("states").split(",");
    inputCheckboxAndRadio.forEach(function (el) {
        el.checked = (states[inputCheckboxAndRadioIndex] === "true")
        inputCheckboxAndRadioIndex++;
    });
}

function getLocalStorage() {
    if (localStorage.getItem("gameInformations") != null) getLocalStorageMainInformations();
    if (localStorage.getItem("savesInformations") != null) getLocalStorageSavesInformations();
    if (localStorage.getItem("galleryInformations") != null) getLocalStorageGalleryInformations();
    if (localStorage.getItem("states") != null) getLocalStorageInputStates();
    if (localStorage.getItem("creatorInformations")!= null) getLocalStorageCreatorInformations()
}

function localStorageMainFunction() {
    if (localStorage.getItem("accept") == null) {
        localStoragePopup.classList.remove("localStorageAnimationEnd");
        localStoragePopup.classList.add("localStorageAnimationStart");
        localStoragePopup.classList.remove("displayNone");
        declineLocalStorage.addEventListener("click", function () {
            localStorageCSSManipulation();
        });

        acceptLocalStorage.addEventListener("click", function () {
            localStorageCSSManipulation();
            localStorage.setItem("accept", true);
            getLocalStorage();
        });
    } else {
        localStoragePopup.classList.add("displayNone");
        getLocalStorage();
    }
}

let cvs = document.querySelector("#game"); //1 canvas
let ctx = cvs.getContext("2d");
let cvs2 = document.querySelector("#game2"); //2 canvas
let ctx2 = cvs2.getContext("2d");

let detailistInformations = document.querySelector(".subDetailistInformations span"); //Menu => informacje szczegółowe

let time = document.querySelector(".time"); //Czas spędzony na poziomie:
let sec = 0;
let m = 0;

let gra = false;
let gracz = false;
let gameIndex = 0;
let constGame = undefined;
let constPlayer = undefined;
let currentCell = [];

let modes = document.querySelectorAll("#modes1 input"); //poziom
let tryby = document.querySelectorAll("#modes2 input"); //tryb generowania
let inputs = document.querySelectorAll("#modes1 input, #modes2 input, #animatedGeneration, #disableNotification"); //poziom, tryb generowania, Animowane generowanie, Wyłącz powiadomienia

let canvasMain = document.querySelector("#gameContainer"); // div w którym znajduje sie canvas
let btn1 = document.querySelector("#btn1"); //zastosuj
let levelHTML = document.querySelector(".level"); // Obecny poziom:
let timer = undefined; //Interwał
let refreshButton = document.querySelector(".refreshButton");

let widocznosc = document.querySelector("#utrudnienia1");
let widocznoscValue = 0;
let wartosc = document.querySelector(".wartosc");
let losowyKoniec = document.querySelector("#utrudnienia2");
let niewidocznyKoniec = document.querySelector("#utrudnienia3");
let niewidocznyKoniecValue = false;
let odwroconeSterowanie = document.querySelector("#utrudnienia4");
let odwroconeSterowanieValue = false;
let niewidoczneSciany = document.querySelector("#utrudnienia5");
let niewidoczneScianyValue = false;
let niewidocznyGracz = document.querySelector("#utrudnienia6");
let niewidocznyGraczValue = false;
let obrotCanvasa = document.querySelector("#rotate");
let changable = [losowyKoniec, odwroconeSterowanie, niewidocznyKoniec, niewidoczneSciany, widocznosc, niewidocznyGracz, obrotCanvasa]; //Wszystkie utrudninia => pokazywanie obecnego mnożnika

let giveUp = document.querySelector("#giveUp"); //guzik "poddajesz się?"
let disableArrows = document.querySelector("#disableArrows"); //Wyłącz ruch ekranu strzałkami
let disableNotification = document.querySelector("#disableNotification"); //Wyłącz powiadomienia
let disableGallery = document.querySelector("#disableGallery");
let animatedSolve = document.querySelector("#animatedSolve"); //Animowane rozwiązywanie
let animatedSolveDelay = document.querySelector("#animatedSolveDelay"); //Input z czasem między ruchem rozwiązywania
let animatedSolveDelayContainer = document.querySelector(".animatedSolveDelayContainer"); // div w którym znajduje się Input z czasem między ruchem rozwiązywania
let animatedPlayer = document.querySelector("#animatedPlayer"); //Animowane poruszanie się
let animatedPlayerVariable = 1; //liczba klatek podczas ruchu
let animatedGenerationInput = document.querySelector("#animatedGeneration"); //Animowane generowanie

let allowOperations = true; //pozwolenia na wykonywanie operacji / głowne zastosowanie podczas animowanych operacji

let mnoznik = document.querySelector(".mnoznik"); //Obecny mnożnik punktów:
let gameHistory = document.querySelector(".content");
let gameHistoryIndex = 1; //Index zapisu gry
let controlsMobile = document.querySelectorAll(".control button"); //mobilne kontrolki
let historia = document.querySelector(".historia"); //Sekcja z zapisami gier
let hideHistory = document.querySelector("#hideHistory"); //ukrywanie histori gier
let punkty = 0; //punkty w zapisie gry
let saves = [];

let blockMovement = false; //blokowanie poruszania się

let modesMode; //poziom wyświtlany w zapisie gry
let trybyMode; //tryb generowania wyświetlany w zapise gry
let koniecX; //pozycja X końca
let koniecY; //pozycja Y końca
let multipliers = []; //mnożniki punktów
let pseudoMultipliers = []; //mnożniki punktów wykorzystywane podczas pokazywania mnożnika na stronie
let finalMultiplier = 1; //końcowy mnożnik
let pseudoFinalMultiplier = 1; //końcowy mnożnik pokazywany na stronie
let numberOfMoves = 0; //liczba ruchów

let notifications = document.querySelector(".notifications"); //Powiadomienia Toast
let warningBox = document.querySelector(".warningBox"); //Warning box "Uwaga: Generowanie może potrwać więcej czasu i spowoduje dużo większe obciążenie procesora"

let repeated = 0;

//Custom games

let customBtn = document.querySelector("#customBtn1"); //Tworzenie schematu gry
let customModes = document.querySelectorAll("#customModes1 input"); //Poziom schematu
let customExportBtn = document.querySelector("#customExport"); //Exportowanie schematu
let customGameBtn = document.querySelector("#customGame-start"); //-----------------
let customGameBtnActive = 0; //----------------
let menuToggle = document.querySelector("#menuToggle"); //przełącznik menu
let scrollToGame = document.querySelectorAll(".menuA"); //scrolowanie do 1 canvasa

let importedCustomGame = undefined; //wyeksportowana gra
let importedCustomPlayer = undefined; //wyeksportowany gracz
let customMode = undefined; //wyeksportowany poziom schematu
let importedCustomGameWin = false; //sprawdzanie czy gra jest ze schematu => wyświetlanie odpowiedniego zapisu

let modifyMazeBtn = document.querySelector("#modifyMaze"); //Guzik "Modyfikuj"
let modifiedMaze = undefined; //gra przeniesiona na schemat
let modifiedPlayer = undefined; //gracz przeniesiony na schemat
let modifiedPlayerX = undefined; //pozycja gracza X przeniesiona na schemat
let modifiedPlayerY = undefined; //pozycja gracz Y przeniesiona na schemat
let modifiedPlayerEndX = undefined; //pozycja końca X przeniesiona na schemat
let modifiedPlayerEndY = undefined; //pozycja końca Y przeniesiona na schemat

let customGameContainer = document.querySelector(".customGame-main"); //-----------
let customGame = undefined; //własna gra
let customPlayer = undefined; //własny gracz
let mousePosition = []; //pozycja myszki X i Y
let mousePositionCell = []; //pozycja myszki X i Y w stosunku do komórek schematu
let customPlayerX = undefined; //własna pozycja gracz X
let customPlayerY = undefined; //własna pozycja gracz Y
let makingHistory = []; //Historia ruchów
let rewindMakingHistory = []; //Historia cofnięć
let customPlayerPositionX = document.querySelector("#playerPositionX"); //input zmiany pozycja gracz X
let customPlayerPositionY = document.querySelector("#playerPositionY"); //input zmiany pozycja gracz Y
let customEndPositionX = document.querySelector("#endPositionX"); //input zmiany pozycja końca X
let customEndPositionY = document.querySelector("#endPositionY"); //input zmiany pozycja końca Y
let customInputs = [customPlayerPositionX, customPlayerPositionY, customEndPositionX, customEndPositionY]; //4 powyższe inputy
let disableInputRewind = document.querySelector("#disableInputRewind"); //Wyłącz cofanie inputów przy pomocy (Ctrl + Z) lub (Ctrl + Y)

let customExportFileBtn = document.querySelector("#customExportFile"); //Przycisk "Exportuj jako plik txt"
let importFileBtn = document.querySelector("#importFileBtn"); //Przycisk "Importuj gre z pliku txt"
let importFileBtnContainer = document.querySelector(".importFileBtnContainer"); //Div z inputem typu file
let uploadFileInput = undefined; //input typu file
let fileToDownload = undefined; //wyeksporotwany plik txt
let downloadedGame = undefined; //Zimportowana gra

let mobileCreateWalls = document.querySelectorAll(".informationMobile .flex div input"); //Mobilne tworzenie i usuwanie ścian schematu
let mobileCreateHistoryBtn = document.querySelector("#historyBtn"); //Mobilne cofanie histori ruchów
let mobileCreateRewindHistoryBtn = document.querySelector("#rewindHistoryBtn"); //Mobilne przywracanie histori ruchów

let gallery = document.querySelector(".gallery");
let galleryIndex = 0;
let listOfImages = [];
let popupImagesContainer = document.querySelector(".popupImages");
let popupImages = document.querySelector(".popupImages img");
let removePopupImage = document.querySelector(".offButton");
let transparentBackground = document.querySelector("#transparentBackground");
let leftArrow = document.querySelector(".leftButton");
let rightArrow = document.querySelector(".rightButton");
let currentModalPage = 0;
let currentParentIndex = 0;
let hasEventListener = false;

let localStoragePopup = document.querySelector(".localStorage");
let declineLocalStorage = document.querySelector("#declineLocalStorage");
let acceptLocalStorage = document.querySelector("#acceptLocalStorage");
let deleteLocalStorage = document.querySelector("#deleteLocalStorage");

let inputCheckboxAndRadio = document.querySelectorAll("input[type='checkbox'], input[type='radio']");
let inputCheckboxAndRadioIndex = 0;

document.addEventListener("DOMContentLoaded", function () {
    localStorageMainFunction();
    renderDetailistInformations();

    deleteLocalStorage.addEventListener("click", function () {
        localStorage.clear();
        localStorageMainFunction();
    });

    inputCheckboxAndRadio.forEach(function (el) {
        el.addEventListener("change", function () {
            let states = [];
            inputCheckboxAndRadio.forEach(function (e) {
                states.push(e.checked);
            });
            localStorage.setItem("states", states);
        });
    });

    refreshButton.addEventListener("click", function () {
        if (gra && allowOperations) {
            mainFunction();
        }
    });

    changable.forEach(function (e) {
        e.addEventListener("change", function () {
            if (losowyKoniec.checked) pseudoMultipliers.push(1.1);
            if (niewidoczneSciany.checked) pseudoMultipliers.push(2);
            if (niewidocznyKoniec.checked) pseudoMultipliers.push(1.2);
            if (odwroconeSterowanie.checked && obrotCanvasa.value != 180) pseudoMultipliers.push(1.4);
            if (niewidocznyGracz.checked) pseudoMultipliers.push(2);
            if (obrotCanvasa.value != 0) {
                pseudoMultipliers.push(parseFloat(obrotCanvasa[obrotCanvasa.value / 45].dataset.pkt));
                if (odwroconeSterowanie.checked && obrotCanvasa.value == 180) pseudoMultipliers.pop();
            }
            if (widocznosc.value != 0) pseudoMultipliers.push((1 / widocznosc.value) * 10);

            for (let i = 0; i < pseudoMultipliers.length; i++) {
                pseudoFinalMultiplier *= pseudoMultipliers[i];
            }
            mnoznik.innerText = `OBENCY MNOŻNIK PUNKTÓW: ${pseudoFinalMultiplier}`;
            pseudoFinalMultiplier = 1;
            pseudoMultipliers = [];
        });
    });

    widocznosc.addEventListener("change", function () {
        if ((wartosc.innerText = widocznosc.value - 1 != -1)) wartosc.innerText = widocznosc.value - 1;
        else wartosc.innerText = widocznosc.value;
    });

    giveUp.addEventListener("mouseenter", function () {
        giveUp.innerText = "Na Pewno?";
    });

    giveUp.addEventListener("mouseleave", function () {
        giveUp.innerText = "Poddajesz się?";
    });

    giveUp.addEventListener("click", function () {
        if (gra && animatedSolveDelay.getAttribute("type") == "number" && allowOperations) {
            repeated = 1;
            gra.solve(false, animatedSolveDelay.value);
        }
    });

    animatedSolve.addEventListener("click", function () {
        if (animatedSolve.checked) animatedSolveDelayContainer.classList.add("displayBlock");
        else animatedSolveDelayContainer.classList.remove("displayBlock");
    });

    animatedPlayer.addEventListener("click", function () {
        if (animatedPlayer.checked) animatedPlayerVariable = 20;
        else animatedPlayerVariable = 1;
    });

    hideHistory.addEventListener("click", function () {
        if (hideHistory.checked) historia.classList.add("displayNone");
        else historia.classList.remove("displayNone");
    });

    inputs.forEach(function (e) {
        e.addEventListener("change", function () {
            if (modes[2].checked && (tryby[0].checked || tryby[2].checked || tryby[3].checked) && !animatedGenerationInput.checked && !disableNotification.checked) {
                warningBox.classList.remove("warningBoxRemoveAnimation");
                warningBox.classList.add("warningBoxAddAnimation");
            } else if (warningBox.classList.value.length > 15) {
                warningBox.classList.remove("warningBoxAddAnimation");
                warningBox.classList.add("warningBoxRemoveAnimation");
            }
        });
    });

    warningBox.addEventListener("click", function () {
        warningBox.classList.remove("warningBoxAddAnimation");
        warningBox.classList.add("warningBoxRemoveAnimation");
    });

    btn1.addEventListener("click", function () {
        if (allowOperations) mainFunction();
    });

    controlsMobile.forEach((el) => {
        el.addEventListener("click", function () {
            if (gra && !blockMovement && allowOperations) {
                if (!odwroconeSterowanieValue) {
                    if (el.innerText == "↑") gracz.moveUp(animatedPlayerVariable);
                    if (el.innerText == "→") gracz.moveRight(animatedPlayerVariable);
                    if (el.innerText == "↓") gracz.moveDown(animatedPlayerVariable);
                    if (el.innerText == "←") gracz.moveLeft(animatedPlayerVariable);
                } else {
                    if (el.innerText == "↑") gracz.moveDown(animatedPlayerVariable);
                    if (el.innerText == "→") gracz.moveLeft(animatedPlayerVariable);
                    if (el.innerText == "↓") gracz.moveUp(animatedPlayerVariable);
                    if (el.innerText == "←") gracz.moveRight(animatedPlayerVariable);
                }

                if (gra && currentCell[0] == koniecY && currentCell[1] == koniecX) {
                    if (blockMovement == true) return;
                    endingFunction();
                }
            }
        });
    });

    window.addEventListener("keydown", function (e) {
        if (gra && !blockMovement && allowOperations) {
            if (!odwroconeSterowanieValue) {
                if (e.key.toLocaleLowerCase() == "w" || e.key == "ArrowUp") gracz.moveUp(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "d" || e.key == "ArrowRight") gracz.moveRight(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "s" || e.key == "ArrowDown") gracz.moveDown(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "a" || e.key == "ArrowLeft") gracz.moveLeft(animatedPlayerVariable);
            } else {
                if (e.key.toLocaleLowerCase() == "w" || e.key == "ArrowUp") gracz.moveDown(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "d" || e.key == "ArrowRight") gracz.moveLeft(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "s" || e.key == "ArrowDown") gracz.moveUp(animatedPlayerVariable);
                if (e.key.toLocaleLowerCase() == "a" || e.key == "ArrowLeft") gracz.moveRight(animatedPlayerVariable);
            }
        }

        if (disableArrows.checked && (e.key == "ArrowUp" || e.key == "ArrowDown")) e.preventDefault();

        if (gra && currentCell[0] == koniecY && currentCell[1] == koniecX) {
            if (blockMovement == true) return;
            endingFunction();
        }
    });

    gameHistory.addEventListener("click", function (event) {
        let deleteBtn = [...document.querySelectorAll(".deleteBtn")];
        let saveBtn = [...document.querySelectorAll("#saveBtn")];
        let partsDelete = deleteBtn.indexOf(event.target);
        let partsSave = saveBtn.indexOf(event.target);
        if (event.target.className == "deleteBtn") {
            saves = saves.filter(function (el, i) {
                return i !== partsDelete;
            });

            updateSaves();
            updateLocalStorageSavesInformations();
            createToast("toastInfo", "Zapis został pomyślnie usunięty");
        } else if ((event.target.id = "saveBtn")) {
            if (!saves[partsSave].isCustom) {
                importFromObject(saves, partsSave, false);
            } else {
                createToast("toastError", "Własnych gier nie można wczytywać");
            }
        }
    });

    gallery.addEventListener("click", function (event) {
        if (event.target.className == "removeImg") {
            let removeImg = [...document.querySelectorAll(".removeImg")];
            let partsRemoveImg = removeImg.indexOf(event.target);

            listOfImages = listOfImages.filter(function (el, i) {
                return i !== partsRemoveImg;
            });

            updateGallery();
            updateLocalStorageGalleryInformations();
            createToast("toastInfo", "Zdjęcię zostało pomyślnie usunięte");
        } else if (event.target.className == "mazeFromImg") {
            let mazeFromImg = [...document.querySelectorAll(".mazeFromImg")];
            let partsMazeFromImg = mazeFromImg.indexOf(event.target);

            if (listOfImages[partsMazeFromImg].imageGeneration != "Custom") {
                importFromObject(listOfImages, partsMazeFromImg, false);
            } else {
                createToast("toastError", "Własnych gier nie można wczytywać");
            }
        } else if (event.target.className == "overlay" || event.target.tagName == "SPAN") {
            let imageContainer = document.querySelectorAll(".imageContainer");
            for (let i = 0; i < listOfImages.length; i++) {
                imageContainer[i].dataset.index = i;
            }

            let currentParent = event.target.parentNode;
            if (currentParent.className == "overlay") currentParent = currentParent.parentNode;
            currentParentIndex = parseInt(currentParent.dataset.index);
            let currentImage = listOfImages[currentParentIndex].imageSrc;

            popupImagesContainer.showModal();
            popupImages.src = currentImage;
            checkArrow(currentParentIndex);

            if (!hasEventListener) {
                leftArrow.addEventListener("click", function () {
                    previousGallery(currentImage);
                });

                rightArrow.addEventListener("click", function () {
                    nextGallery(currentImage);
                });

                window.addEventListener("keydown", function (e) {
                    if (popupImagesContainer != "none") {
                        if (e.key == "ArrowLeft" && currentParentIndex != 0) {
                            previousGallery(currentImage);
                        } else if (e.key == "ArrowRight" && currentParentIndex != listOfImages.length - 1) {
                            nextGallery(currentImage);
                        }
                    }
                });
            }

            hasEventListener = true;
        }
    });

    removePopupImage.addEventListener("click", function () {
        popupImagesContainer.close();
    });

    transparentBackground.addEventListener("click", function () {
        if (transparentBackground.checked) popupImages.classList.add("backgroundTransparent");
        else popupImages.classList.remove("backgroundTransparent");
    });

    //CUSTOM GAMES

    scrollToGame.forEach(function (el) {
        el.addEventListener("click", function () {
            menuToggle.checked = false;
        });
    });

    customBtn.addEventListener("click", mainCreator);

    cvs2.addEventListener("mousedown", function (e) {
        if (customGame != undefined) {
            getCursorPosition(cvs2, e);
            mousePositionCell[0] = Math.floor(mousePosition[0] / (cvs2.offsetWidth / customGame.col));
            mousePositionCell[1] = Math.floor(mousePosition[1] / (cvs2.offsetWidth / customGame.row));
            if (window.innerWidth > 800) {
                if (e.button == 0 && !keys["Control"]) placeDeleteWalls(true, false, 0);
                else if (keys["Control"]) placeDeleteWalls(false, true, 1);
            } else {
                if (mobileCreateWalls[0].checked) placeDeleteWalls(true, false, 0);
                else placeDeleteWalls(false, true, 1);
            }
        }
    });

    customExportBtn.addEventListener("click", function () {
        exportMaze(false);
    });

    customPlayerPositionX.addEventListener("keyup", changePlayerPosition);
    customPlayerPositionY.addEventListener("keyup", changePlayerPosition);

    customPlayerPositionX.addEventListener("change", changePlayerPosition);
    customPlayerPositionY.addEventListener("change", changePlayerPosition);

    customEndPositionX.addEventListener("keyup", changeEndPosition);
    customEndPositionY.addEventListener("keyup", changeEndPosition);

    customEndPositionX.addEventListener("change", changeEndPosition);
    customEndPositionY.addEventListener("change", changeEndPosition);

    let keys = {};

    window.addEventListener("keydown", function (e) {
        keys[e.key] = true;
        if (keys["Control"] && e.key.toLowerCase() == "z") {
            if (disableInputRewind.checked) e.preventDefault();
            rewindHistoryFunction();
        } else if (keys["Control"] && e.key.toLowerCase() == "y") {
            if (disableInputRewind.checked) e.preventDefault();
            rewindMakingHistoryFunction();
        }
    });

    mobileCreateHistoryBtn.addEventListener("click", rewindHistoryFunction);
    mobileCreateRewindHistoryBtn.addEventListener("click", rewindMakingHistoryFunction);

    window.addEventListener("keyup", function (e) {
        delete keys[e.key];
    });

    modifyMazeBtn.addEventListener("click", function () {
        if (gra) {
            modifiedMaze = gra;
            modifiedPlayer = gracz;
            modifiedPlayer.x = modifiedPlayerX;
            modifiedPlayer.y = modifiedPlayerY;
            modifiedPlayer.endPositionX = modifiedPlayerEndX;
            modifiedPlayerEndY = modifiedPlayerEndY;
            cvs2.scrollIntoView();
            mainCreator();
            createToast("toastInfo", "Gra została przeniesiona na schemat");
        } else {
            createToast("toastError", "Gra nie jest stworzona");
        }
    });

    customExportFileBtn.addEventListener("click", function () {
        if (customGame != undefined) exportMaze(true);
    });

    importFileBtn.addEventListener("click", function () {
        importFileBtnContainer.innerHTML = `<input type="file" name="uploader" id="uploader"></input>`;
        uploadFileInput = document.querySelector("input[type=file]");

        uploadFileInput.addEventListener("change", function () {
            const [file] = uploadFileInput.files;
            const reader = new FileReader();
            if (file) {
                reader.readAsText(file);
            }

            reader.addEventListener("load", function () {
                try {
                    downloadedGame = [JSON.parse(reader.result)];
                    importFromObject(downloadedGame, 0, true);
                    Canvas.importedGames++;
                    createToast("toastInfo", "Plik został zimportowany");
                } catch (error) {
                    createToast("toastError", "Plik jest niewłaściwy");
                }
                importFileBtnContainer.innerHTML = "";
            });
        });
    });
});
//wersja (korkociąg 9)
