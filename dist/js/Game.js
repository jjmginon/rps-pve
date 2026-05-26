// ============================================
// Game Class Module
// ============================================
// Purpose: Encapsulates game state and logic
// Sections:
// - Game state (start/end)
// - Player name management
// - Legacy scores (persistent)
// - Session scores (per visit)
// - Win recording
// - Reset methods (legacy/session)

export default class Game {

    constructor() {
        this.isActive = false;
        this.playerName = "Player";
        this.playerLegacy = 0;
        this.computerLegacy = 0;
        this.playerSession = 0;
        this.computerSession = 0;
    }

    /* Game state */
    start() {
        this.isActive = true;
    }
    end() {
        this.isActive = false;
    }
    getIsActive() {
        return this.isActive;
    }

    /* Player name */
    setPlayerName(name) {
        this.playerName = name || "Player";
    }
    getPlayerName() {
        return this.playerName;
    }

    /* Legacy (all-time persistent) scores */
    setPlayerLegacy(score) {
        this.playerLegacy = score;
    }
    getPlayerLegacy() {
        return this.playerLegacy;
    }
    setComputerLegacy(score) {
        this.computerLegacy = score;
    }
    getComputerLegacy() {
        return this.computerLegacy;
    }

    /* Session (this visit) scores */
    getPlayerSession() {
        return this.playerSession;
    }
    getComputerSession() {
        return this.computerSession;
    }

    /* Win recording */
    recordPlayerWin() {
        this.playerSession += 1;
        this.playerLegacy += 1;
    }

    recordComputerWin() {
        this.computerSession += 1;
        this.computerLegacy += 1;
    }

    /* Reset legacy scores (New Game from herald) */
    resetLegacy() {
        this.playerLegacy = 0;
        this.computerLegacy = 0;
    }

    /* Reset session scores (new session after Exit Game) */
    resetSession() {
        this.playerSession = 0;
        this.computerSession = 0;
    }
}
