# bal-int-project-challenge
==================

A Node.js CLI application that parses a CSV file of product data, applies filtering and grouping logic, sorts products by price, and generates summary reports in multiple formats: console output, plain text and JSON.

------------------------
FEATURES
------------------------
- Parses a products.csv file containing product data
- Filters in-stock products above a configurable price
- Groups and counts products by category
- Sorts and displays the top-N most expensive products
- Generates summary reports in multiple format:
  * Console output (with table)
  * Plain text file (summary_report.txt)
  * JSON file (summary_report.json)
- Includes unit tests using Jest
- Handles errors from missing files or malformed data
- Supports CLI arguments for customization

------------------------
PROJECT STRUCTURE
------------------------
bal-int-project-challenge/
├── index.js                # Main 
├── utils.js                # Data filtering, sorting, and grouping
├── products.csv            # Sample CSV input file
├──reports
    ├── summary_report.txt  # Auto-generated report (text)
    ├── summary_report.json # Auto-generated report (JSON)
├── test/
│   └── utils.test.js       # Unit tests
├── package.json
├── package-lock.json
├── malformed_rows.log.     # Log of malformed/skipped rows
└── README.md

------------------------
CSV FORMAT
------------------------
products.csv should look like this:

ProductName,Price,Category,InStock
Laptop,1500,Electronics,true
Keyboard,50,Electronics,true
Coffee Mug,12,Home,false
Chair,80,Furniture,true
Monitor,220,Electronics,true
InvalidRow1,,Furniture,true
Table,abc,Furniture,false
Pen,10,,yes


------------------------
GETTING STARTED
------------------------

1. Clone the repository:
   git clone https://github.com/AntonVNTR/bal-int-project-challenge.git
   cd bal-int-project-challenge

2. Install dependencies:
   npm install

3. Run the project:
   node index.js     				                  # default
   node index.js --minPrice 100 --top 5		  # with CLI arguments

4. Run unit tests:
   npm test 					  # uses jest

------------------------
CLI OPTIONS
------------------------

--minPrice   Minimum price threshold to include (default: 0)
--top        Number of top expensive products to show (default: 5)

------------------------
SAMPLE CONSOLE OUTPUT
------------------------
Sample output should look like this:

In-stock products > 0:
┌──────────────┬───────┐
│ Product Name │ Price │
├──────────────┼───────┤
│ Laptop       │ 1500  │
├──────────────┼───────┤
│ Keyboard     │ 50    │
├──────────────┼───────┤
│ Chair        │ 80    │
├──────────────┼───────┤
│ Monitor      │ 220   │
└──────────────┴───────┘

Products per category:

┌─────────────┬───────┐
│ Category    │ Count │
├─────────────┼───────┤
│ Electronics │ 3     │
├─────────────┼───────┤
│ Home        │ 1     │
├─────────────┼───────┤
│ Furniture   │ 1     │
└─────────────┴───────┘

Top 5 most expensive products:

┌──────────────┬───────┐
│ Product Name │ Price │
├──────────────┼───────┤
│ Laptop       │ 1500  │
├──────────────┼───────┤
│ Monitor      │ 220   │
├──────────────┼───────┤
│ Chair        │ 80    │
├──────────────┼───────┤
│ Keyboard     │ 50    │
├──────────────┼───────┤
│ Coffee Mug   │ 12    │
└──────────────┴───────┘

Reports saved:
- summary_report.txt
- summary_report.json

------------------------
TESTING
------------------------

Uses Jest for unit testing:

npm test

Tests include:
- In-stock and price filtering
- Category grouping
- Price sorting

------------------------
ERROR HANDLING
------------------------

- Invalid CSV format: Skips malformed rows with warnings
- Missing CSV file: Displays error message
- Invalid CLI input: Handles invalid CLI arguments

------------------------
FUTURE IMPROVEMENTS
------------------------

-Export summary report to more formats (e.g., PDF or Excel)
