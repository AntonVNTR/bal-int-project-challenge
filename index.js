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

// Read and parse CSV file
fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    try {
      // Validate and transform row
      const price = parseFloat(row.Price);
      const inStock = row.InStock.toLowerCase() === 'true';

      if (!row.ProductName || isNaN(price) || !row.Category) {
        throw new Error('Invalid row format');
      }

      // Push valid row into products array
      products.push({
        ProductName: row.ProductName,
        Price: price,
        Category: row.Category,
        InStock: inStock,
      });
    } catch (error) {
      console.warn('⚠️ Skipping malformed row:', row);
    }
  })
  .on('end', () => {
    console.log('✅ CSV successfully loaded.\n');

    // Filter products based on in-stock and minimum price
    const filtered = products.filter(
      (p) => p.InStock && p.Price > argv.minPrice
    );

    // Count number of products per category
    const categoryCounts = {};
    for (const product of products) {
      categoryCounts[product.Category] =
        (categoryCounts[product.Category] || 0) + 1;
    }

    // Sort products by price in descending order and take top-N
    const topN = [...products]
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

    // Create a plain-text summary
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

    // Save to text file
    fs.writeFileSync('summary_report.txt', textReport);

    // Save to JSON file
    fs.writeFileSync(
      'summary_report.json',
      JSON.stringify({
        filteredProducts: filtered,
        categoryCounts,
        topExpensive: topN,
      }, null, 2)
    );

    // Save to HTML file
    const htmlContent = `
      <html>
      <head><title>Product Summary Report</title></head>
      <body>
        <h1>Product Summary Report</h1>
        <h2>In-stock products > ${argv.minPrice}</h2>
        <ul>${filtered.map((p) => `<li>${p.ProductName} (${p.Price})</li>`).join('')}</ul>
        <h2>Products per category</h2>
        <ul>${Object.entries(categoryCounts).map(([cat, count]) => `<li>${cat}: ${count}</li>`).join('')}</ul>
        <h2>Top ${argv.top} Most Expensive Products</h2>
        <ul>${topN.map((p) => `<li>${p.ProductName} (${p.Price})</li>`).join('')}</ul>
      </body>
      </html>
    `;
    fs.writeFileSync('summary_report.html', htmlContent);

    console.log('\n📁 Reports saved:');
    console.log('- summary_report.txt');
    console.log('- summary_report.json');
    console.log('- summary_report.html');
  })
  .on('error', (err) => {
    console.error('❌ Error reading CSV file:', err.message);
  });
