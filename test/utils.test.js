const { filterExpensiveInStock, countByCategory, topNByPrice } = require('../utils');

const product = [
  { productName: 'Laptop', price: 1500, category: 'Tech', inStock: true },
  { productName: 'Keyboard', price: 50, category: 'Tech', inStock: true },
  { productName: 'Coffee', price: 12, category: 'Home', inStock: false },
  { productName: 'Chair', price: 80, category: 'Home', inStock: true },
  { productName: 'Monitor', price: 220, category: 'Home', inStock: true },
];

test('filterExpensiveInStock filters by price and stock', () => {
  const result = filterExpensiveInStock(product, 100);
  expect(result.length).toBe(2);
  expect(result.map(p => p.productName)).toEqual(['A', 'D']);
});

test('countByCategory counts correctly', () => {
  const result = countByCategory(product);
  expect(result).toEqual({ Tech: 2, Home: 2 });
});

test('topNByPrice returns top N sorted products', () => {
  const result = topNByPrice(product, 2);
  expect(result.map(p => p.productName)).toEqual(['D', 'A']);
});
