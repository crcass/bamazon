USE bamazon;

DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50),
    over_head_costs DECIMAL(12, 2),
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ('electronics', 10000);

INSERT INTO departments (department_name, over_head_costs)
VALUES ('food', 800);

INSERT INTO departments (department_name, over_head_costs)
VALUES ('pets', 400);

INSERT INTO departments (department_name, over_head_costs)
VALUES('books', 250);