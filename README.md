# exabloom-test-backend
## System Setup
1. Clone the Github repository.
```
https://github.com/BenedTj/exabloom-test-backend
``` 
3. Enter the following into the command line.
```
psql -U postgres -h localhost -p 5432
```
3. Enter the password for your `postgres` user.
4. Enter the following commands.
~~~~sql
CREATE DATABASE backend;
\c backend
\q
~~~~
5. Navigate to `src/db.js` and replace the following with the password for your `postgres` user.
```javascript
const pool = new Pool({
    user: "postgres",
    password: [REPLACED WITH YOUR PASSWORD],
    host: "localhost",
    port: "5432",
    database: "backend"
});
```
6. Enter the following commands into the command line.
```
npm install
```
7. To populate the database, enter the following.
```
npm run populate
```
8. To execute the app, enter the following.
```
npm run start
```

## System Requirements
1. resetPage() allows the user to reset pagination settings.
2. nextPage() allows the user to go to the next page.
3. retrieveRecentConversations(pageSize) allows the user to retrieve the next pageSize fields (i.e. for the requirements of the test, retrieveRecentConversations(50)).
4. searchConversations(pageSize, searchValue) allows the user to retrieve the next pageSize methods with the constraints of searchValue to filter (i.e. for the requirements of the test, searchConversations(50, searchValue)).

## Assumptions Made
The only assumption made that might affect the accuracy of the query is:
1. The phone_number field of table CONTACTS and contact_phone_number field of table CONVERSATIONS include the country code of the phone number.
2. When we run the queries, we expect to receive the name of the contact the message is associated, the content of the message and the date when the message was created.
3. The created_at and updated_at fields of the CONTACTS table is not null.
4. The searchConversations(pageSize, searchValue) function resets pagination settings to initial state when a new searchValue is passed in a subsequent call of the function.

## Design Decisions Made
1. Contrary to the database schema provided, a field contact_name was added to the table CONTACTS to store the name of the contact, which is used in the filter query.
2. A table CONVERSATIONS was added to store the contact id and id of the last message sent. The data from the fields contact_name and phone_number in the table CONTACTS as well as data from the fields content, created_at in the table MESSAGES were stored in the table CONVERSATIONS for efficiency of the query that is ensured by only querying on one table.
3. A clustered index on the field created_at of the table CONVERSATIONS was created to physically order the records by descending order of dates. This optimizes the query by avoiding the 'ORDER BY' command in the SQL query.
4. Non-clustered indices on the fields content, contact_name and contact_phone_number were created to optimize the filtering query.
5. Multi-value insertion in batches was utilized in the database population script to optimize the insertion of large amounts of records. Otherwise, a heap overflow would occur.
6. Keyset pagination was implemented in the queries to efficiently implement the pagination feature. By using a 'WHERE' SQL command instead of the more inefficient 'OFFSET' command, I have increased the efficiency of the query.
