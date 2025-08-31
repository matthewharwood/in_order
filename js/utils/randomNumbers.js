export function generateRandomNumbers(n, start, end) {
  const numbers = [];
  for (let i = 0; i < n; i++) {
    numbers.push(Math.floor(Math.random() * (end - start + 1)) + start);
  }
  return numbers;
}

export const generateFiveRandomNumbers = () => generateRandomNumbers(5, 0, 100);

export function createRandomNumberGenerator(defaultN, defaultStart, defaultEnd) {
  return (n = defaultN, start = defaultStart, end = defaultEnd) => {
    return generateRandomNumbers(n, start, end);
  };
}

export const fiveNumberGenerator = createRandomNumberGenerator(5, 0, 100);