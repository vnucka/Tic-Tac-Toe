const game = {
    status: 0,
    pCount: 0,
    gCount: 0,
    firstMove: null,
    allWinCombs: [
        [1,0,0,1,0,0,1,0,0],
        [1,1,1,0,0,0,0,0,0],
        [0,1,0,0,1,0,0,1,0],
        [0,0,1,0,0,1,0,0,1],
        [1,0,0,0,1,0,0,0,1],
        [0,0,1,0,1,0,1,0,0],
        [0,0,0,1,1,1,0,0,0],
        [0,0,0,0,0,0,1,1,1]
    ],
    gMove: false,
    gameWrap: null,
    substrate: null,
    pCountElement: null,
    gCountElement: null,
    field: [
            0,0,0,
            0,0,0,
            0,0,0
        ],
    load() {
        // Initialization game

        this.render();
        this.pCountElement = document.getElementById('p-count');
        this.gCountElement = document.getElementById('g-count');
        this.gameWrap = document.getElementById('game-wrap');
        this.substrate = document.getElementById('substrate');

        this.pCountElement.textContent = this.pCount;
        this.gCountElement.textContent = this.gCount;
    },
    start() {
        // Start game

        this.firstMove = (Math.floor(Math.random() * 10) % 2) ? 'player' : 'game';
        this.clearField();

        if(this.firstMove === 'game') {
            this.gamePass();
        }

        this.render();
        this.status = 1;

        this.substrate.remove();

        const modal = document.getElementById('modal');
        if(modal) {
            modal.remove();
        }
    },
    playerPass(idx) {
        // This player pass method
        if(this.status !== 1 || this.gMove) {
            return false;
        }

        if(this.status === 3 || this.field[idx]) {
            return false;
        }

        this.field[idx] = !this.field[idx] ? 1 : this.field[idx];

        if(!this.gMove) {
            this.gamePass();
        }

        this.render();
    },
    gamePass() {
        // Computer pass

        let checkFill = false;
        this.field.map(el => {
            if(!el) {
                checkFill = true;
            }
        })

        if(!checkFill) {
            return false
        }

        this.gMove = true;

        if(!this.field.includes(2)) {
            // Random first pass
            // Small delay after pass
            setTimeout(() => {
                this.getRandomMove();
                this.gMove = false;
            }, 200)
        } else {
            // Next computer pass based on the wining combinations
            // Small delay after pass
            setTimeout(() => {
                let moved = false,
                    lastMove = false,
                    disturb = false,
                    winCombination = null,
                    checkMove = 0,
                    moveToWin = 0;

                for (winComb of this.getWinCombs()) {
                    checkMove = 0;
                    moveToWin = 0;

                    // Checking is computer can wining based on the wining combinations
                    for (idx in winComb) {
                        if(winComb[idx] && this.field[idx] !== 1) {
                            checkMove++;
                        }

                        if(winComb[idx] && !this.field[idx]) {
                            moveToWin++;
                        }

                        if(moveToWin === 1) {
                            lastMove = true;
                            moved = true;
                            winCombination = winComb;
                            break;
                        }

                        if(checkMove === 3) {
                            moved = true;
                            winCombination = winComb;
                        }
                    }
                }

                if(this.firstMove === 'game' && lastMove) {
                    // Use a last pass based on the wining combinations
                    this.moveWinComb(winComb);
                } else {
                    disturb = disturb ? disturb : this.disturbPlayerWin();

                    if(!disturb && moved) {
                        // Use a pass based on the wining combinations
                        this.moveWinComb(winComb);
                    }
                }

                // if not used disturb or wining pass, doing random pass
                if(!disturb && !moved) {
                    this.getRandomMove();
                }

                this.gMove = false;
            }, 200);
        }
    },
    moveWinComb(winComb) {
        // This method use a pass based on the wining combinations
        for (idx in winComb) {
            let check = 0;
            if(winComb[idx] && !this.field[idx]) {
                check++;
            }

            if(check === 1) {
                this.field[idx] = 2;
                break;
            }
        }
    },
    disturbPlayerWin() {
        // This method return wining combinations who disturb wining player

        const playerWinCombs = this.checkPlayerWin();

        let disturb = false;
        if(playerWinCombs.length) {
            for (pWinCombs of playerWinCombs) {
                for(idx in pWinCombs) {
                    if(pWinCombs[idx] && !this.field[idx]) {
                        this.field[idx] = 2;
                        disturb = true;
                        break;
                    }
                }

                if(disturb) {
                    break;
                }
            }
        }

        return disturb;
    },
    getRandomMove() {
        // This method use a random pass
        let check = true;
        do {
            const rand = Math.floor(Math.random() * this.field.length);
            if(!this.field[rand]) {
                this.field[rand] = 2;
                check = false;
            }
        } while (check)
    },
    getWinCombs() {
        // Get wins combinations

        let winComb = [];
        // get all wining combinations based on the moves
        for(idx in this.field) {
            if(this.field[idx] === 2) {
                this.allWinCombs.map(arr => {
                    if(arr[idx]) {
                        winComb.push(arr);
                    }
                })
            }
        }

        // filter wining combinations based on the available moves
        for (idx in winComb) {
            let checkComb = 0;
            for(i in winComb[idx]) {
                if(winComb[idx][i] && this.field[i] !== 1) {
                    checkComb++;
                }
            }

            if(checkComb < 3) {
                winComb.splice(idx, 1);
            }
        }

        return winComb;
    },
    giveUp() {
        // This is a give up method
        if(this.status !== 1) {
            return false;
        }

        this.gameWrap.appendChild(this.substrate);

        const modal = document.getElementById('modal');
        if(modal) {
            modal.remove();
        }

        this.gameOver(false, true);
    },
    clearField() {
        this.field = [
                0,0,0,
                0,0,0,
                0,0,0
            ];
    },
    render() {
        // Render field method
        const intervalCheck = setInterval(() => {
            const cells = document.getElementsByClassName('cell');

            for(el in this.field) {
                switch (this.field[el]) {
                    case 0:
                        cells[el].classList.remove('p-active');
                        cells[el].classList.remove('g-active');
                        break;
                    case 1:
                        cells[el].classList.remove('g-active');
                        cells[el].classList.add('p-active');
                        break;
                    case 2:
                        cells[el].classList.remove('p-active');
                        cells[el].classList.add('g-active');
                        break;
                }
            }

            if(!this.gMove) {
                this.checkWin();
                clearInterval(intervalCheck);
            }
        });
    },
    gameOver(pWin, gWin) {
        let template = document.createElement('div'),
            childElement = document.createElement('div'),
            header = document.createElement('h3'),
            image = document.createElement('img');

        template.classList.add('modal');
        template.setAttribute('id', 'modal');

        if(pWin) {
            this.pCount++;

            childElement.classList.add('winner');
            header.textContent = 'Вы победили!';
            image.setAttribute('src', 'assets/img/winner.png');
        } else if(gWin) {
            this.gCount++;

            childElement.classList.add('looser');
            header.textContent = 'Вы проиграли!!';
            image.setAttribute('src', 'assets/img/looser.png');
        } else {
            childElement.classList.add('draw');
            header.textContent = 'Ничья!!';
            image.setAttribute('src', 'assets/img/draw.png');
        }

        childElement.appendChild(header);
        childElement.appendChild(image);
        template.appendChild(childElement);

        this.gameWrap.appendChild(template)

        this.status = 3;

        this.pCountElement.textContent = this.pCount;
        this.gCountElement.textContent = this.gCount;
    },
    checkPlayerWin() {
        // This method check is player is wins
        let pWinComb = [];

        for(comb of this.allWinCombs) {
            let pCheck = 0;

            for(idx in comb) {
                // This check is current field is wining
                if(comb[idx]) {
                    if(this.field[idx] === 1) {
                        pCheck++;
                    }
                }
            }

            if(pCheck === 2) {
                pWinComb.push(comb);
            }
        }

        return pWinComb;
    },
    checkWin() {
        // This method check is player or computer is wins

        let pWin = false,
            gWin = false;

        for(comb of this.allWinCombs) {
            let pCheck = 0,
                gCheck = 0;

            for(idx in comb) {
                // This check is current field is wining
                if(comb[idx]) {
                    switch (this.field[idx]) {
                        case 1:
                            pCheck++;
                            break;
                        case 2:
                            gCheck++;
                            break;
                    }
                }
            }

            if(pCheck === 3) {
                pWin = true;
            } else if(gCheck === 3) {
                gWin = true;
            }
        }

        if(pWin || gWin || !this.field.includes(0)) {
            this.gameOver(pWin, gWin);
        }
    }
}

document.addEventListener('DOMContentLoaded', function(){
    // Initialization all project
    game.load();

    // Add click event to cells
    const cells = document.getElementsByClassName('cell');
    for (let idx = 0; idx < cells.length; idx++) {
        const el = cells[idx];
        cells[idx].addEventListener('click', (event) => {
            game.playerPass(idx);
        });
    }
});

