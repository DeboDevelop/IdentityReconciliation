#!/bin/bash

# Function to check if PostgreSQL is installed
check_postgresql() {
  if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
  fi
}

# Function to create user and database
create_user_and_database() {
  echo "Creating user and database..."
  sudo -u postgres psql -c "CREATE USER your_username WITH PASSWORD 'your_password';"
  sudo -u postgres psql -c "CREATE DATABASE your_database OWNER your_username;"
}

# Function to grant privileges to the user
grant_privileges() {
  echo "Granting privileges to the user..."
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE your_database TO your_username;"
}

# Function to create the contract table
create_contract_table() {
  echo "Creating the contract table..."
  sudo -u postgres psql -d your_database -c "
    CREATE TYPE Precedence AS ENUM ('primary', 'secondary');"
  sudo -u postgres psql -d your_database -c "
    CREATE TABLE Contract (
      id SERIAL PRIMARY KEY,
      phone_number VARCHAR,
      email VARCHAR,
      linked_id INT REFERENCES Contract(id),
      link_precedence Precedence,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );"
}

# Main function to create user, database, grant privilege, and create the contract table
main() {
  check_postgresql
  if create_user_and_database; then  
    if grant_privileges; then
      if create_contract_table; then
        echo "User, database, and table have been created successfully."
      else
        echo "Error Occured while creating table"
      fi
    else
      echo "Error Occured while granting privileges"
    fi
  else
    echo "Error Occured while creating user and database"
  fi
}

# Call the main function
main
