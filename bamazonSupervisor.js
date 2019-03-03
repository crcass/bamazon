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