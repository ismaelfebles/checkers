const readline = require("readline");


const emptyCellChar = '-';
const emptyArray = [, , , , , , , ,];
const columnReference = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rowReference = ['1', '2', '3', '4', '5', '6', '7', '8'];
const playerChars = ['o', 'x'];
const specialCommands = {
  help: context => context.printHelp(),
  board: (context, board) => context.printBoard(board),
};


module.exports = {
  /**
   * Normal player characters
   */
  normalPlayerChars: {
    O: 'o',
    X: 'x',
  },
  /**
   * New board
   */
  getEmptyBoard: function () {
    return [...emptyArray]
      .map(_m => [...emptyArray].fill(emptyCellChar));
  },

  /**
   * Manage user input
   */
  promptUser: function (prompt = '> ') {
    return new Promise(resolve => {
      const rl = readline.createInterface(process.stdin, process.stdout);

      rl.question(prompt, resp => {
        resolve(resp);
        rl.close();
      });
    })
  },

  manageSpecialPrompts: function (board) {
    return async prompt => {
      let response = '';

      while (!response) {
        response = await this.promptUser(prompt);

        if (specialCommands[response]) {
          specialCommands[response](this, board);
          response = '';
        }
      }

      return response;
    };
  },

  /**
   * Show current player order
   */
  getPlayerOrder: function () { return playerChars },

  /**
   * Change the player order and return it
   */
  changePlayerOrder: function () { return playerChars.reverse() },

  /**
   * Board depiction
   */
  printBoard: function (board) {
    console.log();
    console.log('  ', ...columnReference.map(m => ` ${m} `));

    board.forEach((f, i) => {
      console.log(rowReference[i], ...f.map(m => `| ${m}`), '|');
    });

    console.log();
  },

  /**
   * Set the starting position to the specified player
   */
  setPlayerStartingPosition: function (board, player, startsTop) {
    board
      .filter((_f, i) => startsTop ? i < 3 : i > 4)
      .forEach((f, i) => {
        for (let x = 0; x < f.length; x++) {
          f[x] = (x + (i % 2)) % 2 ^ startsTop ? emptyCellChar : player;
        }
      });
  },

  /**
   * Print welcome message
   */
  printWelcomeMessage: async function () {
    console.log();
    console.log('Welcome to a new game of * CHECKER *');
    console.log();
    console.log('- Player 1 (x) will always move first');
    console.log('- Each time a new game starts, the starting position shuflles');
    console.log();
    console.log();

    let response = '';

    while (!response) {
      response = await this.promptUser('Ready to start? (y/n) ');

      switch (response.toLowerCase()) {
        case 'y':
        case 'n':
          response = response.toLowerCase();
          break;

        default:
          response = '';
          break;
      }
    }

    return response === 'y';
  },

  /**
   * 
  */
  locatePieces: function (board, player) {
    const pieceLocations = [];
    board.forEach((rowItem, rowIndex) => {
      rowItem.forEach((columnItem, columnIndex) => {
        if (columnItem.toLowerCase() === player)
          pieceLocations.push([rowIndex, columnIndex]);
      });
    });

    return pieceLocations;
  },

  /**
   * 
   */
  positionTranslator: function (positions) {
    if (Array.isArray(positions[0]))
      return positions.map(m => [rowReference[m[0]], columnReference[m[1]]]);

    return positions.length ? [rowReference[positions[0]], columnReference[positions[1]]] : null;
  },

  /**
   * 
   */
  calculateMovement: function (board, player, piece, startsTop, playerLocations) {
    const oponentPlayer = this.getPlayerOrder().find(f => player !== f);
    const pieceStatus = board[piece[0]][piece[1]] === player.toUpperCase() ? 'king' : 'normal';
    const oponentLocations = this.locatePieces(board, oponentPlayer);

    const upMovements = [
      // Left place
      [emptyCellChar, oponentPlayer].includes(
        `${(board[piece[0] - 1] || [])[piece[1] - 1]}`.toLowerCase()) ?
        [piece[0] - 1, piece[1] - 1] :
        null,

      // Right place
      [emptyCellChar, oponentPlayer].includes(
        `${(board[piece[0] - 1] || [])[piece[1] + 1]}`.toLowerCase()) ?
        [piece[0] - 1, piece[1] + 1] :
        null,

    ].filter(f => f);

    const downMovements = [
      // Left place
      [emptyCellChar, oponentPlayer].includes(
        `${(board[piece[0] + 1] || [])[piece[1] - 1]}`.toLowerCase()) ?
        [piece[0] + 1, piece[1] - 1] :
        null,

      // Right place
      [emptyCellChar, oponentPlayer].includes(
        `${(board[piece[0] + 1] || [])[piece[1] + 1]}`.toLowerCase()) ?
        [piece[0] + 1, piece[1] + 1] :
        null,
    ].filter(f => f);

    // if (pieceStatus)

    // console.log((upMovements));
    // console.log(this.positionTranslator(upMovements));
    // console.log(this.positionTranslator(downMovements));
    // console.log((downMovements));
  },

  /**
   * 
   */
  calculateJump: function (board, oponentPlayer, piece) {
    const oponentPlayer = this.getPlayerOrder().find(f => player !== f);

    const upJumps = [
      // Left place
      `${(board[piece[0] - 1] || [])[piece[1] - 1]}`.toLowerCase() === oponentPlayer ?
        [piece[0] - 1, piece[1] - 1] : null,
      // Right place
      (board[piece[0] - 1] || [])[piece[1] + 1] === emptyCellChar ? [piece[0] - 1, piece[1] + 1] : null,
    ].filter(f => f);

    const downJumps = [
      // Left place
      (board[piece[0] + 1] || [])[piece[1] - 1] === emptyCellChar ? [piece[0] + 1, piece[1] - 1] : null,
      // Right place
      (board[piece[0] + 1] || [])[piece[1] + 1] === emptyCellChar ? [piece[0] + 1, piece[1] + 1] : null,
    ].filter(f => f);

    // console.log((upMovements));
    // console.log(this.positionTranslator(upMovements));
    // console.log(this.positionTranslator(downMovements));
    // console.log((downMovements));
  },

  getLocation: function (piece, verticicalPosition, horizontalPosition) {
    const tempResult = [];

    if (verticicalPosition === 'up') {
      if (piece[0] > 0) {
        tempResult.push(piece[1] < emptyArray.length - 1 ? [piece[0] - 1, piece[1] + 1] : null);
        tempResult.push(piece[1] > 0 ? [piece[0] - 1, piece[1] - 1] : null);
      }
    }
    else {
      if (piece[0] < emptyArray.length - 1) {
        tempResult.push(piece[1] < emptyArray.length - 1 ? [piece[0] + 1, piece[1] + 1] : null);
        tempResult.push(piece[1] > 0 ? [piece[0] + 1, piece[1] - 1] : null);
      }
    }

    if (horizontalPosition === 'right')
      return tempResult[0];

    return tempResult[1];
  },

  /**
   * Print help
   */
  printHelp: function () {
    console.log();
    console.log('* HELP *');
    console.log();
    console.log('- To move a piece, select the specified option number for the playable fields');
    console.log('- To go back in the menu, input the option 0');
    console.log('- To exit, press Ctrl + C');
    console.log('- To print the board again, type board');
    console.log('- To print this help again, type "help"');
    console.log();
  },

  /**
   * Start the game
   */
  startGame: async function () {
    const board = this.getEmptyBoard();
    const customPrompt = this.manageSpecialPrompts(board);
    let turnCounter = 0;
    let currentTurn = 'x';

    playerChars.forEach((f, i) => this.setPlayerStartingPosition(board, f, i === 0));
    this.printBoard(board);
    this.printHelp();

    while (true) {
      const startsTop = playerChars[0] === currentTurn;
      turnCounter++;
      console.log(`- Player "${currentTurn}" | turn ${Math.ceil(turnCounter / 2)} -`);
      console.log();

      const pieces = this.locatePieces(board, currentTurn);
      const piecesLocation = this.positionTranslator(pieces);

      piecesLocation.forEach((f, i) => console.log(`${i + 1}) ${f[1]}${f[0]}`));

      let selectecPiece = '';

      while (!selectecPiece) {
        selectecPiece = await customPrompt();

        if (isNaN(selectecPiece)
          || +selectecPiece - 1 < 0 ||
          +selectecPiece > pieces.length) {
          selectecPiece = '';
          continue;
        }
      }

      this.calculateMovement(board, currentTurn, pieces[+selectecPiece - 1], startsTop);

      await this.promptUser();

      currentTurn = playerChars[(turnCounter - 1) % 2];
    }
  },
};