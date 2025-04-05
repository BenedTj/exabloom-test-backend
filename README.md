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
npm run populate
```
