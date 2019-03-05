use bamazon;

-- SELECT department_name, SUM(product_sales) AS product_sales FROM products GROUP BY department_name;

-- SELECT department_name, SUM(product_sales) AS product_sales FROM products GROUP BY department_name WITH ROLLUP;

-- SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.product_sales FROM departments LEFT JOIN products ON departments.department_name = products.department_name;

SELECT department_id, departments.department_name, over_head_costs, SUM(products.product_sales) AS product_sales, over_head_costs - SUM(products.product_sales) AS total_profit FROM departments LEFT JOIN products ON departments.department_name = products.department_name GROUP BY department_id, department_name, over_head_costs;
