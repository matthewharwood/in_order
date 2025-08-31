import { 
  generateRandomNumbers, 
  generateFiveRandomNumbers,
  fiveNumberGenerator 
} from './utils/randomNumbers.js';
import { NumberCard } from './components/NumberCard.js';
import { NumberCardContainer } from './components/NumberCardContainer.js';
import { GameSettings } from './components/GameSettings.js';

export default function init() {
  console.log('App initialized with ESM modules');
  
  const containers = document.querySelectorAll('number-card-container');
  containers.forEach(container => {
    const totalCards = parseInt(container.getAttribute('total-cards')) || 5;
    const numbers = generateRandomNumbers(totalCards, 0, 100);
    container.setNumbers(numbers);
  });
  
  console.log('10 random numbers (1-50):', generateRandomNumbers(10, 1, 50));
  
  console.log('5 random numbers (0-100):', generateFiveRandomNumbers());
  
  console.log('Using higher-order function:', fiveNumberGenerator());
  
  console.log('Custom params with HOF:', fiveNumberGenerator(3, 10, 20));
}

document.addEventListener('DOMContentLoaded', init);