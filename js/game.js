import data from "./data.js";
import overlay from "./overlay.js";

const game = {
  shuffleArray: [],
  pokemons: [],
  firstCard: null,
  secondCard: null,
  move: 0,
  timer: null,
  time: 0,
  best: {
    beginner: {
      score: 0,
      time: 0,
    },
    intermediate: {
      score: 0,
      time: 0,
    },
    expert: {
      score: 0,
      time: 0,
    },
  },
  /* Utils */
  setShuffleArray: (array) => {
    if (!array) throw new Error("I can't shuffleArray without array");
    if (!Array.isArray(array))
      throw new Error("I can't shuffleArray without array");

    const newArray = [...array];
    const shuffledArray = [];
    for (let i = 0; i < array.length; i++) {
      const randomIndex = Math.floor(Math.random() * newArray.length);
      shuffledArray.push(newArray[randomIndex]);
      newArray.splice(randomIndex, 1);
    }
    return shuffledArray;
  },
  loadStorage: () => {
    const storage = JSON.parse(localStorage.getItem("games"));
    const nickname = storage?.nickname;
    const difficulty = storage?.currentGame?.difficulty;
    return { nickname, difficulty };
  },
  /* Methods */
  init: () => {
    game.shuffleArray = [];
    game.pokemons = [];
    game.firstCard = null;
    game.secondCard = null;
    game.move = 0;
    game.timer = null;
    game.time = 0;

    const { nickname, difficulty } = game.loadStorage();
    const level = game.getLevel(difficulty) || 4;

    game.setBest();
    game.betterTimeView();

    game.start(level, data);
    game.restart();
  },
  getLevel: (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return 4;
      case "intermediate":
        return 6;
      case "expert":
        return 8;
      default:
        return 4;
    }
  },
  getShuffleArray: (level) => {
    const cards = level ** 2;

    if (!level) throw new Error("I can't getShuffleArray without level");

    if (cards > 64 || cards < 16) throw new Error("Invalid level number");

    const array = [];

    for (let i = 1; i <= cards / 2; i++) {
      array.push(i);
      array.push(i);
    }

    if (array.length === 0) throw new Error("Empty array");

    if (array.length !== cards) throw new Error("Invalid array length");

    return game.setShuffleArray(array);
  },
  getPokemonsList: (array, data) => {
    if (!array)
      throw new Error("I can't getPokemonsList without a shuffle Array");
    if (!data) throw new Error("No data found");

    const pokemons = [];
    array.forEach((item) => {
      const pokemon = data.results[item - 1];
      pokemons.push(pokemon);
    });

    return pokemons;
  },
  checkCards: () => {
    if (!game.firstCard || !game.secondCard) return;

    const firstCard = game.firstCard;
    const secondCard = game.secondCard;
    const shuffleArray = game.shuffleArray;

    console.log(shuffleArray); // dev
    if (!shuffleArray[firstCard] || !shuffleArray[secondCard]) return;

    if (shuffleArray[firstCard] === shuffleArray[secondCard]) return true;

    return false;
  },
  checkIfEndGame: () => {
    const cards = document.querySelectorAll(".card");
    if (!cards) throw new Error("no cards found");

    const fadeOutCards = document.querySelectorAll(".card.fade-out");
    if (fadeOutCards.length === game.shuffleArray.length) game.endGame();

    return;
  },

  // dev : panel ---------------------------------------------------
  counterMoves: () => {
    game.move++;

    return;
  },
  setTimer: {
    start: () => {
      game.timer = setInterval(() => {
        game.time++;
        game.timerView();
      }, 1000);
    },
    stop: () => {
      clearInterval(game.timer);
      game.timer = game.formatTime(0);
      return;
    },
  },
  setBest: () => {
    const { difficulty } = game.loadStorage();
    const score = game.move;
    const time = game.time;

    if (difficulty === "beginner") {
      if (score < game.best.beginner.score) {
        game.best.beginner.score = score;
      }
      if (time < game.best.beginner.time) {
        game.best.beginner.time = time;
      }
    }

    if (difficulty === "intermediate") {
      if (score < game.best.intermediate.score) {
        game.best.intermediate.score = score;
      }
      if (time < game.best.intermediate.time) {
        game.best.intermediate.time = time;
      }
    }

    if (difficulty === "expert") {
      if (score < game.best.expert.score) {
        game.best.expert.score = score;
      }
      if (time < game.best.expert.time) {
        game.best.expert.time = time;
      }
    }

    return;
  },
  // end dev : panel ---------------------------------------------------

  /* Render */
  render: (level) => {
    if (!level) throw new Error("no level to generate board");
    const board = game.boardView(level);

    for (let i = 0; i < level ** 2; i++) {
      const card = game.cardView();
      board.appendChild(card);
    }

    const cards = board.querySelectorAll(".card");
    if (!cards) throw new Error("no cards found");

    /* Events */
    game.clickOnCard(cards);
  },

  // dev : panel ---------------------------------------------------
  counterMovesView: () => {
    const counter = document.querySelector(".panel-moves .value");
    counter.textContent = game.move;
  },
  timerView: () => {
    const timerEl = document.querySelector(".panel-time .value");
    timerEl.textContent = game.formatTime(game.time);
  },
  formatTime: (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    if (minutes < 10 && seconds < 10) return `0${minutes}:0${seconds}`;

    return `${minutes}:${seconds}`;
  },
  betterTimeView: () => {
    const { difficulty } = game.loadStorage();
    const bestTime = document.querySelector(".panel-best-time .value");

    if (difficulty === "beginner") {
      bestTime.textContent = game.formatTime(game.best.beginner.time);
    }

    if (difficulty === "intermediate") {
      bestTime.textContent = game.formatTime(game.best.intermediate.time);
    }

    if (difficulty === "expert") {
      bestTime.textContent = game.formatTime(game.best.expert.time);
    }
  },
  // end dev : panel ---------------------------------------------------

  cardView: () => {
    //<div class="card">
    //   <div class="card-body flipped">
    //     <!-- <img src="./images/1.svg" alt="bulbasaur" /> -->
    //     <img src="./images/pokeball.png" alt="pokeball" />
    //   </div>
    // </div>
    const card = document.createElement("div");
    card.classList.add("card");
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "flipped");
    const back = document.createElement("img");
    back.src = "./images/pokeball.png";
    back.alt = "pokeball";

    cardBody.appendChild(back);
    card.appendChild(cardBody);

    return card;
  },
  boardView: (items) => {
    const board = document.getElementById("board");

    const boardParent = board.parentElement;

    board.remove();

    const maxSizeOfParent = Math.min(
      boardParent.offsetWidth,
      boardParent.offsetHeight
    );

    const parentChildren = boardParent.children;

    let maxSizeOfOtherChildren = 0;
    for (const child of parentChildren) {
      const rect = child.getBoundingClientRect();
      maxSizeOfOtherChildren += Math.min(rect.right, rect.bottom);
    }

    const boardElement = document.createElement("div");
    boardElement.id = "board";
    boardElement.classList.add("board");

    const boardElementSize = maxSizeOfParent - maxSizeOfOtherChildren;

    boardElement.style.width = `${boardElementSize}px`;
    boardElement.style.height = `${boardElementSize}px`;
    boardElement.style.maxWidth = `${boardElementSize}px`;
    boardElement.style.maxHeight = `${boardElementSize}px`;

    boardElement.style.gridTemplateColumns = `repeat(${items}, 1fr)`;

    boardParent.appendChild(boardElement);

    return boardElement;
  },
  removeBoard: () => {
    const board = document.getElementById("board");
    if (!board) throw new Error("no board found");
    board.remove();
  },
  flipCard: (card) => {
    if (!card) throw new Error("no card to flip");
    const cardBody = card.querySelector(".card-body");
    cardBody.classList.toggle("flipped");
  },
  fadeOutCard: (card) => {
    if (!card) throw new Error("no card to flip");
    card.classList.add("fade-out");
  },
  removeCard: (card) => {
    if (!card) throw new Error("no card to flip");
    const cardBody = card.querySelector(".card-body");
    card.removeChild(cardBody);
  },
  addPokemonImage: (card, pokemon) => {
    if (!card) throw new Error("no card to add pokemon image");
    if (!pokemon) throw new Error("no pokemon to add pokemon image");

    const cardBody = card.querySelector(".card-body");
    if (!cardBody) throw new Error("no cardBody to add pokemon image");

    const front = document.createElement("img");
    front.src = pokemon.image;
    front.alt = pokemon.name;

    cardBody.appendChild(front);
  },
  /* Events */
  clickOnCard: (cards) => {
    if (!cards) throw new Error("no card to click");
    cards.forEach((card, index) => {
      if (!card) return;
      card.addEventListener("click", () => {
        if (card.classList.contains("disabled")) return;

        const pokemon = game.pokemons[index];

        game.addPokemonImage(card, pokemon);
        game.flipCard(card);
        card.classList.add("disabled");

        if (!game.firstCard) {
          game.firstCard = `${index}`;
          return;
        }

        game.secondCard = `${index}`;

        game.counterMoves();
        // dev : panel
        game.counterMovesView();
        // end dev : panel

        cards.forEach((item) => {
          item.classList.add("disabled");
        });

        setTimeout(() => {
          game.checkCards();

          if (game.checkCards()) {
            game.fadeOutCard(cards[game.firstCard]);
            game.fadeOutCard(cards[game.secondCard]);

            game.removeCard(cards[game.firstCard]);
            game.removeCard(cards[game.secondCard]);

            game.checkIfEndGame(); // dev
          } else {
            game.flipCard(cards[game.firstCard]);
            game.flipCard(cards[game.secondCard]);
          }

          game.firstCard = null;
          game.secondCard = null;

          cards.forEach((item) => {
            item.classList.remove("disabled");
          });
        }, 1000);
      });
    });
  },
  /* Game */
  start: (level, data) => {
    game.shuffleArray = game.getShuffleArray(level);
    game.pokemons = game.getPokemonsList(game.shuffleArray, data);
    game.render(level);
    game.setTimer.start();
  },
  restart: () => {
    // todo: refactor this
    const button = document.querySelector(".panel-restart-btn");
    if (!button) throw new Error("no button found");

    button.addEventListener("click", () => {
      overlay.startGame.render();
    });
  },
  endGame: () => {
    game.setTimer.stop();
    const { nickname, difficulty } = game.loadStorage();
    const score = game.move;
    const time = game.formatTime(game.time);

    const settings = {
      nickname,
      currentGame: {
        difficulty,
        score,
        time,
      },
    };

    const storage = JSON.parse(localStorage.getItem("games"));
    const games = storage?.games || [];

    games.push(settings);

    localStorage.setItem("games", JSON.stringify({ games }));

    overlay.endGame.render(nickname, score, time);
  },
};

export default game;
