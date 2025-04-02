# exabloom-test-backend
## System Setup
1. Clone the Github repository.
```
https://github.com/BenedTj/exabloom-test-backend
``` 
3. Enter the following into your command line.
```
psql -U postgres -h localhost -p 5432
```
3. Enter the password for your `postgres` user.
4. Enter the following commands.
~~~~sql
CREATE DATABASE backend;
\c backend
CREATE TABLE CONTACTS (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
CREATE TABLE MESSAGES (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES CONTACTS(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
~~~~
