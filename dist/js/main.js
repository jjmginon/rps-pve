// ============================================
// Main JS entry point
// ============================================
// Imports: Game class
// Constants: storage keys, weapon options
// Guards: listener flags
// Init: app bootstrap

import Game from "./Game.js";

const game = new Game();

/* Storage keys */
const STORAGE_PLAYER_NAME = "playerName";
const STORAGE_PLAYER_LEGACY = "playerLegacy";
const STORAGE_COMPUTER_LEGACY = "computerLegacy";

/* Weapon options */
const WEAPONS = ["rock", "paper", "scissors"];

/* Listener guards — prevent duplicate listeners on re-init */
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

    // Hide main game from screen readers and keyboard while herald is open
    document.querySelector("main").setAttribute("inert", "");
    document.querySelector("main").setAttribute("aria-hidden", "true");

    // Pre-fill name if returning player
    if (savedName) nameInput.value = savedName;

    // Build buttons based on whether save data exists
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

    // Trap focus inside the herald dialog
    heraldScreen.addEventListener("keydown", trapFocus);

    // Focus the name input
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

    // Warning always stacks above buttons
    const warning = document.createElement("p");
    warning.className = "herald-screen__warning";
    warning.textContent = "Your Legacy will be forgotten...";

    // Buttons go in their own row so they sit side by side at wider screens
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

    // Save name to game state and storage
    game.setPlayerName(enteredName);
    localStorage.setItem(STORAGE_PLAYER_NAME, enteredName);

    // Erase legacy if confirmed
    if (resetLegacy) {
        game.resetLegacy();
        localStorage.setItem(STORAGE_PLAYER_LEGACY, 0);
        localStorage.setItem(STORAGE_COMPUTER_LEGACY, 0);
    }

    // Remove focus trap before animating out
    heraldScreen.removeEventListener("keydown", trapFocus);

    // Restore main game to screen readers and keyboard
    document.querySelector("main").removeAttribute("inert");
    document.querySelector("main").removeAttribute("aria-hidden");

    // Animate out, then remove and start game
    heraldScreen.classList.add("dismissing");
    heraldScreen.addEventListener("animationend", () => {
        heraldScreen.remove();
        startGame();
    }, { once: true });
};

// Focus trap: keep Tab and Shift+Tab inside the herald dialog
const trapFocus = (event) => {
    if (event.key !== "Tab") return;

    const heraldScreen = document.getElementById("herald-screen");
    const focusable = Array.from(
        heraldScreen.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
        }
    } else {
        // Tab: if on last element, wrap to first
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

    // Attach listeners only once — guard prevents duplicates on re-init
    if (!listenersAttached) {
        listenForWeaponChoice();
        listenForEnterKey();
        listenForPlayAgain();
        listenForExitGame();
        listenersAttached = true;
    }

    lockComputerBoardHeight();
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

/* Player Input */

const listenForWeaponChoice = () => {
    const weaponTiles = document.querySelectorAll(".player-board .weapon-tile img");
    weaponTiles.forEach(img => {
        img.addEventListener("click", (event) => {
            if (game.getIsActive()) return;
            game.start();

            const chosenWeapon = event.target.parentElement.id;
            updatePlayerStatusMessage(chosenWeapon);

            weaponTiles.forEach(tile => {
                const tileEl = tile.parentElement;
                tileEl.classList.add(
                    tile === event.target ? "weapon-tile--selected" : "weapon-tile--rejected"
                );
            });

            runComputerAnimation(chosenWeapon);
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

/* Status */

const updatePlayerStatusMessage = (weapon) => {
    const messageEl = document.getElementById("player-status-message");
    messageEl.textContent = `You chose ${toTitleCase(weapon)}!`;
};

/* Animation */

const runComputerAnimation = (playerWeapon) => {
    let delay = 1000;
    setTimeout(() => showCountdownNumber("cp_rock", 1), delay);
    setTimeout(() => showCountdownNumber("cp_paper", 2), delay += 500);
    setTimeout(() => showCountdownNumber("cp_scissors", 3), delay += 500);
    setTimeout(() => fadeOutCountdown(), delay += 750);
    setTimeout(() => {
        clearCountdown();
        resolveRound(playerWeapon);
    }, delay += 1000);
    setTimeout(() => promptPlayAgain(), delay += 1000);
};

const showCountdownNumber = (tileId, number) => {
    const tile = document.getElementById(tileId);
    const child = tile.firstElementChild;

    // Guard: only remove if a child actually exists
    if (child) child.remove();

    const countdownEl = document.createElement("p");
    countdownEl.textContent = number;
    tile.appendChild(countdownEl);
};

const fadeOutCountdown = () => {
    document.querySelectorAll(".computer-board .weapon-tile p")
        .forEach(el => el.className = "fadeOut");
};

const clearCountdown = () => {
    document.querySelectorAll(".computer-board .weapon-tile p")
        .forEach(el => el.remove());
};

/* Round Resolution */

const resolveRound = (playerWeapon) => {
    const computerWeapon = getComputerWeapon();
    const winner = determineWinner(playerWeapon, computerWeapon);
    const resultMessage = buildResultMessage(winner, playerWeapon, computerWeapon);

    showComputerStatusMessage(resultMessage);
    updatePlayAgainAria(resultMessage, winner);
    recordWinner(winner);
    saveLegacyData(winner);
    updateScoreboard();
    updatePlayerWinMessage(winner);
    showComputerWeapon(computerWeapon);
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

// Safe fallback prevents silent undefined return
const getAttackVerb = (weapon) => {
    const verbs = { rock: "smashes", paper: "wraps", scissors: "cuts" };
    return verbs[weapon] ?? "beats";
};

const recordWinner = (winner) => {
    if (winner === "player") game.recordPlayerWin();
    if (winner === "computer") game.recordComputerWin();
};

/* UI updates */

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

const updatePlayerWinMessage = (winner) => {
    if (winner === "tie") return;
    const message = winner === "computer"
        ? "Computer wins!"
        : `${game.getPlayerName()} wins!`;
    document.getElementById("player-status-message").textContent = message;
};

// Always show computer choice in the center tile (cp_paper),
// regardless of actual weapon, for consistent UI design.
const showComputerWeapon = (weapon) => {
    createWeaponImage(weapon, document.getElementById("cp_paper"));
};

const promptPlayAgain = () => {
    const btnPlayAgain = document.getElementById("btn-play-again");
    const btnExitGame = document.getElementById("btn-exit-game");
    btnPlayAgain.classList.remove("hidden");
    btnExitGame.classList.remove("hidden");
    btnPlayAgain.focus();
};

/* Reset */

const listenForPlayAgain = () => {
    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        resetBoard();
    });
};

const resetBoard = () => {
    // Reset all tile classes
    document.querySelectorAll(".gameboard div").forEach(tile => {
        tile.className = "weapon-tile";
    });

    // Restore computer board images
    ["rock", "paper", "scissors"].forEach(weapon => {
        const tile = document.getElementById(`cp_${weapon}`);
        if (tile.firstElementChild) tile.firstElementChild.remove();
        createWeaponImage(weapon, tile);
    });


    // Reset status messages
    document.getElementById("player-status-message").textContent = "Choose your weapon...";
    document.getElementById("computer-status-message").textContent = "Computer Chooses...";

    // Reset aria label
    document.getElementById("btn-play-again").ariaLabel = "Choose your weapon";

    // Hide action buttons and return focus
    document.getElementById("btn-play-again").classList.add("hidden");
    document.getElementById("btn-exit-game").classList.add("hidden");
    document.getElementById("player-status-message").focus();

    game.end();
};

/* Exit Game */

const listenForExitGame = () => {
    document.getElementById("btn-exit-game").addEventListener("click", exitGame);
};

const exitGame = () => {
    // Wipe all localStorage
    localStorage.removeItem(STORAGE_PLAYER_NAME);
    localStorage.removeItem(STORAGE_PLAYER_LEGACY);
    localStorage.removeItem(STORAGE_COMPUTER_LEGACY);

    // Reset all game state
    game.end();
    game.resetLegacy();
    game.resetSession();

    // Reset board UI first so the game is clean behind the herald
    resetBoard();
    updateScoreboard();

    // Re-inject herald screen markup with updated subtitle
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

    // Open herald — this also sets inert/aria-hidden on main and traps focus
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