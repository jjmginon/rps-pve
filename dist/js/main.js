// --- MAIN JS ENTRY POINT --- //

/* Imports: Game class */
import Game from "./Game.js";

/* Constants: storage keys, weapon options */
const game = new Game();

/* Storage keys */
const STORAGE_PLAYER_NAME = "playerName";
const STORAGE_PLAYER_LEGACY = "playerLegacy";
const STORAGE_COMPUTER_LEGACY = "computerLegacy";

/* Weapon options */
const WEAPONS = ["rock", "paper", "scissors"];

/* Chant sequence shown during countdown */
const CHANT_WORDS = ["Rock...", "Paper...", "Scissors...", "Shoot!"];

/* Listener guard — prevent duplicate listeners on re-init */
let listenersAttached = false;

/* Initialize App */

const initApp = () => {
    loadLegacyData();
    openHeraldScreen();
};

document.addEventListener("DOMContentLoaded", initApp);

/* Herald Screen */

const openHeraldScreen = () => {
    const heraldScreen = document.getElementById("herald-screen");
    const nameInput = document.getElementById("player-name-input");
    const actionsWrapper = document.getElementById("herald-actions");
    const savedName = localStorage.getItem(STORAGE_PLAYER_NAME);

    document.querySelector("main").setAttribute("inert", "");
    document.querySelector("main").setAttribute("aria-hidden", "true");

    if (savedName) nameInput.value = savedName;

    const hasLegacyData = localStorage.getItem(STORAGE_PLAYER_LEGACY) !== null;
    actionsWrapper.innerHTML = "";

    if (hasLegacyData) {
        const btnContinue = buildHeraldButton("Continue", "btn-herald", () => closeHeraldScreen(false));
        const btnNewGame = buildHeraldButton("New Game", "btn-herald btn-herald--new-game", () => showNewGameConfirmation(actionsWrapper));
        actionsWrapper.appendChild(btnContinue);
        actionsWrapper.appendChild(btnNewGame);
    } else {
        const btnBegin = buildHeraldButton("Begin", "btn-herald", () => closeHeraldScreen(false));
        actionsWrapper.appendChild(btnBegin);
    }

    heraldScreen.addEventListener("keydown", trapFocus);
    nameInput.focus();
};

const buildHeraldButton = (label, classNames, onClick) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = classNames;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    return btn;
};

const showNewGameConfirmation = (actionsWrapper) => {
    actionsWrapper.innerHTML = "";

    const warning = document.createElement("p");
    warning.className = "herald-screen__warning";
    warning.textContent = "Your Legacy will be forgotten...";

    const buttonRow = document.createElement("div");
    buttonRow.className = "herald-screen__button-row";

    const btnConfirm = buildHeraldButton("Erase Legacy", "btn-herald btn-herald--confirm-reset", () => closeHeraldScreen(true));
    const btnCancel = buildHeraldButton("Cancel", "btn-herald btn-herald--new-game", () => restoreHeraldButtons(actionsWrapper));

    buttonRow.appendChild(btnConfirm);
    buttonRow.appendChild(btnCancel);
    actionsWrapper.appendChild(warning);
    actionsWrapper.appendChild(buttonRow);

    btnConfirm.focus();
};

const restoreHeraldButtons = (actionsWrapper) => {
    actionsWrapper.innerHTML = "";
    const btnContinue = buildHeraldButton("Continue", "btn-herald", () => closeHeraldScreen(false));
    const btnNewGame = buildHeraldButton("New Game", "btn-herald btn-herald--new-game", () => showNewGameConfirmation(actionsWrapper));
    actionsWrapper.appendChild(btnContinue);
    actionsWrapper.appendChild(btnNewGame);
    btnContinue.focus();
};

const closeHeraldScreen = (resetLegacy) => {
    const heraldScreen = document.getElementById("herald-screen");
    const nameInput = document.getElementById("player-name-input");
    const enteredName = nameInput.value.trim() || "Player";

    game.setPlayerName(enteredName);
    localStorage.setItem(STORAGE_PLAYER_NAME, enteredName);

    if (resetLegacy) {
        game.resetLegacy();
        localStorage.setItem(STORAGE_PLAYER_LEGACY, 0);
        localStorage.setItem(STORAGE_COMPUTER_LEGACY, 0);
    }

    heraldScreen.removeEventListener("keydown", trapFocus);

    document.querySelector("main").removeAttribute("inert");
    document.querySelector("main").removeAttribute("aria-hidden");

    heraldScreen.classList.add("dismissing");
    heraldScreen.addEventListener("animationend", () => {
        heraldScreen.remove();
        startGame();
    }, { once: true });
};

const trapFocus = (event) => {
    if (event.key !== "Tab") return;

    const heraldScreen = document.getElementById("herald-screen");
    const focusable = Array.from(
        heraldScreen.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
        }
    }
};

/* Start game */

const startGame = () => {
    updateScoreboardNames();
    updateScoreboard();

    if (!listenersAttached) {
        listenForWeaponChoice();
        listenForEnterKey();
        listenForPlayAgain();
        listenForExitGame();
        listenersAttached = true;
    }

    lockComputerBoardHeight();
    computerPicksFirst();
    document.querySelector("h1").focus();
};

/* Data */

const loadLegacyData = () => {
    game.setPlayerLegacy(parseInt(localStorage.getItem(STORAGE_PLAYER_LEGACY)) || 0);
    game.setComputerLegacy(parseInt(localStorage.getItem(STORAGE_COMPUTER_LEGACY)) || 0);
};

const saveLegacyData = (winner) => {
    if (winner === "tie") return;
    const key = winner === "computer" ? STORAGE_COMPUTER_LEGACY : STORAGE_PLAYER_LEGACY;
    const score = winner === "computer" ? game.getComputerLegacy() : game.getPlayerLegacy();
    localStorage.setItem(key, score);
};

/* Scoreboard */

const updateScoreboardNames = () => {
    const name = game.getPlayerName();
    document.getElementById("scoreboard-player-name").textContent = name;
    document.getElementById("scoreboard-player-name-session").textContent = name;
};

const updateScoreboard = () => {
    const playerLegacyEl = document.getElementById("player-legacy-score");
    const computerLegacyEl = document.getElementById("computer-legacy-score");
    const playerSessionEl = document.getElementById("player-session-score");
    const computerSessionEl = document.getElementById("computer-session-score");

    playerLegacyEl.textContent = game.getPlayerLegacy();
    playerLegacyEl.ariaLabel = `${game.getPlayerName()} has ${game.getPlayerLegacy()} legacy wins.`;

    computerLegacyEl.textContent = game.getComputerLegacy();
    computerLegacyEl.ariaLabel = `Computer has ${game.getComputerLegacy()} legacy wins.`;

    playerSessionEl.textContent = game.getPlayerSession();
    playerSessionEl.ariaLabel = `${game.getPlayerName()} has ${game.getPlayerSession()} wins this session.`;

    computerSessionEl.textContent = game.getComputerSession();
    computerSessionEl.ariaLabel = `Computer has ${game.getComputerSession()} wins this session.`;
};

/* Computer Picks First */

const computerPicksFirst = () => {
    const computerBoard = document.getElementById("computer-board");
    const playerBoard = document.getElementById("player-board");
    const statusMsg = document.getElementById("computer-status-message");

    // Dim and disable player board while computer is choosing
    playerBoard.classList.add("player-board--waiting");

    // Show "choosing" phase first
    statusMsg.textContent = "Computer is choosing...";
    statusMsg.ariaLabel = "Computer is choosing a weapon.";

    // After 1.2s, pick weapon, switch to "chosen", re-enable player board
    setTimeout(() => {
        game.currentComputerWeapon = getComputerWeapon();
        computerBoard.classList.add("computer-board--chosen");
        statusMsg.textContent = "Computer has chosen...";
        statusMsg.ariaLabel = "Computer has chosen. Now pick your weapon.";

        // Re-enable player board
        playerBoard.classList.remove("player-board--waiting");
    }, 1200);
};

/* Player Input */

const listenForWeaponChoice = () => {
    const weaponTiles = document.querySelectorAll(".player-board .weapon-tile img");
    weaponTiles.forEach(img => {
        img.addEventListener("click", (event) => {
            // Also guard during computer's choosing phase
            if (game.getIsActive() || !game.currentComputerWeapon) return;
            game.start();

            const playerWeapon = event.target.parentElement.id;

            // Highlight chosen tile, collapse others
            weaponTiles.forEach(tile => {
                tile.parentElement.classList.add(
                    tile === event.target ? "weapon-tile--selected" : "weapon-tile--rejected"
                );
            });

            // Disable player board during chant
            document.getElementById("player-board").style.pointerEvents = "none";

            runChantSequence(playerWeapon);
        });
    });
};

const listenForEnterKey = () => {
    window.addEventListener("keydown", (event) => {
        if (event.code === "Enter" && event.target.tagName === "IMG") {
            event.target.click();
        }
    });
};

/* Chant Sequence */

const runChantSequence = (playerWeapon) => {
    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "chant-overlay";
    document.body.appendChild(overlay);

    const WORD_DURATION = 600;
    const TRANSITION_TIME = 250;

    let index = 0;

    const showNextWord = () => {
        if (index >= CHANT_WORDS.length) {
            // All words shown — remove overlay and resolve round
            overlay.remove();
            resolveRound(playerWeapon);
            return;
        }

        // Create word element
        const wordEl = document.createElement("p");
        wordEl.className = "chant-word";
        wordEl.textContent = CHANT_WORDS[index];
        overlay.innerHTML = "";
        overlay.appendChild(wordEl);

        index++;

        // After WORD_DURATION, animate out then show next
        setTimeout(() => {
            wordEl.classList.add("chant-word--out");
            setTimeout(showNextWord, TRANSITION_TIME);
        }, WORD_DURATION);
    };

    showNextWord();
};

/* Round Resolution */

const resolveRound = (playerWeapon) => {
    const computerWeapon = game.currentComputerWeapon;
    const winner = determineWinner(playerWeapon, computerWeapon);
    const resultMessage = buildResultMessage(winner, playerWeapon, computerWeapon);

    // Reveal computer board
    const computerBoard = document.getElementById("computer-board");
    computerBoard.classList.remove("computer-board--chosen");
    computerBoard.classList.add("computer-board--revealed");

    // Show computer's actual weapon in center tile
    showComputerWeapon(computerWeapon);

    // Update status messages
    updatePlayerStatusMessage(playerWeapon, winner);
    showComputerStatusMessage(resultMessage);
    updatePlayAgainAria(resultMessage, winner);

    // Record scores
    recordWinner(winner);
    saveLegacyData(winner);
    updateScoreboard();

    // Show action buttons after brief delay
    setTimeout(() => promptPlayAgain(), 800);
};

const getComputerWeapon = () => WEAPONS[Math.floor(Math.random() * WEAPONS.length)];

const determineWinner = (playerWeapon, computerWeapon) => {
    if (playerWeapon === computerWeapon) return "tie";
    if (
        playerWeapon === "rock" && computerWeapon === "paper" ||
        playerWeapon === "paper" && computerWeapon === "scissors" ||
        playerWeapon === "scissors" && computerWeapon === "rock"
    ) return "computer";
    return "player";
};

const buildResultMessage = (winner, playerWeapon, computerWeapon) => {
    if (winner === "tie") return "Tie game!";
    const attackingWeapon = winner === "computer" ? computerWeapon : playerWeapon;
    const defendingWeapon = winner === "computer" ? playerWeapon : computerWeapon;
    return `${toTitleCase(attackingWeapon)} ${getAttackVerb(attackingWeapon)} ${toTitleCase(defendingWeapon)}.`;
};

const getAttackVerb = (weapon) => {
    const verbs = { rock: "smashes", paper: "wraps", scissors: "cuts" };
    return verbs[weapon] ?? "beats";
};

const recordWinner = (winner) => {
    if (winner === "player") game.recordPlayerWin();
    if (winner === "computer") game.recordComputerWin();
};

/* UI updates */

const updatePlayerStatusMessage = (weapon, winner) => {
    const messageEl = document.getElementById("player-status-message");
    if (winner === "tie") {
        messageEl.textContent = "It's a tie!";
    } else if (winner === "player") {
        messageEl.textContent = `🏆 ${game.getPlayerName()} wins! 🏆`;
    } else {
        messageEl.textContent = "🤖 Computer wins! 🤖";
    }
};

const showComputerStatusMessage = (message) => {
    document.getElementById("computer-status-message").textContent = message;
};

const updatePlayAgainAria = (result, winner) => {
    const winMessage =
        winner === "player" ? `Congratulations, ${game.getPlayerName()} wins!` :
            winner === "computer" ? "The computer wins." : "";
    document.getElementById("btn-play-again").ariaLabel =
        `${result} ${winMessage} Click or press Enter to play again.`;
};

const showComputerWeapon = (weapon) => {
    // Hide all computer tiles first
    WEAPONS.forEach(w => {
        const tile = document.getElementById(`cp_${w}`);
        tile.classList.add("weapon-tile--rejected");
    });

    // Show only the chosen weapon in the center tile
    const centerTile = document.getElementById("cp_paper");
    centerTile.classList.remove("weapon-tile--rejected");
    centerTile.classList.add("weapon-tile--selected");
    if (centerTile.firstElementChild) centerTile.firstElementChild.remove();
    createWeaponImage(weapon, centerTile);
};

const promptPlayAgain = () => {
    document.getElementById("btn-play-again").classList.remove("hidden");
    document.getElementById("btn-exit-game").classList.remove("hidden");
    document.getElementById("btn-play-again").focus();
};

/* Reset */

const listenForPlayAgain = () => {
    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        resetBoard();
    });
};

const resetBoard = () => {
    // Clear stored computer weapon so guard blocks clicks until new pick
    game.currentComputerWeapon = null;

    // Reset tile classes
    document.querySelectorAll(".gameboard div").forEach(tile => {
        tile.className = "weapon-tile";
    });

    // Restore computer board images
    WEAPONS.forEach(weapon => {
        const tile = document.getElementById(`cp_${weapon}`);
        if (tile.firstElementChild) tile.firstElementChild.remove();
        createWeaponImage(weapon, tile);
    });

    // Reset computer board state
    const computerBoard = document.getElementById("computer-board");
    computerBoard.classList.remove("computer-board--chosen", "computer-board--revealed");

    // Re-enable player board
    document.getElementById("player-board").style.pointerEvents = "";
    document.getElementById("player-board").classList.remove("player-board--waiting");

    // Reset status messages
    document.getElementById("player-status-message").textContent = "Choose your weapon...";
    document.getElementById("computer-status-message").textContent = "Computer has chosen...";

    // Reset aria
    document.getElementById("btn-play-again").ariaLabel = "Choose your weapon";

    // Hide buttons and return focus
    document.getElementById("btn-play-again").classList.add("hidden");
    document.getElementById("btn-exit-game").classList.add("hidden");
    document.getElementById("player-status-message").focus();

    game.end();

    // Computer picks again for the new round
    computerPicksFirst();
};

/* Exit Game */

const listenForExitGame = () => {
    document.getElementById("btn-exit-game").addEventListener("click", exitGame);
};

const exitGame = () => {
    localStorage.removeItem(STORAGE_PLAYER_NAME);
    localStorage.removeItem(STORAGE_PLAYER_LEGACY);
    localStorage.removeItem(STORAGE_COMPUTER_LEGACY);

    game.end();
    game.resetLegacy();
    game.resetSession();

    resetBoard();
    updateScoreboard();

    const heraldMarkup = `
    <div id="herald-screen" class="herald-screen" aria-modal="true" role="dialog" aria-labelledby="herald-title" aria-describedby="herald-subtitle">
      <h1 id="herald-title" class="herald-screen__title">Rock Paper Scissors</h1>
      <p id="herald-subtitle" class="herald-screen__subtitle">The iron mind awaits your challenge.</p>
      <div class="herald-screen__divider" aria-hidden="true">✦</div>
      <div class="herald-screen__input-group">
        <label for="player-name-input">Your Name</label>
        <input type="text" id="player-name-input" maxlength="20" placeholder="Enter your name..." autocomplete="off" spellcheck="false">
      </div>
      <div id="herald-actions" class="herald-screen__actions"></div>
    </div>`;

    document.body.insertAdjacentHTML("afterbegin", heraldMarkup);
    openHeraldScreen();
};

/* Helpers */

const lockComputerBoardHeight = () => {
    const computerGameboard = document.querySelector(".computer-board .gameboard");
    const computedHeight = getComputedStyle(computerGameboard).getPropertyValue("height");
    computerGameboard.style.minHeight = computedHeight;
};

const createWeaponImage = (weapon, parentEl) => {
    const img = document.createElement("img");
    img.src = `img/${weapon}.png`;
    img.alt = weapon;
    parentEl.appendChild(img);
};

const toTitleCase = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;