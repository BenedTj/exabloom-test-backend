// Import from db.js.
const pool = require("./db");

// Create the class Queries.
class Queries {
    // Create object and initialize object properties.
    constructor() {
        // firstDateAfter stores the date to be used as a constraint after calling nextPage().
        this.firstDateAfter = null;
        // latestDate stores the date to be used as a constraint in the keyset pagination.
        this.latestDate = null;
        /* previousSearchValue stores the previous searchValue variable
        * in the latest calling of the function searchConversations.
        */
        this.previousSearchValue = null;
    }

    // Reset pagination filters.
    resetSearch() {
        this.firstDateAfter = null;
        this.latestDate = null;
        this.previousSearchValue = null;
    };

    // Find next page during next select query.
    nextPage() {
        if (this.firstDateAfter) {
            this.latestDate = this.firstDateAfter;
        }
    }

    // This function retrieves the most recent pageSize conversations.
    async retrieveRecentConversations(pageSize) {
        try {
            let filterValues = [];
            let filterParams = [];
            let paramCounter = 1;

            // If latestDate is not null, create constraint to implement keyset pagination.
            if (this.latestDate) {
                filterValues.push(`created_at < $${paramCounter}`);
                filterParams.push(new Date(this.latestDate));
                paramCounter++;
            }

            // Perform select query.
           const res = await pool.query(`
                SELECT contact_name, created_at, content
                FROM CONVERSATIONS
                ${filterValues.length > 0 ? `WHERE ${filterValues.join(" AND ")}` : ""}
                LIMIT $${paramCounter}
                `, [...filterParams, pageSize]);
            const rows = res.rows;
            if (rows.length < pageSize) {
                this.firstDateAfter = null;
            } else {
                this.firstDateAfter = rows[pageSize - 1].created_at;
            }

            // Return results as rows.
            return rows;
        } catch (error) {
            // Send an error message and throw an error.
            console.error("Error retrieving recent conversations:", error);
            throw error;
        }
    }

    /* This function retrieves the most recent pageSize conversations
    * with the constraints within the searchValue parameter.
    */
    async searchConversations(pageSize, searchValue) {
        const { MessageContent, ContactName, ContactPhoneNumber } = searchValue;
        if (searchValue !== this.previousSearchValue) {
            this.resetSearch();
        }
        this.previousSearchValue = searchValue;

        try {
            let filterValues = [];
            let filterParams = [];
            let paramCounter = 1;

            /* Create filters in query based on searchValue.
            * The value of null indicates that the field is not filtered.
            */
            if (MessageContent) {
                filterValues.push(`content LIKE $${paramCounter}`);
                filterParams.push(`%${MessageContent}%`);
                paramCounter++;
            }
            if (ContactName) {
                filterValues.push(`contact_name LIKE $${paramCounter}`);
                filterParams.push(`%${ContactName}%`);
                paramCounter++;
            }
            if (ContactPhoneNumber) {
                filterValues.push(`contact_phone_number LIKE $${paramCounter}`);
                filterParams.push(`${ContactPhoneNumber}%`);
                paramCounter++;
            }

            // If latestDate is not null, create constraint to implement keyset pagination.
            if (this.latestDate) {
                filterValues.push(`created_at < $${paramCounter}`);
                filterParams.push(this.latestDate);
                paramCounter++;
            }

            // Perform select query.
            const res = await pool.query(`
                SELECT contact_name, created_at, content
                FROM CONVERSATIONS
                ${filterValues.length > 0 ? `WHERE ${filterValues.join(" AND ")}` : ""}
                LIMIT $${paramCounter}
                `, [...filterParams, pageSize]);
            const rows = res.rows;
            if (rows.length < pageSize) {
                this.firstDateAfter = null;
            } else {
                this.firstDateAfter = rows[pageSize - 1].created_at;
            }

            // Return results as rows.
            return rows;
        } catch (error) {
            // Send an error message and throw an error.
            console.error("Error searching conversations:", error);
            throw error;
        }
    }
}

// Create a single object of class Queries and export it.
const queries = new Queries();
module.exports = queries;