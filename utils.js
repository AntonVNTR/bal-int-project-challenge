function filterExpensiveInStock(products, minPrice) {
  return products.filter(p => p.inStock && p.price > minPrice);
}

function countByCategory(products) {
  const categoryCount = {};
  for (const p of products) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }
  return categoryCount;
}

function topNByPrice(products, n) {
  return [...products].sort((a, b) => b.price - a.price).slice(0, n);
}

module.exports = {
  filterExpensiveInStock,
  countByCategory,
  topNByPrice,
};
