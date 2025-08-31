# Order Game

A fun drag-and-drop number ordering game built with Web Components and vanilla JavaScript.

## Features

- 🎮 Drag and drop number cards to order them
- 📱 Touch support for mobile devices
- 🎨 Dark/Light theme toggle
- 💰 Coin reward system
- 🎵 Sound effects on winning
- 💾 Auto-save game state
- ⚡ Built with Web Components

## Play Online

Visit the game at: https://[your-username].github.io/in_order/

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Deployment

The game automatically deploys to GitHub Pages when you push to the main branch.

### Manual Deployment Setup

1. Go to your repository Settings
2. Navigate to Pages section
3. Under "Build and deployment", select "GitHub Actions"
4. Push to main branch to trigger deployment

## Technologies

- Web Components
- ESM Modules
- Webpack
- IndexedDB for state persistence
- Anime.js for animations

## Game Rules

1. Drag and drop cards to arrange them in order
2. Ascending mode: Arrange from lowest to highest
3. Descending mode: Arrange from highest to lowest
4. Earn 10 coins for each successful ordering
5. Completed containers automatically create new challenges

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with touch support

## License

MIT