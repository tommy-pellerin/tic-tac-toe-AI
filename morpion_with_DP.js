class Morpion {
	humanPlayer = 'J1';
	iaPlayer = 'J2';
    turn = 0;
	gameOver = false;
    history = [];
    difficulty = "hard";
    

	gridMap = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(firstPlayer = 'J1') {
		this.humanPlayer = firstPlayer;
		this.iaPlayer = (firstPlayer === 'J1') ? 'J2' : 'J1';
		this.initGame();
        this.memento = new Memento();
	}

	initGame = () => {
        console.log("init game");
        const savedGridMap = JSON.parse(localStorage.getItem('tictactoe'));
        if(savedGridMap && savedGridMap.difficulty !== null){
            this.difficulty = savedGridMap.difficulty
            this.gridMap = savedGridMap.board;
            console.log(this.gridMap);
            this.gridMap.forEach((line, y) => {
                line.forEach((cell, x) => {
                    console.log(cell,x,y);
                    let player = cell
                    this.getCell(x, y).classList.add(`filled-${player}`);
                    });
            });
        };

        let replayButton = document.getElementById("replay")
        replayButton.addEventListener("click",()=>{
            console.log("replay");
            localStorage.clear();
        })

        //init undobutton
        let undoButton = document.getElementById("undo")
        if(this.turn <= 0 ){
            undoButton.classList.add("undo-redo-disable")
            undoButton.disabled = true;
        }
        undoButton.onclick = () => {
            if(this.turn <= 0 ){
                console.log("turn <= 0");
                return;
            }

            this.undo();
            
            redoButton.disabled = false;
            redoButton.classList.remove("undo-redo-disable")
        }
        //init redobutton
        let redoButton = document.getElementById("redo")
        if(this.history.length <= this.turn){
            redoButton.classList.add("undo-redo-disable")
            redoButton.disabled = true;
        }
        redoButton.onclick = () => {
            if(this.history.length <= this.turn){
                console.log("this.history.length <= this.turn");
                return;
            }
            this.redo();
        }

        //init level selecting
        const easyButton = document.getElementById("easylvl")
        easyButton.addEventListener("click",()=>{
            // console.log("easy");
            this.difficulty = "easy"
            easyButton.classList.add("selected-difficulty")
            mediumButton.classList.remove("selected-difficulty")
            hardButton.classList.remove("selected-difficulty")
        })
        const mediumButton = document.getElementById("mediumlvl")
        mediumButton.addEventListener("click",()=>{
            // console.log("medium");
            this.difficulty = "medium"
            easyButton.classList.remove("selected-difficulty")
            mediumButton.classList.add("selected-difficulty")
            hardButton.classList.remove("selected-difficulty")
        })
        const hardButton = document.getElementById("hardlvl")
        hardButton.addEventListener("click",()=>{
            // console.log("hard");
            this.difficulty = "hard"
            easyButton.classList.remove("selected-difficulty")
            mediumButton.classList.remove("selected-difficulty")
            hardButton.classList.add("selected-difficulty")
        })
        

		this.gridMap.forEach((line, y) => {
			line.forEach((cell, x) => {
				this.getCell(x, y).onclick = () => {
                    // console.log("init game, human turn");
                    console.log("x: ", x,"y :", y);
                    undoButton.disabled = false;
                    undoButton.classList.remove("undo-redo-disable")
					this.doPlayHuman(x, y);
				};
			});
		});


		if (this.iaPlayer === 'J1') {
			this.doPlayIa();
		}
	}

	getCell = (x, y) => { //trouve le nom de la cellule écrit en html
		const column = x + 1;
		const lines = ['A', 'B', 'C'];
		const cellId = `${lines[y]}${column}`;
		return document.getElementById(cellId);
	}

    getBoardWinner = (board) => { //ici on cherche le gagnant => le fonction retourne soit : tie, iaPlayer ou humanPlayer
        const isWinningRow = ([a, b, c]) => (
            a !== null && a === b && b === c
        );

        let winner = null;

        // Horizontal
        board.forEach((line) => {
            if (isWinningRow(line)) {
                winner = line[0];
            }
        });

        // Vertical
        [0, 1, 2].forEach((col) => {
            if (isWinningRow([board[0][col], board[1][col], board[2][col]])) {
                winner = board[0][col];
            }
        });

        if (winner) {
            return winner;
        }

        // Diagonal
        const diagonal1 = [board[0][0], board[1][1], board[2][2]];
        const diagonal2 = [board[0][2], board[1][1], board[2][0]];
        if (isWinningRow(diagonal1) || isWinningRow(diagonal2)) {
            return board[1][1];
        }

        const isFull = board.every((line) => (
			line.every((cell) => cell !== null)
		));
        return isFull ? 'tie' : null;
    }

	checkWinner = (lastPlayer) => { //vérifier s'il y a un gagnant
        
        const winner = this.getBoardWinner(this.gridMap);
        if (!winner) {
            return;
        }

        this.gameOver = true;
        console.log('Clearing local storage...');
        localStorage.clear(); //clear local storage when the party is over
        console.log('Local storage cleared.');
        switch(winner) {
            case 'tie':
                this.displayEndMessage("Vous êtes à égalité !");
                break;
            case this.iaPlayer:
                this.displayEndMessage("L'IA a gagné !");
                break;
            case this.humanPlayer:
                this.displayEndMessage("Tu as battu l'IA !");
                break;
        }
	}

	displayEndMessage = (message) => {
		const endMessageElement = document.getElementById('end-message');
		endMessageElement.textContent = message;
		endMessageElement.style.display = 'block';
        // console.log("fin message");
	}

	drawHit = (x, y, player) => { 
        // console.log("drawhit");
		if (this.gridMap[y][x] !== null) {
			return false;
		}

		this.gridMap[y][x] = player; //c'est ici  qu'on affecte la valeur du jouer dans la conne cellule
        // console.log("gridmap :");
        // console.log(this.gridMap);

        // this.saveHistory(this.turn, x,y,player)
        // console.log("history :");
        // console.log(this.history);

        this.turn += 1;
		this.getCell(x, y).classList.add(`filled-${player}`);
		this.checkWinner(player);

        //save history in memento
        this.memento.addElement({turn:this.turn,
            x:x,
            y:y,
            player:player
        })

        console.log(this.memento);

        //save in localStorage if the game is not over in order to resume the game
        if (!this.gameOver) {
            localStorage.setItem('tictactoe', 
                JSON.stringify({
                    board: this.gridMap,
                    difficulty: this.difficulty
                })
            );
            // console.log('Game state saved to local storage.');
        }

		return true;
	}

    saveHistory = (turn,x,y,player) =>{
        if(this.history[this.turn]){
            this.history[this.turn] = {
                turn:this.turn,
                x:x,
                y:y,
                player:player
            };
        } else {
            this.history.push({turn:turn,
                x:x,
                y:y,
                player:player
            })
        }
        // console.log("turn :", this.turn);
    }



    undo = () => {
        for (let i=0;i<=1;i++){
        // console.log("dans undo");
        // console.log(this.history.length);
        this.turn -= 1;
        console.log("actual turn :", this.turn);
        let data = this.memento.undo()
        let x = data.x
        let y = data.y
        let player = data.player
        console.log("previous move :", "x :",x, "y :",y);
        this.gridMap[y][x] = null //delete previous move in the right cell
        this.getCell(x, y).classList.remove(`filled-${player}`); //change previous cell display

        // if(this.history.length > 0 && this.turn > 0){
        //     this.turn -= 1;
        //     let x = this.history[this.turn].x
        //     let y = this.history[this.turn].y
        //     let player = this.history[this.turn].player
        //     console.log("previous move :", "x :",x, "y :",y);
        //     this.gridMap[y][x] = null //delete previous move in the right cell
        //     this.getCell(x, y).classList.remove(`filled-${player}`); //change previous cell display
        //     console.log("history :");
        //     console.log(this.history);
        // }
        }
    }

    redo = () => {
        console.log("dans redo");
        console.log("actual turn :", this.turn);
        if(this.history.length > this.turn){
            
            let x = this.history[this.turn].x
            let y = this.history[this.turn].y
            let player = this.history[this.turn].player
            console.log("history :", "x :",x, "y :",y);
            this.gridMap[y][x] = player
            this.getCell(x, y).classList.add(`filled-${player}`);
            console.log("history :");
            console.log(this.history);
            this.turn += 1; //at the end because we change turn only after redo
        }
    }

	doPlayHuman = (x, y) => {
        // console.log("human");
		if (this.gameOver) {
			return;
		}

		if (this.drawHit(x, y, this.humanPlayer)) {
            // console.log("change de jouer");
			this.doPlayIa();
		}
	}

	doPlayIa = () => {
        // console.log("AI");
		if (this.gameOver) {
			return;
		}
        // console.log("Difficulty chosen :",this.difficulty);
        let x, y;
        switch(this.difficulty){
            case "easy":
                ({ x, y } = this.easy(this.gridMap))
                break;
            case "medium":
                ({ x, y } = this.medium(this.gridMap))
                break;
            case "hard":
                ({ x, y } = this.minmax(this.gridMap, 0, -Infinity, Infinity, true))
                break;
            default:
                console.log("unknown difficulty"); //difficulty hard by default
        }
        
        this.drawHit(x, y, this.iaPlayer);
        // console.log("fin ia turn");
	}

    easy = (board) => {
        //check if the cell is empty
        let x, y;

        do {
            x = Math.floor(Math.random() * 3);
            y = Math.floor(Math.random() * 3);
        } while(board[y][x] !== null); //while the cell is not empty, keep changing x and y value

        return {x, y};
    }

    checkDoublePion = (board) => {
        let x,y;
        const isWinningRow = (row) => {
            if(row[0] === row[1] && row[0] !== null && row[2] === null) return 2;
            if(row[0] === row[2] && row[0] !== null && row[1] === null) return 1;
            if(row[1] === row[2] && row[1] !== null && row[0] === null) return 0;
            return -1;
        };
    
        // Horizontal
        for(let y = 0; y < 3; y++) {
            let x = isWinningRow(board[y]);
            if(x !== -1) return {x, y};
        }
    
        // Vertical
        for(let x = 0; x < 3; x++) {
            let y = isWinningRow([board[0][x], board[1][x], board[2][x]]);
            if(y !== -1) return {x, y};
        }

        // Diagonal
        const diagonal1 = [board[0][0], board[1][1], board[2][2]];
        const diagonal2 = [board[0][2], board[1][1], board[2][0]];
        let diag = isWinningRow(diagonal1);
        if(diag !== -1) return {x: diag, y: diag};

        diag = isWinningRow(diagonal2);
        if(diag !== -1) return {x: 2 - diag, y: diag};

        // If no winning move is found, return null
        return null;
    }
    medium = (board) => {
        const winningMove = this.checkDoublePion(board);
        if(winningMove) {
            return winningMove;
        } else {
            return this.easy(board);
        }
    }

    minmax = (board, depth, alpha, beta, isMaximizing) => {
        // Return a score when there is a winner
        const winner = this.getBoardWinner(board);
        if (winner === this.iaPlayer) {
            return 10 - depth;
        }
        if (winner === this.humanPlayer) {
            return depth - 10;
        }
        if (winner === 'tie' && this.turn === 9) {
            return 0;
        }

        const getSimulatedScore = (x, y, player) => {
            board[y][x] = player;
            this.turn += 1;

            const score = this.minmax(
                board,
                depth + 1,
                alpha,
                beta,
                player === this.humanPlayer
            );

            board[y][x] = null;
            this.turn -= 1;

            return score;
        };

        // This tree is going to test every move still possible in game
        // and suppose that the 2 players will always play there best move.
        // The IA search for its best move by testing every combinations,
        // and affects score to every node of the tree.
        if (isMaximizing) {
            // The higher is the score, the better is the move for the IA.
            let bestIaScore = -Infinity;
            let optimalMove;
            for (const y of [0, 1, 2]) {
                for (const x of [0, 1, 2]) {
                    if (board[y][x]) {
                        continue;
                    }

                    const score = getSimulatedScore(x, y, this.iaPlayer);
                    if (score > bestIaScore) {
                        bestIaScore = score;
                        optimalMove = { x, y };
                    }

                    // clear useless branch of the algorithm tree
                    // (optional but recommended)
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }

            return (depth === 0) ? optimalMove : bestIaScore;
        }

        // The lower is the score, the better is the move for the player.
        let bestHumanScore = Infinity;
        for (const y of [0, 1, 2]) {
            for (const x of [0, 1, 2]) {
                if (board[y][x]) {
                    continue;
                }

                const score = getSimulatedScore(x, y, this.humanPlayer);
                bestHumanScore = Math.min(bestHumanScore, score);

                // clear useless branch of the algorithm tree
                // (optional but recommended)
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return bestHumanScore;
    }
};

class Memento {
    constructor() {
        this.values = [];
        this.index = 0;
        this.isUndo = false;
    }

    addElement = (element) => {
        if(this.isUndo){
            this.isUndo = false;
            this.values.splice(this.index, this.values.length); //On supprime tout ce qu'il y a après notre index
        } else {
            this.values.splice(this.index + 1, this.values.length); //On supprime tout ce qu'il y a après notre index
        }
        this.values.push(JSON.stringify(element));
        this.index++;
    }

    undo = () => {
        console.log("je suis dans undo");
        if (this.index <= 0) {
            return false;
        }
        this.index--;
        this.isUndo = true;
        return JSON.parse(this.values[this.index]);
    }

    redo = () => {
        if (this.index >= values.length) {
            return false;
        }
        this.index++;
        return JSON.parse(this.values[this.index]);
    }
}