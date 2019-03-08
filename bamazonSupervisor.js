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
  console.log(chalk.bold('Welome to Bamazon Supervisor Console'));
  viewOptions();
});

const viewOptions = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Please choose an option',
        choices: [
          'View Product Sales by Department',
          'Create New Department',
          'Exit'
        ],
        name: 'choice'
      }
    ])
    .then(answer => {
      switch (answer.choice) {
        case 'View Product Sales by Department':
          displaySales();
          break;
        case 'Create New Department':
          newDept();
          break;
        default:
        console.clear();
          console.log(
            chalk.cyan.bold('Thank you for using Bamazon Supervisor Console')
          );
          connection.end();
      }
    });
};

const displaySales = () => {
  connection.query(
    'SELECT department_id, departments.department_name, over_head_costs, SUM(products.product_sales) AS product_sales, SUM(products.product_sales) - over_head_costs AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_id, department_name, over_head_costs',
    (err, res) => {
      if (err) throw err;
      data = [
        [
          chalk.bold('ID'),
          chalk.bold('DEPARTMENT'),
          chalk.bold('OVER HEAD COSTS'),
          chalk.bold('PRODUCT SALES'),
          chalk.bold('TOTAL PROFIT')
        ]
      ];
      res.forEach(item => {
        data.push([
          item.department_id,
          item.department_name,
          dollar.format(item.over_head_costs),
          dollar.format(item.product_sales),
          dollar.format(item.total_profit)
        ]);
      });
      console.clear();
      console.log(table(data));
      viewOptions();
    }
  );
};

const newDept = () => {
  console.clear();
  console.log(chalk.bold('Create new department'));
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter department name',
        name: 'department_name'
      },
      {
        type: 'input',
        message: 'Enter over head costs',
        name: 'over_head_costs'
      }
    ])
    .then(answers => {
      newDepartment = [
        answers.department_name,
        dollar.format(answers.over_head_costs)
      ];
      data = [
        [chalk.bold('DEPARTMENT'), chalk.bold('OVER HEAD COSTS')],
        newDepartment
      ];
      console.clear();
      console.log(table(data));
      inquirer
        .prompt([
          {
            type: 'confirm',
            message: 'Create this department?',
            name: 'confirm'
          }
        ])
        .then(ans => {
          if (ans.confirm) {
            connection.query(
              'INSERT INTO departments SET ?',
              {
                department_name: answers.department_name.toLowerCase(),
                over_head_costs: answers.over_head_costs
              },
              (err, res) => {
                if (err) throw err;
                console.log(chalk.cyan.bold('Department Created!'));
                viewOptions();
              }
            );
          } else {
            viewOptions();
          }
        });
    });
};
