class Morpion {
	humanPlayer = 'J1';
	iaPlayer = 'J2';
    turn = 0;
	gameOver = false;
    history = [];

	gridMap = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(firstPlayer = 'J1') {
		this.humanPlayer = firstPlayer;
		this.iaPlayer = (firstPlayer === 'J1') ? 'J2' : 'J1';
		this.initGame();
	}

	initGame = () => {
		this.gridMap.forEach((line, y) => {
			line.forEach((cell, x) => {
				this.getCell(x, y).onclick = () => {
                    // console.log("init game, human turn");
                    console.log("x: ", x,"y :", y);
                    undoButton.disabled = false;
					this.doPlayHuman(x, y);
				};
			});
		});

        //init undobutton
        let undoButton = document.getElementById("undo")
        // if(this.turn <= 0 ){
        //     undoButton.disabled = true;
        // }
        undoButton.onclick = () => {
            if(this.turn <= 0 ){
                console.log("turn <= 0");
                return;
            }
            this.undo();
        }
        //init redobutton
        let redoButton = document.getElementById("redo")
        // if(this.turn >= 8 ){
        //     redoButton.disabled = true;
        // }
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
            console.log("easy");
        })
        const mediumButton = document.getElementById("mediumlvl")
        mediumButton.addEventListener("click",()=>{
            console.log("medium");
        })
        const hardButton = document.getElementById("hardlvl")
        hardButton.addEventListener("click",()=>{
            console.log("hard");
        })

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
	}

	drawHit = (x, y, player) => { 
        // console.log("drawhit");
		if (this.gridMap[y][x] !== null) {
			return false;
		}

		this.gridMap[y][x] = player; //c'est ici  qu'on affecte la valeur du jouer dans la conne cellule
        // console.log("gridmap :");
        // console.log(this.gridMap);

        this.saveHistory(this.turn, x,y,player)
        console.log("history :");
        console.log(this.history);

        this.turn += 1;
		this.getCell(x, y).classList.add(`filled-${player}`);
		this.checkWinner(player);
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
        console.log("turn :", this.turn);
    }

    undo = () => {
        console.log("dans undo");
        // console.log(this.history.length);
        console.log("actual turn :", this.turn);
        if(this.history.length > 0 && this.turn > 0){
            this.turn -= 1;
            let x = this.history[this.turn].x
            let y = this.history[this.turn].y
            let player = this.history[this.turn].player
            console.log("previous move :", "x :",x, "y :",y);
            this.gridMap[y][x] = null //delete previous move in the right cell
            this.getCell(x, y).classList.remove(`filled-${player}`); //change previous cell display
            console.log("history :");
            console.log(this.history);
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

        const { x, y } = this.minmax(this.gridMap, 0, -Infinity, Infinity, true);
        this.drawHit(x, y, this.iaPlayer);
        // console.log("fin ia turn");
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
}
