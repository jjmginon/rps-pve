# Rock Paper Scissors: PvE ⚔️📜

Rock Paper Scissors: PvE is a reimagined take on the classic duel — blending RPG‑style panels, immersive chant sequences, and gold‑trimmed aesthetics into a modern web experience. Designed in 2026, the project elevates simple gameplay with accessibility‑first structure, performance‑optimized styling, and dynamic JavaScript logic.

---

## 🌐 Project Overview

This site demonstrates how a timeless game can be transformed into a professional showcase:

- **Semantic HTML5** for clarity, accessibility, and maintainability
- **Responsive SCSS/CSS3** with variables, mixins, grid, flexbox, and component‑based class naming
- **JavaScript (ES6 modules)** for herald screen logic, chant sequences, and round resolution
- **Original RPG‑inspired design** — gold accents, immersive animations, and narrative status messages

---

## 📂 File Structure

```
rps-pve/
│
├── dist/
│   ├── index.html        # Main game interface
│   ├── css/
│   │   ├── main.min.css  # Compiled CSS
│   │   └── main.min.css.map # Source map
│   ├── js/
│   │   ├── Game.js       # Game state and logic class
│   │   └── main.js       # App bootstrap, herald, chant, round resolution
│   ├── img/              # Weapon images (rock, paper, scissors)
│   └── favicon/          # Favicon and PWA assets
│
├── scss/
│   ├── abstracts/        # Colors, mixins
│   ├── base/             # Resets, typography
│   ├── components/       # Accessibility, animations, utilities
│   ├── layout/           # Scoreboard, gameboard
│   └── main.scss         # Entry point
```

---

## ✨ Highlights

- **Accessibility‑first design**  
  ARIA roles, focus management, skip links, and screen‑reader friendly scoreboard.

- **Immersive chant sequence**  
  “Rock… Paper… Scissors… Shoot!” overlay with animated word transitions.

- **Dynamic herald screen**  
  RPG‑style intro with player name entry, legacy/session score management, and reset confirmation.

- **Responsive gameboard**  
  Gold‑trimmed panels, animated weapon tiles, and adaptive layouts for different screen sizes.

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/rps-pve.git
   ```
2. Navigate into the project folder:
   ```bash
   cd rps-pve
   ```
3. Open `dist/index.html` in your browser to play the game.

---

## 🛠️ Technologies

- **HTML5** — semantic structure and accessibility
- **SCSS/CSS3** — variables, mixins, responsive layouts, animations
- **JavaScript (ES6 modules)** — herald screen, chant sequence, game logic
- **LocalStorage API** — persistent legacy scores across sessions

---

## 📖 Context

Rock Paper Scissors: PvE began as a simple coding exercise but has been refactored into a modern showcase of front‑end development. The project demonstrates how foundational tutorials can evolve into original, scalable, and professional web experiences — emphasizing accessibility, performance, and design clarity.

---

## 👨‍💻 Author

**JJ Ginon**  
Front‑end Web Developer | Accessibility‑first, performance‑optimized, modern web projects
