// Load Express.js and queries.js
const express = require("express");
const app = express();
const queries = require("./queries");

/* This function generates an HTML table
* containing the query results.
* The function accepts the parameter queryResult
* as the result of a query and returns a string that
* contains HTML for a table displaying the query result.
*/
function generateHTMLTable(queryResult) {
    let table = `<table><tr><th>No.</th><th>contact_name</th><th>created_at</th><th>content</th></tr>`;
    let count = 1;
    queryResult.forEach(row => {
        table += `<tr><td>${count++}.</td><td>${row.contact_name}</td><td>${row.created_at}</td><td>${row.content}</td></tr>`;
    });
    table += "</table>";
    return table;
}

// searchValue parameters
const searchValue = {
    MessageContent: null,
    ContactName: null,
    ContactPhoneNumber: null
}

/* Function to hold all queries to execute.
* The function QueriesToExecute has no parameters
* and returns result of queries as an object.
*/
async function QueriesToExecute() {
    // Queries that want to be executed here.
};

// Function to dictate the backend's GET response on the root URL.
app.get("/", async (req, res) => {
    try {
        // Execute query in QueriesToExecute and display a table showing the results of query.
        const lastResult = await QueriesToExecute();
        res.status(200).send(generateHTMLTable(lastResult));
    } catch (error) {
        // Send error message in case of an error.
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

// The Express.js server is listening
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});