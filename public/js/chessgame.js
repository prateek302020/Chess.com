const socket = io();
const chess = new Chess();
const boardelement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderboard = () => {
  const board = chess.board();
  boardelement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );

        pieceElement.innerText = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handlemove(sourceSquare, targetSquare);
        }
      });
      boardelement.appendChild(squareElement);
    });
  });
  if (playerRole === "b") {
    boardelement.classList.add("flipped");
  } else {
    boardelement.classList.remove("flipped");
  }
};
const handlemove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    prmotion: "q",
  };

  socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
  const unicodepieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
  };

  return unicodepieces[piece.type] || "";
};

socket.on("playerRole", function (role) {
  playerRole = role;
  renderboard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderboard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderboard();
});
socket.on("move", function (move) {
  chess.move(move);
  renderboard();
});
renderboard();
