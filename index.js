// Import necessary modules
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Table = require('cli-table3'); // For displaying tables in console
const yargs = require('yargs'); // For CLI argument parsing

// Parse CLI arguments (--minPrice and --top)
const argv = yargs
  .option('minPrice', {
    alias: 'm',
    type: 'number',
    default: 0,
    describe: 'Minimum price filter for in-stock products',
  })
  .option('top', {
    alias: 't',
    type: 'number',
    default: 5,
    describe: 'Number of top expensive products to display',
  })
  .help()
  .argv;

// Initialize product array
const products = [];
let skippedCount = 0;

// Read and parse CSV file
fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    try {
      const price = parseFloat(row.Price);
      const inStock = row.InStock.toLowerCase() === 'true';

      if (!row.ProductName || isNaN(price) || !row.Category) {
        throw new Error('Invalid row format');
      }

      products.push({
        ProductName: row.ProductName,
        Price: price,
        Category: row.Category,
        InStock: inStock,
      });
    } catch (error) {
      skippedCount++;
      console.warn('⚠️ Skipping row...  ', skippedCount);
    }
  })
  .on('end', () => {
    console.log('✅ CSV successfully loaded.\n');

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Filter products based on in-stock and minimum price
    const filtered = products.filter(
      (p) => p.InStock && p.Price > argv.minPrice
    );

    // Count products per category (only filtered)
    const categoryCounts = {};
    for (const product of filtered) {
      categoryCounts[product.Category] =
        (categoryCounts[product.Category] || 0) + 1;
    }

    // Top-N most expensive filtered products
    const topN = [...filtered]
      .sort((a, b) => b.Price - a.Price)
      .slice(0, argv.top);

    // Display filtered products in a table
    const filteredTable = new Table({
      head: ['Product Name', 'Price'],
    });
    filtered.forEach((p) => filteredTable.push([p.ProductName, p.Price]));
    console.log(`📌 In-stock products > ${argv.minPrice}:\n`);
    console.log(filteredTable.toString());

    // Display category counts
    const categoryTable = new Table({
      head: ['Category', 'Count'],
    });
    Object.entries(categoryCounts).forEach(([cat, count]) =>
      categoryTable.push([cat, count])
    );
    console.log('\n📦 Products per category:\n');
    console.log(categoryTable.toString());

    // Display top-N most expensive products
    const topTable = new Table({
      head: ['Product Name', 'Price'],
    });
    topN.forEach((p) => topTable.push([p.ProductName, p.Price]));
    console.log(`\n💰 Top ${argv.top} most expensive products:\n`);
    console.log(topTable.toString());

    // Plain-text summary report
    const textReport = [
      `=== Product Summary Report ===\n`,
      `In-stock products > ${argv.minPrice}:`,
      ...filtered.map((p) => `- ${p.ProductName} (${p.Price})`),
      '',
      'Products per category:',
      ...Object.entries(categoryCounts).map(([cat, count]) => `- ${cat}: ${count}`),
      '',
      `Top ${argv.top} Most Expensive Products:`,
      ...topN.map((p) => `- ${p.ProductName} (${p.Price})`),
    ].join('\n');

    // Save reports to files
    fs.writeFileSync(path.join(reportsDir, 'summary_report.txt'), textReport);

    fs.writeFileSync(
      path.join(reportsDir, 'summary_report.json'),
      JSON.stringify({
        filteredProducts: filtered,
        categoryCounts,
        topExpensive: topN,
      }, null, 2)
    );

    // Final log
    console.log('\n Reports saved in /reports directory:');
    console.log('- summary_report.txt');
    console.log('- summary_report.json');
  })
  .on('error', (err) => {
    console.error('❌ Error reading CSV file:', err.message);
  });