const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const gameBoard = (() => {
    let board = new Array(9).fill(null);
    let turn = ''; // player is x, opponent is o

    const makeMove = (index) => {
        if (board[index] || checkWinner()) return false;
        board[index] = turn;
        // update html
        const button = document.getElementById(`button${index}`);
        button.innerText = turn;
        //
        turn = (turn === 'x') ? 'o' : 'x';
        return true;
    }

    const checkWinner = () => {
        for (let combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    const checkDraw = () => {
        if (board.some(x => !x)) return false; // empty spaces? no draw
        return !checkWinner(); // return opposite of checkWinner
    }

    const reset = () => {
        board.fill(null);
        turn = 'x';
        // update html
        for (let i = 0; i < 9; i++) {
            const button = document.getElementById(`button${i}`);
            button.innerText = '';

        }
    }

    return {
        get board() { return board; },
        get turn() { return turn; },
        makeMove,
        checkDraw,
        checkWinner,
        reset
    }
})();

const opponentAi = (() => {
    const nextMove = () => {
        const moves = {
            winningMoves: [],
            blockMoves: [],
            validMoves: []
        };
        for (let combo of winningCombinations) {    // checks for 1 away from wins
            const x = combo.filter(a => gameBoard.board[a] === 'x');  // x spaces
            const o = combo.filter(a => gameBoard.board[a] === 'o');  // o spaces
            const e = combo.filter(a => gameBoard.board[a] != 'o' && gameBoard.board[a] != 'x'); // empty spaces
            if ((x.length + o.length) == 2) // 2 of 3 spaces are filled
            {
                if (o.length == 2)   // opponent is 1 away
                    moves.winningMoves.push(e[0]);
                else if (x.length == 2) // player is 1 away
                    moves.blockMoves.push(e[0]);
            }
        }
        for (let i = 0; i < 9; i++) { // get all empty spaces
            if (!gameBoard.board[i]) moves.validMoves.push(i);
        }
        // return random move in order of "should i make this move"
        if (moves.winningMoves.length) return GetRandomFromArray(moves.winningMoves);
        if (moves.blockMoves.length) return GetRandomFromArray(moves.blockMoves);
        if (moves.validMoves.length) return GetRandomFromArray(moves.validMoves);
    }

    return {
        nextMove,
    }
})();

async function move(index) {
    if (gameBoard.turn != 'x') return;

    if (gameBoard.makeMove(index)) {
        let winner = gameBoard.checkWinner();
        if (winner) {
            Speak("a lottery ticket during your next outing, perhaps?");
            return;
        }

        if (gameBoard.checkDraw()) {
            Speak("handed the advantage yet still you fail? pathetic.");
            return;
        }

        // AI move
        await Speak('hmmmm....');
        await sleep(1000);
        gameBoard.makeMove(opponentAi.nextMove());

        winner = gameBoard.checkWinner();
        if (winner) {
            Speak("worm.")
            return;
        }

        if (gameBoard.checkDraw()) {
            Speak("handed the advantage yet still you fail? pathetic.");
        }

        await Speak("aha!");
    }
}

const GetRandomFromArray = (array) => array[Math.floor(Math.random() * array.length)];

// non ttt
async function SpeakMany(lines) {
    for (const line of lines) {
        await Speak(line);
        await sleep(1500);
    }
    return;
}
async function Speak(line) {
    const textbox = document.getElementById("dialogue-box");
    let speech = "";
    for (let i = 0; i < line.length; i++) {
        speech += line[i];
        playLetter(line[i]);
        textbox.innerText = speech;
        textbox.scrollTop = textbox.scrollHeight;
        await sleep(25);
    }
    return;
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const openingDialogue = [
    "welcome to my website, challenger.",
    "we will be engaging in a brief bout of tic tac toe.",
    "as your gracious host, i will bequeath you the first move.",
];

/*
* below here also uses libraries or whatever
*/

// preload alphabet sounds
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const sampler = new Tone.Sampler(
    Object.fromEntries( // map each sound to a key
        letters.map((letter, i) => [`C${4 + i}`, `alphabet/${letter}.wav`])
    ),
    { release: 0.2 }
).toDestination();

// pitch shift up
const pitchShift = new Tone.PitchShift({ pitch: +10 }).toDestination();
sampler.connect(pitchShift);

function playLetter(letter) {
    if (/[a-zA-Z]/.test(letter)) {
        const note = `C${4 + letter.toUpperCase().charCodeAt(0) - 65}`;
        sampler.triggerAttackRelease(note, 0.15, Tone.now(), 1, 3);
    }
}

// start dialogue on first click
document.addEventListener('click', async () => {
    const evilDiv = document.getElementById('evil-div');
    evilDiv.style.pointerEvents = 'none';
    evilDiv.style.opacity = '0';
    // audio
    await Tone.start();      // unlock audiocontext (requires user interaction)
    await Tone.loaded();     // wait until all samples are loaded
    // game
    await SpeakMany(openingDialogue);
    await Speak("go ahead, if you dare.");
    gameBoard.reset();
}, { once: true });

window.addEventListener("load", (event) => {
    // https://github.com/tholman/cursor-effects
    new cursoreffects.fairyDustCursor({
        colors: ["#ff88bb", "#55ddee", "#ffeeaa", "#99dd88", "#ddbbff"]
    });
});