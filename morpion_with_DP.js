class Morpion {
	humanPlayer = 'J1';
	iaPlayer = 'J2';
    turn = 0;
	gameOver = false;
    difficulty = "hard";
    

	gridMap = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(firstPlayer = 'J1') {
		this.humanPlayer = firstPlayer;
		this.iaPlayer = (firstPlayer === 'J1') ? 'J2' : 'J1';
        this.memento = new Memento(); //initialized this variable before initGame
		this.initGame();
	}

	initGame = () => {
        console.log("init game");

        const localStorageGridMap = JSON.parse(localStorage.getItem('tictactoe'));
        if(localStorageGridMap && localStorageGridMap.difficulty !== null){
            this.difficulty = localStorageGridMap.difficulty;
            this.gridMap = localStorageGridMap.board;
            let localStorageValues = localStorageGridMap.memento.values
            localStorageValues.map(value => 
                this.memento.addElement(JSON.parse(value))
            );
            console.log(this.gridMap);
            console.log(this.memento);
            this.gridMap.forEach((line, y) => {
                line.forEach((cell, x) => {
                    // console.log(cell,x,y);
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
        if(this.memento.index > 0 ){
            undoButton.classList.remove("undo-redo-disable")
            undoButton.disabled = false;
        }
        undoButton.onclick = () => {
            
            if(this.memento.index <= 0 ){
                console.log("this.memento.index <= 0");
                undoButton.classList.add("undo-redo-disable")
                // undoButton.disabled = true;
                return;
            }

            this.undo(undoButton);
            
            redoButton.disabled = false;
            redoButton.classList.remove("undo-redo-disable")
        }

        //init redobutton
        let redoButton = document.getElementById("redo")
        if(this.memento.index < this.memento.values.length){
            redoButton.classList.remove("undo-redo-disable")
            redoButton.disabled = false;
        };
        redoButton.onclick = () => {
            
            if(this.memento.index >= this.memento.values.length){
                console.log("this.memento.index >= this.memento.values.length");
                redoButton.classList.add("undo-redo-disable")
                // redoButton.disabled = true;
                return;
            }
            this.redo(redoButton);
            undoButton.disabled = false;
            undoButton.classList.remove("undo-redo-disable")
        };

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

	checkWinner = (lastPlayer) => { //vérifier s'il y a un gagnant
        
        const winnerChecker = new GetBoardWinner();
        const winner = winnerChecker.getBoardWinner(this.gridMap);
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

    this.turn += 1;
    this.getCell(x, y).classList.add(`filled-${player}`);
    this.checkWinner(player);

    //save history in memento
    this.memento.addElement({turn:this.turn,
        x:x,
        y:y,
        player:player
    });
    console.log(this.memento);

    //save in localStorage if the game is not over in order to resume the game
    if (!this.gameOver) {
        localStorage.setItem('tictactoe', 
            JSON.stringify({
                board: this.gridMap,
                difficulty: this.difficulty,
                memento:this.memento
            })
        );
        // console.log('Game state saved to local storage.');
    }

		return true;
	}

    undo = (undoButton) => {
        for (let i=0;i<=1;i++){
        // console.log("dans undo");
        this.turn -= 1;
        console.log("actual turn :", this.turn);
        let data = this.memento.undo()
        let x = data.x
        let y = data.y
        let player = data.player
        console.log("previous move :", "x :",x, "y :",y);
        this.gridMap[y][x] = null //delete previous move in the right cell
        this.getCell(x, y).classList.remove(`filled-${player}`); //change previous cell display
        }
        //condition on button
        if(this.memento.index <= 0 ){
            console.log("this.memento.index <= 2");
            undoButton.classList.add("undo-redo-disable")
            // undoButton.disabled = true;
        }
    }

    redo = (redoButton) => {
        for (let i=0;i<=1;i++){
            // console.log("dans redo");
            console.log("actual turn :", this.turn);
            let data = this.memento.redo()
            let x = data.x
            let y = data.y
            let player = data.player
            console.log("this move :", "x :",x, "y :",y);
            this.gridMap[y][x] = player
            this.getCell(x, y).classList.add(`filled-${player}`);
            this.turn += 1; //at the end because we change turn only after redo
        }
        if(this.memento.index >= (this.memento.values.length - 1)){
            console.log("this.memento.index >= this.memento.values.length");
            redoButton.classList.add("undo-redo-disable")
            // redoButton.disabled = true;
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
        let easyDifficulty = new EasyDifficulty();
        let mediumDifficulty = new MediumDifficulty();
        let hardDifficulty = new HardDifficulty( this.humanPlayer, this.iaPlayer);
        switch(this.difficulty){
            case "easy":
                ({ x, y } = easyDifficulty.getRandomCoordinates(this.gridMap))
                break;
            case "medium":
                ({ x, y } = mediumDifficulty.getCoordinates(this.gridMap))
                break;
            case "hard":
                // ({ x, y } = this.minmax(this.gridMap, 0, -Infinity, Infinity, true))
                console.log("hard");
                ({ x, y } = hardDifficulty.minmax(this.gridMap, 0, -Infinity, Infinity, true))
                break;
            default:
                console.log("unknown difficulty"); //difficulty hard by default
        }
        
        this.drawHit(x, y, this.iaPlayer);
        // console.log("fin ia turn");
	}

};

class GetBoardWinner {

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
}

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

    // Add a getter for values
    getElement = index => {
        return JSON.parse(this.values[index]);
    }

    undo = () => {
        console.log("je suis dans undo");
        if (this.index <= 0) {
          return false;
        }
        this.index--;
        console.log("index:", this.index);
        this.isUndo = true;
        return JSON.parse(this.values[this.index]);
    }

    redo = () => {
      console.log("je suis dans redo");
      console.log("index:", this.index);
        if (this.index >= this.values.length) {
            return false;
        }
        let value = JSON.parse(this.values[this.index]);
        this.index++;
        return value;
    }
}

class EasyDifficulty {
    constructor() {
        this.x;
        this.y;
    }

    getRandomCoordinates = (board) => {
        
        do {
                this.x = Math.floor(Math.random() * 3);
                this.y = Math.floor(Math.random() * 3);
        } while(board[this.y][this.x] !== null); //while the cell is not empty, keep changing x and y value

        return {x:this.x, y:this.y};
    }
}

class MediumDifficulty extends EasyDifficulty {
    constructor() {
        super()
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

    getCoordinates = (board) => {
        console.log("dans medium");
        const winningMove = this.checkDoublePion(board);
        if(winningMove) {
            return winningMove;
        } else {
            return this.getRandomCoordinates(board);
        }
    }
}

class HardDifficulty {
    constructor(iaPlayer, humanPlayer) {
        this.iaPlayer = iaPlayer;
        this.humanPlayer = humanPlayer;
        
    }

    minmax = (board, depth, alpha, beta, isMaximizing) => {
        // console.log("hard");
        // Return a score when there is a winner

        const winnerChecker = new GetBoardWinner();
        const winner = winnerChecker.getBoardWinner(board);
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
}