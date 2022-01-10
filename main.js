function hide() {
  let args = Array.from(arguments);
  args.forEach((x) => {
    x.setAttribute("class", "hidden");
  });
}

function reveal() {
  let args = Array.from(arguments);
  args.forEach((x) => {
    x.setAttribute("class", "");
  });
}

function printCards(hand) {
  return `${Array(hand.length)
    .fill("______")
    .join("&nbsp;&nbsp;")}<br>|${hand.join(
    "&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;|"
  )}&nbsp;&nbsp;&nbsp;&nbsp;|<br>|&nbsp;&nbsp;${hand.join(
    "&nbsp;&nbsp;|&nbsp;|&nbsp;&nbsp;"
  )}&nbsp;&nbsp;|<br>|&nbsp;&nbsp;&nbsp;&nbsp;${hand.join(
    "|&nbsp;|&nbsp&nbsp;&nbsp;&nbsp;"
  )}|<br>${Array(hand.length).fill("|_____|").join(" ")}`;
}

function printPlayerCards() {
  if (game.currentHand == game.playerHand) {
    return printCards(game.playerHand);
  } else {
    return `${printCards(game.splitPlayerHands[0])}<br>${printCards(
      game.splitPlayerHands[1]
    )}`;
  }
}

function printDealerCards() {
  return `______&nbsp;&nbsp;______<br>
  |XXXXX| |${game.dealerHand[1]}&nbsp;&nbsp;&nbsp;&nbsp;|<br>
  |XXXXX| |&nbsp;&nbsp;${game.dealerHand[1]}&nbsp;&nbsp;|<br>
  |XXXXX| |&nbsp;&nbsp;&nbsp;&nbsp;${game.dealerHand[1]}|<br>
  |_____| |_____|`;
}

const startDeck = "AAAA22223333444455556666777788889999XXXXJJJJQQQQKKKK".split(
  ""
);

const pointValues = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  X: 10,
  J: 10,
  Q: 10,
  K: 10,
};

function shuffle(array) {
  array = array.slice();
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

class Game {
  constructor() {
    this.deck = shuffle(startDeck);
    this.playerHand = [];
    this.splitPlayerHands = [[], []];
    this.dealerHand = [];
    this.pot = 0;
    this.insurancePot = 0;
    this.chips = 50;
    this.currentHand = this.playerHand;
  }
  shuffleDeck() {
    this.deck = shuffle(startDeck);
  }
  dealHand() {
    this.playerHand.push(this.deck.pop());
    this.dealerHand.push(this.deck.pop());
    this.playerHand.push(this.deck.pop());
    this.dealerHand.push(this.deck.pop());
  }
  dealHit(hand) {
    hand.push(this.deck.pop());
  }
  getHandValue(hand) {
    let result = hand.reduce((x, y) => {
      return x + pointValues[y];
    }, 0);
    if (hand.includes("A") && result < 12) {
      return result + 10;
    } else {
      return result;
    }
  }
  newHand() {
    playerCards.style.fontSize = "30px";
    this.playerHand = [];
    this.dealerHand = [];
    this.splitPlayerHands = [[], []];
    this.pot = 0;
    this.currentHand = this.playerHand;
    dealerCards.innerHTML = "";
    playerCards.innerHTML = "";
    hide(playAgainButton, quitButton);
    reveal(betField, submitBet);
    statusBar.innerHTML = "How much would you like to bet on this hand?";
  }
  hitOrStay() {
    statusBar.innerHTML = `Your hand is worth ${game.getHandValue(
      game.currentHand
    )}. Would you like to HIT or STAND?`;
    reveal(hitButton, standButton);
  }
  detectBust(hand) {
    return this.getHandValue(hand) > 21;
  }
  compareHands() {
    if (
      this.getHandValue(game.currentHand) == this.getHandValue(game.dealerHand)
    ) {
      return "tie";
    } else if (
      this.getHandValue(game.currentHand) < this.getHandValue(game.dealerHand)
    ) {
      return "dealer";
    } else {
      return "player'";
    }
  }
  compareSplitHands() {
    if (!this.detectBust(game.dealerHand)) {
      return game.splitPlayerHands.map((x) => {
        if (
          this.detectBust(x) ||
          this.getHandValue(x) < this.getHandValue(this.dealerHand)
        ) {
          return "lose";
        } else if (this.getHandValue(x) == this.getHandValue(this.dealerHand)) {
          return "draw";
        } else {
          return "win";
        }
      });
    } else {
      return game.splitPlayerHands.map((x) => {
        if (this.detectBust(x)) {
          return "lose";
        } else {
          return "win";
        }
      });
    }
  }
  splitEndProtocol() {
    let result = this.compareSplitHands();
    console.log(result);
    let firstMessage, secondMessage, thirdMessage;
    switch (result[0]) {
      case "win":
        firstMessage = "You win with your first hand!";
        this.chips += this.pot;
        break;
      case "draw":
        firstMessage = "You draw with your first hand.";
        this.chips += this.pot / 2;
        break;
      case "lose":
        firstMessage = "You lose with your first hand.";
        break;
    }
    switch (result[1]) {
      case "win":
        secondMessage = "You win with your second hand!";
        this.chips += this.pot;
        break;
      case "draw":
        secondMessage = "You draw with your second hand.";
        this.chips += this.pot / 2;
        break;
      case "lose":
        secondMessage = "You lose with your second hand.";
        break;
    }
    this.pot = 0;
    chipsAmount.textContent = this.chips;
    potAmount.textContent = this.pot;
    hide(
      hitButton,
      standButton,
      betField,
      submitBet,
      doubleDownButton,
      dontDoubleButton,
      submitInsuranceBet,
      dontInsureButton
    );
    if (this.chips > 1) {
      thirdMessage = "Care for another hand?";
      reveal(playAgainButton, quitButton);
    } else {
      thirdMessage =
        "You have no more chips to continue! Better luck next time!";
    }
    statusBar.innerHTML = `${firstMessage} ${secondMessage} ${thirdMessage}`;
  }
  winProtocol(phrase) {
    this.chips += this.pot * 2;
    this.pot = 0;
    chipsAmount.textContent = game.chips;
    hide(
      hitButton,
      standButton,
      betField,
      submitBet,
      doubleDownButton,
      dontDoubleButton,
      splitButton,
      dontSplitButton,
      submitInsuranceBet,
      dontInsureButton
    );
    potAmount.textContent = game.pot;
    statusBar.innerHTML = `${phrase} Care for another hand?`;
    reveal(playAgainButton, quitButton);
  }
  specialWinProtocol(phrase) {
    this.chips += this.pot * 3;
    this.pot = 0;
    chipsAmount.textContent = game.chips;
    potAmount.textContent = game.pot;
    hide(
      hitButton,
      standButton,
      betField,
      submitBet,
      doubleDownButton,
      dontDoubleButton,
      splitButton,
      dontSplitButton,
      submitInsuranceBet,
      dontInsureButton
    );
    statusBar.innerHTML = `${phrase} Care for another hand?`;
    reveal(playAgainButton, quitButton);
  }
  loseProtocol(phrase) {
    let message;
    this.pot = 0;
    potAmount.textContent = game.pot;
    hide(
      hitButton,
      standButton,
      betField,
      submitBet,
      doubleDownButton,
      dontDoubleButton,
      splitButton,
      dontSplitButton,
      submitInsuranceBet,
      dontInsureButton
    );
    if (this.chips < 1) {
      message = `You have no more chips to continue! Better luck next time!`;
    } else {
      message = `Care for another hand?`;
      reveal(playAgainButton, quitButton);
    }
    statusBar.innerHTML = `${phrase} ${message}`;
  }
  tieProtocol(phrase) {
    this.chips += this.pot;
    this.pot = 0;
    chipsAmount.textContent = game.chips;
    potAmount.textContent = game.pot;
    hide(
      hitButton,
      standButton,
      betField,
      submitBet,
      doubleDownButton,
      dontDoubleButton,
      splitButton,
      dontSplitButton,
      submitInsuranceBet,
      dontInsureButton
    );
    statusBar.innerHTML = `${phrase} Care for another hand?`;
    reveal(playAgainButton, quitButton);
  }
  placeBet(amt) {
    this.pot = amt;
    this.chips -= amt;
  }
  playFullHand() {
    let check = this.fullBlackjackCheck();
    if (check == "both") {
      this.tieProtocol(
        "You and the dealer both have Blackjack! Your bet is returned to you."
      );
    } else if (check == "dealer") {
      this.loseProtocol("The dealer has Blackjack! You lose!");
      dealerCards.innerHTML = printCards(this.dealerHand);
    } else if (check == "player") {
      this.specialWinProtocol("You have Blackjack! You win double!");
    } else if (this.playerHand[0] == "5" && this.playerHand[1] == "5") {
      statusBar.innerHTML =
        "Would you like to double down, split, or play the hand normally?";
      reveal(doubleDownButton, splitButton, dontSplitButton);
    } else if (
      this.playerHand[0] == this.playerHand[1] &&
      this.chips >= this.pot
    ) {
      this.offerSplit();
    } else if (
      this.getHandValue(this.playerHand) > 8 &&
      this.getHandValue(this.playerHand) < 12 &&
      this.chips >= this.pot
    ) {
      this.offerDoubleDown();
    } else {
      this.hitOrStay();
    }
  }
  dealerHits() {
    while (this.getHandValue(game.dealerHand) < 17) {
      this.dealHit(game.dealerHand);
    }
  }
  detectBlackjack(hand) {
    return (
      this[hand].length == 2 &&
      this[hand].includes("A") &&
      ["X", "J", "K", "Q"].some((x) => this[hand].includes(x))
    );
  }
  fullBlackjackCheck() {
    if (
      this.detectBlackjack("dealerHand") &&
      this.detectBlackjack("playerHand")
    ) {
      return "both";
    } else if (this.detectBlackjack("dealerHand")) {
      return "dealer";
    } else if (this.detectBlackjack("playerHand")) {
      return "player";
    } else {
      return undefined;
    }
  }
  offerDoubleDown() {
    hide(submitBet, betField);
    reveal(doubleDownButton, dontDoubleButton);
    statusBar.innerHTML = `Your hand totals ${this.getHandValue(
      game.playerHand
    )}. Would you like to double down?`;
  }
  offerSplit() {
    hide(submitBet, betField);
    statusBar.innerHTML =
      "Your hand is two of a kind. Would you like to split?";
    reveal(splitButton, dontSplitButton);
  }
  offerInsurance() {
    hide(submitBet, betField);
    statusBar.innerHTML =
      "The dealer shows an Ace. Would you care to place an insurance bet of up to half your original bet?";
    reveal(insuranceBetField, submitInsuranceBet, dontInsureButton);
  }
}

let game;

const startButton = document.getElementById("start-button");

const playerOptions = document.getElementById("options");

const potAmount = document.getElementById("pot-amount");

const chipsAmount = document.getElementById("chips-amount");

const statusBar = document.getElementById("status-bar");

const betField = document.getElementById("bet-field");

const submitBet = document.getElementById("submit-bet");

const playerCards = document.getElementById("player-hand");

const dealerCards = document.getElementById("dealer-hand");

const hitButton = document.getElementById("hit-button");

const standButton = document.getElementById("stand-button");

const playAgainButton = document.getElementById("play-again-button");

const quitButton = document.getElementById("quit-button");

const doubleDownButton = document.getElementById("double-down-button");

const dontDoubleButton = document.getElementById("dont-double-button");

const splitButton = document.getElementById("split-button");

const dontSplitButton = document.getElementById("dont-split-button");

const shuffleStatus = document.getElementById("shuffle-status");

const insuranceBetField = document.getElementById("insurance-bet-field");

const submitInsuranceBet = document.getElementById("submit-insurance-bet");

const dontInsureButton = document.getElementById("dont-insure-button");

const continueButton = document.getElementById("continue-button");

startButton.addEventListener("click", function () {
  hide(startButton);
  reveal(betField, submitBet);
  chipsAmount.innerHTML = "50";
  statusBar.innerHTML = "How much would you like to bet on this hand?";
  game = new Game();
});

submitBet.addEventListener("click", function () {
  let bet = Number(betField.value);
  if (isNaN(bet) || bet < 1 || bet > game.chips) {
    alert(`Please enter a number between 1 and ${game.chips}`);
    betField.value = "";
  } else {
    game.placeBet(bet);
    potAmount.textContent = game.pot;
    chipsAmount.textContent = game.chips;
    hide(betField, submitBet, shuffleStatus);
    game.dealHand();
    dealerCards.innerHTML = printDealerCards();
    playerCards.innerHTML = printPlayerCards();
    //insurance check goes here
    if (game.dealerHand[1] == "A") {
      game.offerInsurance();
    } else {
      game.playFullHand();
    }
  }
});

standButton.addEventListener("click", function () {
  if (game.currentHand == game.splitPlayerHands[0]) {
    game.currentHand = game.splitPlayerHands[1];
    game.hitOrStay();
    statusBar.innerHTML = "What about for your second hand?";
  } else {
    game.dealerHits();
    dealerCards.innerHTML = printCards(game.dealerHand);
    if (game.currentHand == game.splitPlayerHands[1]) {
      game.splitEndProtocol();
    } else if (game.detectBust(game.dealerHand)) {
      game.winProtocol(
        `The dealer busts with ${game.getHandValue(game.dealerHand)}! You Win!`
      );
    } else if (game.compareHands() == "dealer") {
      game.loseProtocol(`The dealer's hand beats yours! You lose!`);
    } else if (game.compareHands() == "tie") {
      game.tieProtocol(
        "You and the dealer have the same hand value! Your bet is returned to you."
      );
    } else {
      game.winProtocol(`Your hand beats the dealer's! You win!`);
    }
  }
});

hitButton.addEventListener("click", function () {
  game.dealHit(game.currentHand);
  playerCards.innerHTML = printPlayerCards();
  game.hitOrStay();
  if (game.detectBust(game.currentHand)) {
    if (game.currentHand == game.splitPlayerHands[0]) {
      game.currentHand = game.splitPlayerHands[1];
      game.hitOrStay();
      statusBar.innerHTML = `Your first hand has bust with ${game.getHandValue(
        game.splitPlayerHands[0]
      )}! Would you like to HIT or STAND for your second hand?`;
    } else if (game.currentHand == game.splitPlayerHands[1]) {
      if (game.detectBust(game.splitPlayerHands[0])) {
        game.splitEndProtocol();
      }
      game.dealerHits();
      game.splitEndProtocol();
    } else {
      game.loseProtocol(
        `You've bust with ${game.getHandValue(game.currentHand)}!`
      );
    }
  } else if (game.currentHand.length == 5) {
    game.specialWinProtocol("Five Card Charlie! You win double!");
  }
});

doubleDownButton.addEventListener("click", function () {
  game.chips -= game.pot;
  game.pot *= 2;
  chipsAmount.innerHTML = game.chips;
  potAmount.innerHTML = game.pot;
  game.dealHit(game.currentHand);
  playerCards.innerHTML = printPlayerCards();
  if (game.detectBust(game.playerHand)) {
    game.loseProtocol(
      `You've bust with ${game.getHandValue(game.playerHand)}!`
    );
  } else {
    game.dealerHits();
    dealerCards.innerHTML = printCards(game.dealerHand);
    if (game.detectBust(game.dealerHand)) {
      game.winProtocol(
        `The dealer busts with ${game.getHandValue(game.dealerHand)}! You Win!`
      );
    } else if (game.compareHands() == "dealer") {
      game.loseProtocol(`The dealer's hand beats yours! You lose!`);
    } else if (game.compareHands() == "tie") {
      game.tieProtocol(
        "You and the dealer have the same hand value! Your bet is returned to you."
      );
    } else {
      game.winProtocol(`Your hand beats the dealer's! You win!`);
    }
  }
});

dontDoubleButton.addEventListener("click", function () {
  hide(doubleDownButton, dontDoubleButton);
  game.hitOrStay();
});

splitButton.addEventListener("click", function () {
  game.chips -= game.pot;
  game.pot *= 2;
  potAmount.innerHTML = game.pot;
  chipsAmount.innerHTML = game.chips;
  game.splitPlayerHands[1].push(game.playerHand.pop());
  game.splitPlayerHands[0].push(game.playerHand.pop());
  playerCards.style.fontSize = "18px";
  game.currentHand = game.splitPlayerHands[0];
  hide(splitButton, dontSplitButton, doubleDownButton);
  if (game.splitPlayerHands[0][0] == "A") {
    game.dealHit(game.splitPlayerHands[0]);
    game.dealHit(game.splitPlayerHands[1]);
    game.dealerHits();
    dealerCards.innerHTML = printCards(game.dealerHand);
    game.splitEndProtocol();
  } else {
    game.hitOrStay();
  }
  playerCards.innerHTML = printPlayerCards();
});

dontSplitButton.addEventListener("click", function () {
  hide(doubleDownButton, dontDoubleButton, splitButton, dontSplitButton);
  game.hitOrStay();
});

submitInsuranceBet.addEventListener("click", function () {
  let bet = Number(insuranceBetField.value);
  insuranceBetField.value = "";
  if (isNaN(bet) || bet < 1 || bet > game.pot / 2) {
    alert(`Please enter a number between 1 and ${game.pot / 2}`);
  } else {
    game.chips -= bet;
    game.insurancePot = bet;
    potAmount.textContent = `${game.pot} / ${game.insurancePot}`;
    chipsAmount.textContent = game.chips;
    hide(insuranceBetField, submitInsuranceBet, dontInsureButton);
    if (["J", "Q", "K", "X"].includes(game.dealerHand[0])) {
      game.chips += game.insurancePot * 3;
      game.insurancePot = 0;
      potAmount.textContent = `${game.pot} / ${game.insurancePot}`;
      chipsAmount.textContent = game.chips;
      statusBar.innerHTML =
        "The dealer has Blackjack! You win your insurance bet.";
      reveal(continueButton);
    } else {
      game.insurancePot = 0;
      potAmount.textContent = `${game.pot} / ${game.insurancePot}`;
      chipsAmount.textContent = game.chips;
      statusBar.innerHTML = "No Blackjack, you lose your insurance bet.";
      reveal(continueButton);
    }
  }
});

continueButton.addEventListener("click", function () {
  hide(continueButton);
  game.playFullHand();
});

dontInsureButton.addEventListener("click", function () {
  game.playFullHand();
});

playAgainButton.addEventListener("click", function () {
  if (game.deck.length < 26) {
    game.shuffleDeck();
    reveal(shuffleStatus);
  }
  game.newHand();
});

quitButton.addEventListener("click", function () {
  hide(playAgainButton, quitButton);
  statusBar.innerHTML = `After a long night at the Blackjack table, you walk away with $${game.chips} to your name.`;
  game.chips = 0;
  chipsAmount.innerHTML = 0;
});
