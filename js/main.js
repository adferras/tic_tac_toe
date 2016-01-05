var play = {

  gameCount: 0,
  undef: '',
  player: '',
  wopr: '',
  lastWoprMove: '',
  opponent: 'human',
  winningCombos: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ],

  board: [
    '#top-left',
    '#top-center',
    '#top-right',
    '#middle-left',
    '#middle-center',
    '#middle-right',
    '#bottom-left',
    '#bottom-center',
    '#bottom-right'
  ],

  availableMoves: [
    '#top-left',
    '#top-center',
    '#top-right',
    '#middle-left',
    '#middle-center',
    '#middle-right',
    '#bottom-left',
    '#bottom-center',
    '#bottom-right'
  ],

  main: function main(playerOne) {
    if (play.gameCount > 0) {
      setTimeout(function() {
        $('h2').remove();
        for (i = 0; i < play.board.length; i++) {
          $(play.board[i] + ' h2').removeClass('winner');
        }
        $('.playerOneWins').removeClass('result');
        $('.playerTwoWins').removeClass('result');
        $('.playerTies').removeClass('result');
      }, 2000);
    }

    play.lastPlayerMove = '';
    play.playerType = '';
    play.currentPlayer = '';
    play.completedMoves = [];
    play.protoboard = [];

    if (play.gameCount === 0) {
      $('.playerScore').text(0);
      $('.computerScore').text(0);
      play.player = playerOne;
      playerOne === 'O' ? play.wopr = 'X': play.wopr = 'O';
      $('.playerOneMark').text(play.player);
      $('.playerTwoMark').text(play.wopr);
    }

    play.gameCount++;

    (function initBoard() {
      play.availableMoves = [];
      for (var i = 0; i < play.board.length; i++) {
        play.availableMoves.push(play.board[i]);
      }
    })();

    play.playerMove();
  },

  playerMove: function playerMove() {
    $('.playerOne').addClass('current');
    $('.playerTwo').removeClass('current');
    play.playerType = 'playerMoves';
    play.currentPlayer = play.player;
    play.makeMove();
  },

  woprMove: function woprMove() {
    $('.playerTwo').addClass('current');
    $('.playerOne').removeClass('current');
    play.playerType = 'woprMoves';
    play.currentPlayer = play.wopr;
    play.opponent === 'human' ? play.makeMove() : play.makeWoprMove();
  },

  makeMove: function makeMove() {
    var allSquares = this.availableMoves.join(', ');
    $(allSquares).one('click', function() {
      $(allSquares).off('click');
      $(this).append("<h2 class='" + play.playerType + "'>" + play.currentPlayer + '</h2>');
      play.disableSquare('#' + $(this).attr('id'), play.availableMoves);

      var playerMoves = play.marks(play.currentPlayer);
      play.nextMove(playerMoves);
    });
  },

  makeWoprMove: function makeWoprMove() {
    var recommendedMove = play.search(0, 1, -100, 100);
    $(play.board[recommendedMove]).append("<h2 class='" + play.playerType + "'>" + play.currentPlayer + '</h2>');
    play.disableSquare(play.board[recommendedMove], play.availableMoves);

    var playerMoves = play.marks(play.currentPlayer);
    play.nextMove(playerMoves);
  },

  disableSquare: function disableSquare(lastPlayerMove, remaining) {
    remaining = remaining || this.availableMoves;
    for (var i = 0; i < remaining.length; i++) {
      if (remaining[i] === lastPlayerMove) {
        remaining.splice(i, 1);
      }
    }
    return remaining;
  },

  marks: function marks(mark) {
    var played = [];
    for (var i = 0; i < play.board.length; i++) {
      if (mark === $(play.board[i]).find('h2').text()) {
        played.push(i);
        play.currentPlayer === play.player ? play.protoboard[i] = -1 : play.protoboard[i] = 1;
        play.completedMoves[i] = play.currentPlayer;
      }
    }
    return played;
  },

  nextMove: function nextMove(playerMoves) {
    if (play.gameOver(playerMoves)) {
      play.over(play.currentPlayer);
    } else if (play.availableMoves.length > 0) {
      play.playerType === 'playerMoves' ? play.woprMove() : play.playerMove();
    } else {
      play.over();
    }
  },

  gameOver: function gameOver(playerMarks) {
    for (i = 0; i < play.winningCombos.length; i++) {
      if (play.winningCombos[i].every(function(val) {
          return playerMarks.indexOf(val) >= 0;
        })) {
        play.highlight(playerMarks);
        return true;
      }
    }
  },

  highlight: function highlight(playerMarks) {
    for (j = 0; j < playerMarks.length; j++) {
      $(play.board[playerMarks[j]] + ' h2').addClass('winner');
    }
  },

  over: function over(type) {
    var currentScore = $('.playerScore').text();
    if (type === play.player) {
      $('.playerScore').text(parseInt(currentScore) + 1);
      $('.playerOneWins').addClass('result');
    } else if (type === play.wopr) {
      $('.computerScore').text(parseInt(currentScore) + 1);
      $('.playerTwoWins').addClass('result');
    } else {
      var ties = $('.ties').text();
      $('.ties').text(parseInt(ties) + 1);
      $('.playerTies').addClass('result');
    }
    play.main(type);
  },

  chk: function chk(depth) {
    for (var z in play.winningCombos) {
      j = x = o = 3;
      while (j--) {
        k = play.winningCombos[z][j];
        play.protoboard[k] > 0 && x--;
        play.protoboard[k] < 0 && o--;
      }
      if (!x) return 100 - depth;
      if (!o) return depth - 100;
    }
  },

  search: function search(depth, player, alpha, beta) {
    var i = 9,
      min = -100,
      max, value, next;
    if (value = play.chk(depth)) {
      return value * player;
    }
    if (6 > depth) {
      while (i--) {
        if (!play.protoboard[i]) {
          play.protoboard[i] = player;
          value = -play.search(depth + 1, -player, -beta, -alpha);
          play.protoboard[i] = play.undef;
          if (max === undefined || value > max) max = value;
          if (value > alpha) alpha = value;
          if (alpha >= beta) return alpha;
          if (max > min) {
            min = max;
            next = i;
          }
        }
      }
    }
    return depth ? max || 0 : next;
  }
};

//modal
$('#chooseXorO').modal({
  show: true,
  backdrop: true,
  keyboard: false
});

function begin(form) {
  if (getRadioValue(form.opponent) === 'human') {
    play.opponent = 'human';
    $('.playerOneInfo').text('Player One:');
    $('.playerTwoInfo').text('Player Two:');
  } else {
    play.opponent = 'computer';
    $('.playerOneInfo').text('Player:');
    $('.playerTwoInfo').text('Computer:');
  }

  if (getRadioValue(form.marker) === 'X') {
    play.gameCount = 0;
    play.main('X');
    $('#chooseXorO').modal('hide');
  } else {
    play.gameCount = 0;
    play.main('O');
    $('#chooseXorO').modal('hide');
  }
}

$('.close').on('click', function() {
  console.log('player did not choose');
});

function getRadioValue(group) {
  var radioVal = "";
  if (group.length) {
    for (var i = 0; i < group.length && !radioVal; i++)
      if (group[i].checked)
        radioVal = group[i].value;
  } else
    radioVal = group.checked ? group.value : "";
  return radioVal;
}
