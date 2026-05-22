# Realm of Aetheria ⚔️

**A Pixel RPG Adventure — Beta 0.0.2.8 (Still Under Development)**

> Explore the magical world of Aetheria, battle monsters, collect gold, buy gear, and save the realm — all in glorious 48x48 pixel art!

![Genre](https://img.shields.io/badge/Genre-Pixel%20RPG-orange)
![Version](https://img.shields.io/badge/Version-0.0.2.8%20Beta-yellow)
![AI](https://img.shields.io/badge/AI-Xiaomi%20MiMo%20(Optional)-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎮 Play Now

Simply open `index.html` in a modern browser — no installation needed!

**Live Demo:** [Play Online](https://mimo-pixel-game-mmhgywuj.devinapps.com)

---

## 📖 About

Realm of Aetheria is a top-down pixel RPG adventure game built entirely with vanilla HTML5 Canvas and JavaScript. No frameworks, no dependencies — just pure web technology.

The game features **optional AI integration** powered by [Xiaomi MiMo](https://100t.xiaomimimo.com/), enabling intelligent NPC dialogs and dynamic battle commentary when an API key is provided.

---

## ✨ Features

### Core Gameplay
- **Top-down exploration** — Navigate a rich pixel art world with smooth movement
- **Turn-based battle system** — Fight 8 unique enemy types with Attack, Magic, Item, and Flee options
- **Gold economy** — Collect gold coins scattered across the world and earn rewards from battles
- **Level-up system** — Gain EXP from battles, level up to increase HP, MP, ATK, DEF
- **Save & Continue** — Full save/load system using localStorage

### Shop & Items
- **Full shop system** — Buy weapons, armor, potions, and special items from Elara's Emporium
- **15+ unique items:**
  - **Weapons:** Wooden Sword, Iron Sword, Flame Blade, Crystal Staff, Shadow Dagger
  - **Armor:** Leather Armor, Chain Mail, Dragon Plate, Mage Robe
  - **Potions:** Health Potion, Greater HP Potion, Mana Potion, Strength Elixir, Defense Elixir, Antidote
  - **Special:** Gold Ring (luck bonus), Aether Amulet (+all stats)
- **Equipment system** — Equip weapons, armor, and accessories for stat bonuses

### World & NPCs
- **2 expansive maps:**
  - **Aetheria Village** (32×26 tiles) — Shops, NPCs, homes, lake, forests
  - **Ember Caverns** (32×30 tiles) — Dungeon with lava, enemies, boss chamber
- **5 unique NPCs:** Elder Aldric, Elara the Shopkeeper, Korrin the Smith, Aether Core (AI bot), Captain Voss
- **Undertale-inspired dialog system** — Character-by-character text reveal with speaker portraits

### Battle System
- **8 enemy types:** Green Slime, Shadow Bat, Skeleton Knight, Fire Spirit, Stone Golem, Dark Mage, Crystal Guardian, Elder Dragon
- **4 battle actions:** Attack, Magic (costs MP), Item (use potions), Flee
- **Buff system** — Strength and Defense elixirs with duration
- **Random item drops** — Chance to find items after battle
- **Victory rewards** — Gold and EXP on defeat

### Visual Polish
- **48×48 pixel art** — All sprites generated programmatically (no external assets!)
- **Particle effects** — Gold collection sparkles, portal swirls, footstep dust
- **Screen shake** — Impact feedback during battles and chest opening
- **Animated tiles** — Water waves, lava flow, portal energy, floating gold coins
- **Day/night cycle** — Subtle ambient lighting changes
- **Loading screen** — Themed loading sequence with progress bar

### AI Integration (Optional)
- **Powered by Xiaomi MiMo** — Connect your API key for enhanced gameplay
- **AI NPC Dialogs** — NPCs respond intelligently based on your progress
- **Battle Commentary** — Dynamic AI narrator during combat
- **Free tokens available** at [100t.xiaomimimo.com](https://100t.xiaomimimo.com/)
- **Works fully without API key** — All features have offline fallbacks

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| `WASD` / `Arrow Keys` | Move |
| `E` / `Space` | Interact / Confirm |
| `B` | Open Shop (near merchant) |
| `I` | Open Inventory |
| `ESC` | Pause Menu |
| `P` | MiMo API Settings |
| `1` | Battle: Attack |
| `2` | Battle: Magic |
| `3` | Battle: Use Item |
| `4` | Battle: Flee |

---

## 🚀 Getting Started

### Play Locally
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/realm-of-aetheria.git
cd realm-of-aetheria

# Open in browser (no build step needed!)
open index.html
# or
python3 -m http.server 8000
# then visit http://localhost:8000
```

### Deploy
The game is fully static (HTML + JS only) and can be deployed to any static hosting:
- **GitHub Pages** — Push to `gh-pages` branch
- **Netlify / Vercel** — Drag and drop the folder
- **Any web server** — Just serve the files

---

## 🔑 MiMo AI Setup (Optional)

1. Visit [100t.xiaomimimo.com](https://100t.xiaomimimo.com/) to get free API tokens
2. Register at [platform.xiaomimimo.com](https://platform.xiaomimimo.com/)
3. Get your API key
4. In-game: Press `P` or go to Settings → MiMo AI Enhancement
5. Enter your API key — NPCs will now use AI-powered dialogs!

---

## 📁 Project Structure

```
realm-of-aetheria/
├── index.html      # Main HTML file with styles
├── game.js         # Complete game engine (~1500 lines)
└── README.md       # This file
```

### Technical Highlights
- **Zero dependencies** — Pure vanilla HTML5 Canvas + JavaScript
- **Programmatic pixel art** — All sprites drawn with code (no image files)
- **Tile-based engine** — Custom map system with collision detection
- **State machine** — Clean game state management (menu, playing, battle, dialog, shop, inventory)
- **Save system** — Full game state serialization to localStorage

---

## 🗺️ Roadmap (Planned Features)

- [ ] Sound effects & background music
- [ ] More maps (Forest, Desert, Ice Cave)
- [ ] Quest system with NPC missions
- [ ] Character classes (Warrior, Mage, Rogue)
- [ ] Minimap overlay
- [ ] Story intro cutscene
- [ ] Achievement system
- [ ] Mobile touch controls

---

## 🤖 AI Integration Details

This game integrates with the [Xiaomi MiMo API](https://platform.xiaomimimo.com/) for optional AI-powered features:

- **Model:** MiMo V2.5 (flagship reasoning model)
- **Use Cases:** NPC dialog generation, battle commentary
- **Endpoint:** `https://api.xiaomimimo.com/v1/chat/completions`
- **Free Tokens:** Available through the [100T Token Creator Program](https://100t.xiaomimimo.com/)

The API key is **completely optional** — all game features work without it using pre-written dialog and content.

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Credits

- Game Design & Development: Built with AI assistance
- AI Technology: [Xiaomi MiMo](https://mimo.xiaomi.com/)
- API Platform: [Xiaomi MiMo API](https://platform.xiaomimimo.com/)
- Free Token Program: [100t.xiaomimimo.com](https://100t.xiaomimimo.com/)

---

**Beta 0.0.2.8 — Still Under Development**

*Powered by Xiaomi MiMo AI | [100t.xiaomimimo.com](https://100t.xiaomimimo.com/)*
