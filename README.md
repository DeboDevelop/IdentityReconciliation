# IdentityReconciliation

IdentityReconciliation is a REST API created using Typescript and PostgreSQL. It provides a solution for identity reconciliation, addressing the [assignment](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199) given by BiteSpeed. The deployed solution can be accessed [here](https://identity-reconciliation-1dkb.onrender.com).

## Features

-   Implemented using a Service-Oriented Architecture.
-   Includes unit tests using Mocha, Chai, and Supertest.
-   Integrated logging for better debugging.
-   Provides a script to create the required PostgreSQL tables.
-   Performs input validation using Joi.
-   Ensures a graceful server shutdown process.
-   Includes a 404 Not Found route for unmatched endpoints.
-   Offers Swagger UI documentation.

## How to Use

1. Clone this repository.
2. Create a `.env` file in the root folder:

    ```
    touch .env
    ```

3. Edit the `.env` file and add the following environment variables:

    ```
    PORT=3000
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    DB_NAME=your_database
    DB_NAME_TEST=your_database_test
    DB_HOST_NAME=localhost
    ```

4. Run `npm i` to install the required dependencies.
5. Execute `npm test` to run unit tests.
6. Start the development server using `npm run dev`.
7. Alternatively, you can compile TypeScript into JavaScript using `npm run build`, and then start the production server with `npm start`.

## Algorithm for the Given Problem Statement

1. Sanitize the email and phoneNumber parameters. If both are null, the process ends.
2. Query the contract table using the provided email and phone number.
3. If the query result is empty, create a new primary contract when both email and phoneNumber are included in the request.
4. Process and format the data to the desired output structure, then return it.
5. If the query result is not empty:
    - Identify the primary contracts. The contract or parent contract with the lowest ID becomes the primary. Any other primary with a higher ID becomes a secondary.
    - Determine if the Email or PhoneNumber is new information.
6. If primaryLowPrec exists:
    - Convert primaryLowPrec into a secondary contract.
    - Update the linkedId of primaryLowPrec's secondary contract.
7. If either missingEmail or missingPhone is true, create a secondary contract with the missing data.
8. Query the database again with primaryContactId as there might be missing data.
9. Process the query result and organize it into the output structure. The first element will be the primary contact due to sorting by ID. The remaining elements will be secondary contacts.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

[Your Name]
