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
  console.clear();
  console.log(chalk.bold('Welome to Bamazon Management Console'));
  manageProducts();
});

const manageProducts = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Please choose an option',
        choices: [
          'View Products for Sale',
          'View Low Inventory',
          'Add to Inventory',
          'Add New Product',
          'Exit'
        ],
        name: 'choice'
      }
    ])
    .then(answer => {
      switch (answer.choice) {
        case 'View Products for Sale':
          viewProducts();
          break;
        case 'View Low Inventory':
          viewLowInventory();
          break;
        case 'Add to Inventory':
          chooseProduct();
          break;
        case 'Add New Product':
          newItem();
          break;
        default:
          console.log(
            chalk.cyan.bold('Thank you for using Bamazon Management Console')
          );
          connection.end();
      }
    });
};

const viewProducts = () => {
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
      manageProducts();
    }
  );
};

const viewLowInventory = () => {
  connection.query(
    'SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE stock_quantity < 5',
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
      console.clear();
      console.log(table(data));
      manageProducts();
    }
  );
};

const chooseProduct = () => {
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
      inquirer
        .prompt([
          {
            type: 'input',
            message: 'Please enter the ID of the item you would like to update',
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
            `SELECT product_name, price, stock_quantity FROM products WHERE ?`,
            {
              item_id: answers.item_id
            },
            (err, res) => {
              if (err) throw err;
              userChoice = [
                res[0].product_name,
                dollar.format(res[0].price),
                answers.quantity
              ];
              data = [
                [
                  chalk.bold('PRODUCT NAME'),
                  chalk.bold('PRICE'),
                  chalk.bold('QUANTITY')
                ],
                userChoice
              ];
              console.clear();
              console.log(table(data));
              inquirer
                .prompt([
                  {
                    type: 'confirm',
                    message: 'Update this item?',
                    name: 'confirm'
                  }
                ])
                .then(ans => {
                  if (ans.confirm) {
                    updateInventory(
                      res[0].stock_quantity,
                      answers.quantity,
                      res[0].product_name
                    );
                  } else {
                    manageProducts();
                  }
                });
            }
          );
        });
    }
  );
};

const updateInventory = (stock, userQuantity, product) => {
  connection.query(
    `UPDATE products SET stock_quantity = stock_quantity + ${userQuantity} WHERE ?`,
    {
      product_name: product
    },
    (err, res) => {
      if (err) throw err;
      connection.query(
        'SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?',
        {
          product_name: product
        },
        (err, res) => {
          updated = [
            res[0].product_name,
            dollar.format(res[0].price),
            res[0].stock_quantity
          ];
          data = [
            [
              chalk.bold('PRODUCT NAME'),
              chalk.bold('PRICE'),
              chalk.bold('QUANTITY')
            ],
            updated
          ];
          console.clear();
          console.log(table(data));
          console.log(chalk.green.bold('Update Successful!\n'));
          manageProducts();
        }
      );
    }
  );
};

const newItem = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter item name',
        name: 'product_name'
      },
      {
        type: 'input',
        message: 'Enter department name',
        name: 'department_name'
      },
      {
        type: 'input',
        message: 'Enter price',
        name: 'price'
      },
      {
        type: 'input',
        message: 'Enter stock quantity',
        name: 'stock_quantity'
      }
    ])
    .then(answers => {
      newInventory = [
        answers.product_name,
        answers.department_name,
        dollar.format(answers.price),
        answers.stock_quantity
      ];
      data = [
        [
          chalk.bold('PRODUCT NAME'),
          chalk.bold('DEPARTMENT'),
          chalk.bold('PRICE'),
          chalk.bold('QUANTITY')
        ],
        newInventory
      ];
      console.clear();
      console.log(table(data));
      inquirer
        .prompt([
          {
            type: 'confirm',
            message: 'Add this item to inventory?',
            name: 'confirm'
          }
        ])
        .then(ans => {
          if (ans.confirm) {
            connection.query(
              'INSERT INTO products SET ?',
              {
                product_name: answers.product_name,
                department_name: answers.department_name,
                price: answers.price,
                stock_quantity: answers.stock_quantity
              },
              (err, res) => {
                console.log(chalk.cyan.bold('Product Added!'));
                manageProducts();
              }
            );
          } else {
            manageProducts();
          }
        });
    });
};
