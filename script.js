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
var boardScoreAdder = [
    [0.0,0.1,0.1,0.1,0.1,0.1,0.1,0.0],
    [0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4],
    [0.4,0.6,0.8,0.8,0.8,0.8,0.6,0.4],
    [0.4,0.6,0.8,1,1,0.8,0.6,0.4],
    [0.4,0.6,0.8,1,1,0.8,0.6,0.4],
    [0.4,0.6,0.8,0.8,0.8,0.8,0.6,0.4],
    [0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4],
    [0.0,0.1,0.1,0.1,0.1,0.1,0.1,0.0],
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
  TheMove = miniMax(possibleMoves, 1, true, alpha, beta);

  // game over
  if (possibleMoves.length === 0) return

  console.log(TheMove);

  game.move(TheMove.move);
  board.position(game.fen());
}

function miniMax(possibleMoves, depth, isMax, alpha, beta) {
    var bestScore = null;
    var bestMove = null;

    // To make the game unique, let's shuffle the possible moves before we score moves.
    // Alpha beta pruning will always pick different moves due to the randomness.
    possibleMoves = possibleMoves.sort(() => Math.random() - 0.5);

    for (var i = 0; i < possibleMoves.length; i++)
    {
        game.move(possibleMoves[i]);
        if (depth < 4)
        {
          currentMoveScore = miniMax(game.moves(), depth+1, !isMax, alpha, beta).score;
        }
        else {
          currentMoveScore = getScore();
        }
        game.undo();

        if (isMax)
        {
          if (bestScore === null || currentMoveScore > bestScore)
          {
            bestScore = currentMoveScore;
            alpha = bestScore;
            bestMove = possibleMoves[i];
          }
          if (alpha >= beta)
            break;
        }
        else if (!isMax )
        {
          if (bestScore === null || currentMoveScore < bestScore)
          {
            bestScore = currentMoveScore;
            beta = bestScore;
            bestMove = possibleMoves[i];
          }
          if (beta <= alpha)
            break;
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
                adder = boardScoreAdder[i][j];
                if (currPiece.color === "b")
                {
                    score = score + (pieceScoreDict[currPiece.type] + adder);
                }
                else if (currPiece.color === "w")
                {
                    score = score - (pieceScoreDict[currPiece.type] + adder);
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

  // make legal move for black
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
