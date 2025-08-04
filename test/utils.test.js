const { filterExpensiveInStock, countByCategory, topNByPrice } = require('../utils');

const sample = [
  { productName: 'A', price: 200, category: 'Tech', inStock: true },
  { productName: 'B', price: 80, category: 'Tech', inStock: true },
  { productName: 'C', price: 150, category: 'Home', inStock: false },
  { productName: 'D', price: 500, category: 'Home', inStock: true },
];

test('filterExpensiveInStock filters by price and stock', () => {
  const result = filterExpensiveInStock(sample, 100);
  expect(result.length).toBe(2);
  expect(result.map(p => p.productName)).toEqual(['A', 'D']);
});

test('countByCategory counts correctly', () => {
  const result = countByCategory(sample);
  expect(result).toEqual({ Tech: 2, Home: 2 });
});

test('topNByPrice returns top N sorted products', () => {
  const result = topNByPrice(sample, 2);
  expect(result.map(p => p.productName)).toEqual(['D', 'A']);
});
