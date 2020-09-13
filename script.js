// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

testGame = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

var board = null;
var game = new Chess(testGame);
var pieceScoreDict = {
    "r": 5,
    "n": 3,
    "b": 3,
    "q": 9,
    "k": -18,
    "p": 1
};
var boardScoreMultiplyer = [
    [1.0,1.0025,1.0025,1.0025,1.0025,1.0025,1.0025,1.0],
    [1.005,1.005,1.005,1.005,1.005,1.005,1.005,1.005],
    [1.005,1.01,1.02,1.02,1.02,1.02,1.01,1.005],
    [1.005,1.01,1.02,1.03,1.03,1.02,1.01,1.005],
    [1.005,1.01,1.02,1.03,1.03,1.02,1.01,1.005],
    [1.005,1.01,1.02,1.02,1.02,1.02,1.01,1.005],
    [1.005,1.005,1.005,1.005,1.005,1.005,1.005,1.005],
    [1.0,1.0025,1.0025,1.0025,1.0025,1.0025,1.0025,1.0],
];

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function computerMakeMove () {

  possibleMoves = game.moves();

  // initialize alpha and beta for alpha-beta pruning
  alpha = -99999999
  beta = 99999999
  bestMove = miniMax(possibleMoves, 1, true, alpha, beta).move;

  // game over
  if (possibleMoves.length === 0) return

  game.move(bestMove);
  board.position(game.fen());
}

function miniMax(possibleMoves, depth, isMax, alpha, beta) {
    var bestScore = null;
    var bestMove = null;

    for (var i = 0; i < possibleMoves.length; i++)
    {
        game.move(possibleMoves[i]);
        var currentScore = getScore();
        if (depth <= 5) {
            currentScore = currentScore + miniMax(game.moves(), depth+1, !isMax, alpha, beta).score
        }
        game.undo();
        if (bestScore === null)
        {
            bestScore = currentScore;
            bestMove = possibleMoves[i];
        }
        
        if (isMax)
        {
            if (currentScore > bestScore)
            {
                bestScore = currentScore;
                bestMove = possibleMoves[i];
            }
            if (alpha < bestScore)
            {
                alpha = bestScore;
            }
            if (beta <= alpha)
            {
                console.log(alpha + " " + beta);
                break;    
            }
        }
        else if (!isMax)
        {
            if (currentScore < bestScore)
            {
                bestScore = currentScore;
                bestMove = possibleMoves[i];
            }
            if (beta > bestScore)
            {
                beta = bestScore
            }
            if (beta <= alpha)
            {
                console.log(alpha + " " + beta);
                break;    
            }
        }
    }
    return { "move": bestMove, "score": bestScore };
}

function getScore() {
    score = 0;
    theBoard = game.board();
    for (var i = 0; i < theBoard.length; i++)
    {
        for (var j = 0; j < theBoard[i].length; j++)
        {
            currPiece = theBoard[i][j];
            if (currPiece !== null)
            {
                multiplier = boardScoreMultiplyer[i][j];
                if (currPiece.color === "b")
                {
                    score = score + (pieceScoreDict[currPiece.type] * multiplier);
                }
                else if (currPiece.color === "w")
                {
                    score = score - (pieceScoreDict[currPiece.type] * multiplier);
                }
            }
        }
    }

    return score;
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make random legal move for black
  window.setTimeout(computerMakeMove, 250)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: testGame,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)