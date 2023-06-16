// ----------- HTML Elements -----------
const playBtn = document.getElementById('play')
const newGameBtn = document.getElementById('new-game');
const restartBtn = document.querySelectorAll('.restart');
const hitBtn = document.getElementById('hit');
const stayBtn = document.getElementById('stay');
const playerCardContainer = document.getElementById('card-container');
const dealerCardContainer = document.getElementById('dealer-cards');
const playerScore = document.getElementById('player-score');
const dealerScore = document.getElementById('dealer-score');
const closeBtn = document.getElementById('close-button');
const popUpScreen = document.getElementById('popup-screen');
const startScreen = document.getElementById('intro-screen');
const instructions = document.getElementById('instructions');




// ----------- Objects -----------

// Object to create a deck of 52 cards 
const deck = {
    // Properties
    suits: ['S', 'H', 'D', 'C'],
    cardValues: ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'],
    deckArray: [],
    players: [{score: 0, scoreHigh: 0, hand: []}, {score: 0, scoreHigh: 0, hand: []} ],
    foundWinner: false,
    extraCard: false,

    // Methods

    // create a deck of 52 cards
    createDeck: function() {
        this.deckArray = [];

        for (let i = 0; i < this.cardValues.length; i++) {
            for (j =0; j < this.suits.length; j++) {

                let weight = this.cardValues[i];

                if (this.cardValues[i] == 'J' || this.cardValues[i] == 'Q' || this.cardValues[i] == 'K') {
                    weight = 10;
                }
                if (this.cardValues[i] == 'A') {
                    weight = 1;
                }

                let card = {
                    value: this.cardValues[i],
                    suit: this.suits[j],
                    faceValue: weight
                };

                this.deckArray.push(card);
            }
        }
    },

    // shuffle function based on this stackoverflow answer: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    shuffle: function() {
        let i, j, k;

        for (i = this.deckArray.length -1; i > 0; i--) {
            j = Math.floor(Math.random() * (i +1));
            k = this.deckArray[i]
            this.deckArray[i] = this.deckArray[j];
            this.deckArray[j] = k;
        }
    },

    // alternate dealing two cards to the two players
    dealCards: function() {
        // Deal two cards
        for(let i=0; i < 2; i++) {
            // alternate between players
            for (let j = 0; j < 2; j++) {
                let card = {};
                card = deck.deckArray.pop();

                this.players[j].hand.push(card);

                // Player's hand
                if (j == 0) {
                    this.showCard(card.value, card.suit, playerCardContainer);
                }
            }
        }
        this.updateScore(1)
    },

    // display the players card on the screen
    showCard: function(value, suit, cardContainer) {
        const child = document.createElement('div');
        child.innerHTML = `<img src="images/card-${value}-${suit}.png" alt="Playing Card">`
        child.classList.add('flip')
        cardContainer.appendChild(child);
    },

    // Calculate each players score and display it on the screen
    updateScore: function(numOfPlayers) {
        // loop through each player
        for (let i = 0; i < numOfPlayers; i++) {
            let score = 0;
            let hasAce = false;
            numCards = this.players[i].hand.length;
    
            // loop through each card of the player
            for ( let j = 0; j < numCards; j++) {
                score += this.players[i].hand[j].faceValue;

                // check if a player has an ace in their hand
                if (this.players[i].hand[j].value == 'A') {
                    hasAce = true;
                }
            }

            this.players[i].score = score;
            // calculate the alternative score using ace = 11 and store it in the property scoreHigh
            if (hasAce) {
                this.players[i].scoreHigh =  this.players[i].score + 10;
            }
        } 

        // Display the dealer and player scores
        playerScore.innerHTML = 'Your score: ' + this.players[0].score;
        dealerScore.innerHTML = `Dealer's score: ` + this.players[1].score;

        // display the 'high score' as well if it is less than or equal to 21 for both the dealer and player
        if (this.players[0].scoreHigh > 0 && this.players[0].scoreHigh <= 21) {
            playerScore.innerHTML += ' or ' + this.players[0].scoreHigh;
        }
        if (this.players[1].scoreHigh > 0 && this.players[1].scoreHigh <= 21) {
            dealerScore.innerHTML += ' or ' + this.players[1].scoreHigh;
        }
    },

    // Allow player to get more cards
    hit: function() {
        let card = {};
        card = deck.deckArray.pop();

        this.players[0].hand.push(card);
        this.showCard(card.value, card.suit, playerCardContainer);
        this.updateScore(1);
        this.checkPlayer();
    },

    // After player decides to stay, give dealer more cards if they have 17 or less
    stay: function() {
        endGame();
        for(let i = 0; i < this.players[1].hand.length; i++) {
            this.showCard(this.players[1].hand[i].value, this.players[1].hand[i].suit, dealerCardContainer);
        }

        while (this.players[1].score < 17 && this.players[1].scoreHigh < 17) {
            this.extraCard = true;
            let card = {};
            card = deck.deckArray.pop();
    
            this.players[1].hand.push(card);
            this.showCard(card.value, card.suit, dealerCardContainer);
            this.updateScore(2);
            this.checkDealer();
            this.checkPlayer();
        }
        if (this.extraCard) {
            setTimeout(function(){
                deck.checkWinner();
            }, 800)
        }else {
            this.checkWinner();
        }
    },

    // Check player's score
    checkPlayer: function() {
        // If the player has 21, display the winning message
        if (this.players[0].score == 21 || this.players[0].scoreHigh == 21) {
            endGame();
            document.getElementById('popup-text').innerHTML = `You won! Your score is 21! <br><br>Press 'Restart' to play again.`
            setTimeout(function() {
                popUpScreen.style.display = 'flex'
            }, 800);
            this.foundWinner = true;
        }

        // If the player's score is bigger than 21, display a bust message
        if (this.players[0].score > 21) {
            let score = this.players[0].score
            endGame();
            document.getElementById('popup-text').innerHTML = `Bust! You lost. <br><br>Press 'Restart' to play again.`
            setTimeout(function() {
                popUpScreen.style.display = 'flex'
            }, 800);
            this.foundWinner = true;
            
        }

        // if the player's scoreHigh is bigger than 21, only display the lower score using the ace = 1 case and get rid of the 'high score'
        if (this.players[0].scoreHigh > 21) {
            this.players[0].scoreHigh = 0;
            playerScore.innerHTML = 'Your score: ' + this.players[0].score;
        }
    },

    // Check dealer's score
    checkDealer: function() {
        // If the dealer has 21, display message that the dealer has won
        if (this.players[1].score == 21 || this.players[1].scoreHigh == 21) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer won! Their score is 21! <br><br>Press 'Restart' to play again.`
            setTimeout(function() {
                popUpScreen.style.display = 'flex'
            }, 800);
            this.foundWinner = true;
        }

        // If the dealer has more than 21, display that the dealer has bust
        if (this.players[1].score > 21) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer bust! You won! <br><br>Press 'Restart' to play again.`
            setTimeout(function() {
                popUpScreen.style.display = 'flex'
            }, 800)
            this.foundWinner = true;
        }
        // If the dealer's scoreHigh is bigger than 21, only display the lower score using the ace = 1 case and get rid of the 'high score'
        if (this.players[1].scoreHigh > 21) {
            this.players[1].scoreHigh = 0;
            dealerScore.innerHTML = `Dealer's score: ` + this.players[1].score;
        }


    },

    checkWinner: function() {
        // If either the player or dealer has already won or bust, skip this function
        if (this.foundWinner) {
            return
        }
        // Check all cases comparing the player's and dealer's 'high score' if they both have an ace
        else if (this.players[1].scoreHigh > 0 && this.players[0].scoreHigh > this.players[1].scoreHigh) {
            endGame();
            document.getElementById('popup-text').innerHTML = `You won! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[0].scoreHigh > 0 && this.players[1].scoreHigh > this.players[0].scoreHigh) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer won. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[0].scoreHigh > 0 && this.players[1].scoreHigh > 0 && this.players[0].scoreHigh == this.players[1].scoreHigh){
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        // If the player has an ace, check if the player's 'high score' is greater, equal, or less than the dealer's score
        else if (this.players[0].scoreHigh > this.players[1].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `You won! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[0].scoreHigh == this.players[1].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[0].scoreHigh > 0 && this.players[1].score > this.players[0].scoreHigh) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer won. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        // If the dealer has an ace, check if the dealer's 'high score' is greater, equal, or less than the player's score
        else if (this.players[1].scoreHigh > this.players[0].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer won. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[1].scoreHigh == this.players[0].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[1].scoreHigh > 0 && this.players[0].score > this.players[1].scoreHigh) {
            endGame();
            document.getElementById('popup-text').innerHTML = `You won! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        // Check which player's score is greater or if they are equal
        else if (this.players[0].score > this.players[1].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `You won! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[1].score > this.players[0].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `Dealer won. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (this.players[0].score == this.players[1].score) {
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie! <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
    },

    // check if the player and dealer both have 21 at the start of the game
    checkBlackJack: function() {
        const playerScoreTot = this.players[0].score;
        const playerScoreHighTot = this.players[0].scoreHigh;
        const dealerScoreTot = this.players[1].score;
        const dealerScoreHighTot = this.players[1].scoreHigh;

        if (playerScoreTot == 21 && dealerScoreTot == 21) {
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie. There are no winners. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
        else if (playerScoreHighTot == 21 && dealerScoreHighTot == 21) {
            endGame();
            document.getElementById('popup-text').innerHTML = `It's a tie. There are no winners. <br><br>Press 'Restart' to play again.`
            popUpScreen.style.display = 'flex';
        }
    }

}; // End object to create a deck of cards


// ----------- Functions -----------

// Start game function
function startGame() {
    instructions.innerHTML = `Press 'Restart' to restart the game at anytime`
    newGameBtn.disabled = true;
    newGameBtn.style.display = 'none';
    restartBtn.forEach(a => a.style.display = 'block');
    hitBtn.disabled = false;
    stayBtn.disabled = false;
    deck.createDeck();
    deck.shuffle();
    deck.dealCards();
    deck.checkBlackJack();
    deck.checkPlayer();
    deck.checkDealer();
};

// Disbale hit and stay button if player has won or bust
function endGame() {
    hitBtn.disabled = true;
    stayBtn.disabled = true;
}

// Restart game function
function restartGame() {
    deck.deckArray = [];
    deck.players = [{score: 0, scoreHigh: 0, hand: []}, {score: 0, scoreHigh: 0, hand: []} ];
    deck.foundWinner = false;
    deck.extraCard = false;
    playerScore.innerHTML = 'Your score: ';
    dealerScore.innerHTML =  `Dealer's score: `;
    popUpScreen.style.display = 'none';

    while (playerCardContainer.firstChild) {
        playerCardContainer.removeChild(playerCardContainer.firstChild)
    };
    while (dealerCardContainer.firstChild) {
        dealerCardContainer.removeChild(dealerCardContainer.firstChild)
    };

    setTimeout(function () {
        startGame();
    }, 200)

}


// ----------- Event Listeners -----------
playBtn.addEventListener('click', function(){
    startScreen.style.display = 'none';
    newGameBtn.classList.add('new-game')
})

newGameBtn.addEventListener('click', startGame);

hitBtn.addEventListener('click', function(){
    deck.hit();
})

stayBtn.addEventListener('click', function() {
    deck.stay();
})

closeBtn.addEventListener('click', function() {
    popUpScreen.style.display = 'none';
})

Array.from(restartBtn).forEach(function(restartBtn) {
    restartBtn.addEventListener('click', restartGame);
})