const fs = require('fs');
const csv = require('csv-parser');
const Table = require('cli-table3');

const products = [];
const malformedRows = [];

// Function to display console tables
function printTable(title, data, headers) {
  console.log(`\n📊 ${title}`);
  const table = new Table({ head: headers });
  data.forEach(row => table.push(row));
  console.log(table.toString());
}

// Filter: In-stock & price > 100
function filterExpensiveInStock(products) {
  return products.filter(p => p.inStock && p.price > 100);
}

// Group by category
function countByCategory(products) {
  const categoryCount = {};
  for (const p of products) {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  }
  return categoryCount;
}

// Sort by price and take top 5
function top5ByPrice(products) {
  return [...products].sort((a, b) => b.price - a.price).slice(0, 5);
}

// Generate summary report (text)
function generateTextReport(filtered, categoryCount, top5, malformedRows) {
  let report = `=== Product Summary Report ===\n\n`;

  report += `📌 In-stock products > 100:\n`;
  filtered.forEach(p => {
    report += `- ${p.productName} (${p.price})\n`;
  });

  report += `\n📦 Products per category:\n`;
  for (const [category, count] of Object.entries(categoryCount)) {
    report += `- ${category}: ${count}\n`;
  }

  report += `\n💰 Top 5 most expensive products:\n`;
  top5.forEach(p => {
    report += `- ${p.productName} (${p.price})\n`;
  });

  if (malformedRows.length > 0) {
    report += `\n⚠️ Skipped ${malformedRows.length} malformed row(s). See malformed_rows.log\n`;
  }

  return report;
}

// Start processing CSV
fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    try {
      const productName = row.ProductName?.trim();
      const price = parseFloat(row.Price);
      const category = row.Category?.trim();
      const inStockRaw = row.InStock?.toLowerCase();
      const inStock = inStockRaw === 'true';

      // Validate fields
      if (!productName || isNaN(price) || !category || (inStockRaw !== 'true' && inStockRaw !== 'false')) {
        throw new Error('Invalid or missing field');
      }

      products.push({ productName, price, category, inStock });
    } catch (err) {
      malformedRows.push({ row, reason: err.message });
    }
  })
  .on('end', () => {
    if (products.length === 0) {
      console.error('❌ No valid products found. Check your CSV file.');
      return;
    }

    console.log('✅ CSV loaded successfully');

    const filtered = filterExpensiveInStock(products);
    const categoryCount = countByCategory(products);
    const top5 = top5ByPrice(products);

    // Table: Filtered products
    printTable('In-stock Products > 100', filtered.map(p => [p.productName, p.price]), ['Product', 'Price']);

    // Table: Category counts
    printTable('Product Count per Category', Object.entries(categoryCount), ['Category', 'Count']);

    // Table: Top 5 expensive
    printTable('Top 5 Most Expensive Products', top5.map(p => [p.productName, p.price]), ['Product', 'Price']);

    // Generate and save summary report
    const report = generateTextReport(filtered, categoryCount, top5, malformedRows);
    console.log('\n📝 Summary Report:\n');
    console.log(report);
    fs.writeFileSync('summary_report.txt', report);
    console.log('📁 Report saved to summary_report.txt');

    // Write malformed rows if any
    if (malformedRows.length > 0) {
      const bad = malformedRows.map((item, i) => {
        return `#${i + 1} Reason: ${item.reason}\nRow: ${JSON.stringify(item.row)}\n`;
      }).join('\n');
      fs.writeFileSync('malformed_rows.log', bad);
      console.warn(`⚠️ ${malformedRows.length} malformed row(s) skipped. See malformed_rows.log`);
    }
  })
  .on('error', (err) => {
    console.error(`❌ Failed to read CSV: ${err.message}`);
  });
