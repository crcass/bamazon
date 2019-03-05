require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const { table } = require('table');
const chalk = require('chalk');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.PASSWORD,
  database: 'bamazon'
});

const dollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

connection.connect(err => {
  if (err) throw err;
  displayProducts();
});

const displayProducts = () => {
  console.log(
    chalk.bold('\n                     *** Welcome to Bamazon! ***\n')
  );
  connection.query(
    'SELECT item_id, product_name, department_name, price, stock_quantity FROM products',
    (err, res) => {
      if (err) throw err;
      data = [
        [
          chalk.bold('ID'),
          chalk.bold('PRODUCT NAME'),
          chalk.bold('DEPARTMENT'),
          chalk.bold('PRICE'),
          chalk.bold('QUANTITY')
        ]
      ];
      res.forEach(item => {
        data.push([
          item.item_id,
          item.product_name,
          item.department_name,
          dollar.format(item.price),
          item.stock_quantity
        ]);
      });
      console.log(table(data));
      chooseProduct();
    }
  );
};

const chooseProduct = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Please enter the ID of the item you would like to purchase',
        name: 'item_id'
      },
      {
        type: 'input',
        message: 'Please enter quantity',
        name: 'quantity'
      }
    ])
    .then(answers => {
      connection.query(
        `SELECT product_name, price, stock_quantity, product_sales FROM products WHERE ?`,
        {
          item_id: answers.item_id
        },
        (err, res) => {
          if (err) throw err;
          userChoice = [
            res[0].product_name,
            dollar.format(res[0].price),
            answers.quantity,
            dollar.format(res[0].price * parseInt(answers.quantity))
          ];
          data = [
            [
              chalk.bold('PRODUCT NAME'),
              chalk.bold('PRICE'),
              chalk.bold('QUANTITY'),
              chalk.bold('TOTAL')
            ],
            userChoice
          ];
          console.clear();
          console.log(table(data));
          inquirer
            .prompt([
              {
                type: 'confirm',
                message: 'Purchase this item?',
                name: 'confirm'
              }
            ])
            .then(ans => {
              if (ans.confirm) {
                checkOut(
                  res[0].stock_quantity,
                  answers.quantity,
                  res[0].product_name,
                  res[0].price,
                  res[0].product_sales
                );
              } else {
                shopAgain();
              }
            });
        }
      );
    });
};

const checkOut = (stock, userQuantity, product, price, sales) => {
  if (stock < userQuantity) {
    console.clear();
    console.log(table(data));
    console.log(
      `${chalk.red.bold(
        'Insufficient Stock!'
      )} - we only have ${stock} of that item\n`
    );
    shopAgain();
  } else {
    connection.query(
      'UPDATE products SET ? WHERE ?',
      [
        {
          stock_quantity: stock - userQuantity,
          product_sales: sales + (price * userQuantity)
        },
        {
          product_name: product
        }
      ],
      (err, res) => {
        if (err) throw err;
        console.clear();
        console.log(table(data));
        console.log(chalk.green.bold('Purchase Successful!\n'));
        shopAgain();
      }
    );
  }
};

const shopAgain = () => {
  inquirer
    .prompt([
      {
        type: 'confirm',
        message: 'Would you like to continue shopping?',
        name: 'continue'
      }
    ])
    .then(answer => {
      if (answer.continue) {
        displayProducts();
      } else {
        console.clear();
        console.log(chalk.cyan.bold('\nThanks for shopping at Bamazon!\n'));
        connection.end();
      }
    });
};
