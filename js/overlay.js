import game from "./game.js";

const overlay = {
  game: game,
  show: (el) => {
    el.classList.add("show");
  },
  hide: (el) => {
    el.classList.remove("show");
  },
  startGame: {
    el: document.getElementById("start-game"),
    /* Methods */
    render: () => {
      const form = overlay.startGame.el.querySelector("form");
      const nicknameInput = form.querySelector("#nickname");
      const difficultyInputs = form.querySelectorAll("[name=difficulty]");
      const storage = JSON.parse(localStorage.getItem("games"));
      const nickname = storage?.nickname || null;
      const difficulty = storage?.currentGame?.difficulty;
      if (nickname) nicknameInput.value = nickname;
      if (difficulty) {
        difficultyInputs.forEach((item) => {
          item.checked = false;
          if (item.querySelector(`#${difficulty}`)) item.checked = true;
        });
        const difficultyInput = form.querySelector(`#${difficulty}`);
        difficultyInput.checked = true;
      }
      overlay.show(overlay.startGame.el);
      overlay.startGame.play();
    },
    submit: () => {
      const form = overlay.startGame.el.querySelector("form");
      const nicknameInput = form.querySelector("#nickname");
      const difficultyInput = form.querySelector("[name=difficulty]:checked");
      const settings = {
        nickname: nicknameInput.value || null,
        currentGame: {
          difficulty: difficultyInput.value,
          score: 0,
          time: 0,
        },
      };
      localStorage.setItem("games", JSON.stringify(settings));
    },
    /* Events */
    play: () => {
      const button = overlay.startGame.el.querySelector(".overlay-play-btn");
      button.addEventListener("click", () => {
        overlay.startGame.submit();
        overlay.hide(overlay.startGame.el);
        overlay.game.init();
      });
    },
  },
  endGame: {
    el: document.getElementById("end-game"),
    /* Methods */
    render: (nickname = "", score = 0, time = "") => {
      const nicknameEl = overlay.endGame.el.querySelector(".overlay-header h2");
      const scoreEl = overlay.endGame.el.querySelector(".overlay-moves");
      const timeEl = overlay.endGame.el.querySelector(".overlay-time");

      nicknameEl.textContent = `Congratulations ${nickname}!`;
      scoreEl.textContent = ` ${score} `;
      timeEl.textContent = ` ${time} `;

      overlay.show(overlay.endGame.el);
      overlay.endGame.close();
      overlay.endGame.play();
    },
    /* Events */
    play: () => {
      const button = overlay.endGame.el.querySelector(".overlay-restart-btn");
      button.addEventListener("click", () => {
        overlay.hide(overlay.endGame.el);
        overlay.startGame.render();
      });
    },
    close: () => {
      const button = overlay.endGame.el.querySelector(".overlay-close-btn");
      button.addEventListener("click", () => {
        overlay.hide(overlay.endGame.el);
        overlay.startGame.render();
      });
    },
  },
};

export default overlay;
