// Import from db.js and the module fs.
const pool = require("./db");
const fs = require("fs");

/* Constants to store settings.
* country_code stores the country code of the phone numbers to be generated.
* number_of_contacts stores the number of records to be generated for the CONTACTS table.
* number_of_messages stores the number of records to be generated for the MESSAGES table.
*/
const country_code = "+65";
const number_of_contacts = 100000;
const number_of_messages = 5000000;

/* This function returns the cleaned content of the CSV file within the path filePath.
* The file path is specified as the string filePath
* and returns the contents of the file as an array of strings.
*/
function parseCSV(filePath) {
    // Loads data from parameter filePath.
    const data = fs.readFileSync(filePath, "utf-8");
    // Split and clean data by trimming quotation marks and whitespaces.
    const cleaned_data = data.split("\n").filter(line => line !== undefined && line !== null && line !== "")
                             .map(line => line.trim())
                             .map(line => line[0] === "\"" ? line.slice(1, line.length - 1).trim() : line)
                             .filter(line => line !== "");
    // Return cleaned data.
    return cleaned_data;
}

/* This function randomly generates a name as a string
* from parameters firstnames and surnames,
* which are arrays of strings storing first names and surnames, respectively.
* By using the first names and surnames stored in the CSV files,
* there are a total of 400 names that can be generated.
*/
function generateName(firstnames, surnames) {
    const firstName = firstnames[Math.floor(Math.random() * firstnames.length)];
    const lastName = surnames[Math.floor(Math.random() * surnames.length)];
    return firstName + " " + lastName;
}

/* This function randomly generates a phone number as a string
* and accepts a parameter countryCode as a string
* to store the country code.
*/
function generatePhoneNumber(countryCode) {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const restDigits = Math.floor(Math.random() * 10000000);
    const phoneNumber = firstDigit * 10000000 + restDigits;
    return countryCode + phoneNumber.toString();
}

/* This function randomly generates a Date object that is after parameter date.
* The parameter date is a timestamp.
*/
function generateTimestampAfter(date) {
    const addMilliseconds = Math.floor(Math.random() * (new Date().getTime() - date));
    const createdDate = new Date(date + addMilliseconds);
    return createdDate;
}

/* This function randomly generates
* an array containing two Date objects.
* The second element of the array should be after the first.
*/
function generateTimestamps() {
    const currentMilliseconds = Math.floor(Math.random() * (new Date().getTime()));
    const createdDate = new Date(currentMilliseconds);
    const updatedDate = new Date(currentMilliseconds + Math.floor(Math.random() * 1000000000));
    return [createdDate, updatedDate];
}

/* This function creates the tables and indices
* of the tables.
*/
async function createTables() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS CONTACTS CASCADE;
            DROP TABLE IF EXISTS MESSAGES CASCADE;
            DROP TABLE IF EXISTS CONVERSATIONS CASCADE;
            -- Create tables CONTACTS, MESSAGES and CONVERSATIONS.
            CREATE TABLE IF NOT EXISTS CONTACTS (
                id SERIAL PRIMARY KEY,
                contact_name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(15) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
            CREATE TABLE IF NOT EXISTS MESSAGES (
                id SERIAL PRIMARY KEY,
                contact_id INT REFERENCES CONTACTS(id),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            );
            CREATE TABLE IF NOT EXISTS CONVERSATIONS (
                contact_id INT REFERENCES CONTACTS(id) PRIMARY KEY,
                last_message_id INT REFERENCES MESSAGES(id),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                contact_phone_number VARCHAR(15) NOT NULL,
                content TEXT NOT NULL
            );
            -- Create clustered index on CONVERSATIONS.created_at.
            CREATE INDEX idx_created_at ON CONVERSATIONS(created_at DESC);
            ALTER TABLE CONVERSATIONS CLUSTER ON idx_created_at;
            -- Create indices on freqyuently queried fields.
            CREATE INDEX IF NOT EXISTS idx_content ON CONVERSATIONS(content);
            CREATE INDEX IF NOT EXISTS idx_contact_name ON CONVERSATIONS(contact_name);
            CREATE INDEX IF NOT EXISTS idx_contact_phone_number ON CONVERSATIONS(contact_phone_number);
        `);
        console.log("Tables created successfully.");
    } catch (error) {
        // Send error message in case of an error.
        console.error("Error creating tables and indices", error);
        pool.end();
    }
}

/* This function randomly generates and inserts values into
* the table CONTACTS.
*/
async function initializeContacts(numberOfContacts) {
    try {
        // Initialize createdDates.
        const createdDates = [];

        // Read from first_names.csv and surnames.csv.
        const firstnames = parseCSV("./static/first_names.csv");
        const surnames = parseCSV("./static/surnames.csv");

        // Perform multi-value insertion into table CONTACTS in batches of 10,000.
        const batchSize = 10000;
        let values = [];
        let params = [];
        let paramCounter = 1;
        for (let i = 1; i <= numberOfContacts; i++) {
            // Randomly generate fields for the table CONTACTS.
            const name = generateName(firstnames, surnames);
            const phone_number = generatePhoneNumber(country_code);
            const [created_at, updated_at] = generateTimestamps();
            createdDates.push(created_at);
            
            values.push(`($${paramCounter}, $${paramCounter + 1}, $${paramCounter + 2}, $${paramCounter + 3})`);
            params.push(name, phone_number, created_at, updated_at);
            paramCounter += 4;

            // Insert every batchSize fields.
            if (i % batchSize === 0 || i === numberOfContacts) {
                await pool.query(
                    `INSERT INTO CONTACTS (contact_name, phone_number, created_at, updated_at) VALUES ${values.join(",")}`,
                    params
                );
                values = [];
                params = [];
                paramCounter = 1;
                if (i % 10000 === 0) {
                    console.log(`Inserted ${i} contacts`);
                }
            }
        }
        console.log(`${numberOfContacts} dummy contacts created successfully.`);
        // Return array createdDates to be used in function initializeMessages.
        return createdDates;
    } catch (error) {
        // Send error message in case of an error.
        console.error("Error initializing contacts:", error);
        pool.end();
    }
};

/* This function randomly generates and inserts values into
* the table MESSAGES.
*/
async function initializeMessages(numberOfContacts, numberOfMessages, createdDates) {
    try {
        // Read from message_content.csv.
        const contents = parseCSV("./static/message_content.csv");
        const contents_length = contents.length;

        // Perform multi-value insertion into table CONTACTS in batches of 10,000.
        const batchSize = 10000;
        let values = [];
        let params = [];
        let paramCounter = 1;
        
        for (let i = 1; i <= numberOfMessages; i++) {
            // Randomly generate fields for the table MESSAGES.
            const contact_id = Math.floor(Math.random() * numberOfContacts) + 1;
            const content = contents[Math.floor(Math.random() * contents_length)];
            const created_at = generateTimestampAfter(createdDates[contact_id - 1]);

            values.push(`($${paramCounter}, $${paramCounter + 1}, $${paramCounter + 2})`);
            params.push(contact_id, content, created_at);
            paramCounter += 3;

            // Insert every batchSize fields.
            if (i % batchSize === 0 || i === numberOfMessages) {
                await pool.query(
                    `INSERT INTO MESSAGES (contact_id, content, created_at) VALUES ${values.join(",")}`,
                    params
                );
                values = [];
                params = [];
                paramCounter = 1;
                if (i % 10000 === 0) {
                    console.log(`Inserted ${i} messages`);
                }
            }
        }
        console.log(`${numberOfMessages} dummy messages created successfully.`);
    } catch (error) {
        // Send error message in case of an error.
        console.error("Error initializing contacts:", error);
        pool.end();
    }
};

/* This function inserts appropriate
* values into the table CONVERSATIONS.
*/
async function initializeConversations() {
    try {
        console.log("Initializing conversations...");
        // Insert values for the table CONVERSATIONS from values in tables CONTACTS and MESSAGES.
        await pool.query(`
            INSERT INTO CONVERSATIONS (contact_id, last_message_id, created_at, contact_name, contact_phone_number, content)
            SELECT *
            FROM (
                SELECT DISTINCT ON(contact_id) CONTACTS.id AS contact_id, MESSAGES.id AS last_message_id, MESSAGES.created_at AS created_at,
                CONTACTS.contact_name AS contact_name, CONTACTS.phone_number AS contact_phone_number, MESSAGES.content AS content
                FROM CONTACTS
                JOIN MESSAGES ON CONTACTS.id = MESSAGES.contact_id
            )
            ORDER BY created_at DESC;
            CLUSTER CONVERSATIONS;
        `);
        console.log("Conversations initialized successfully.");
    } catch (error) {
        // Send error message in case of an error.
        console.error("Error initializing conversations:", error);
        pool.end();
    }
}

/* This function populates the database and accepts
* parameters number_of_contacts and number_of_messages
* representing the intended number of contacts and messages.
*/
async function populateDatabase(number_of_contacts, number_of_messages) {
    await createTables();
    const createdDates = await initializeContacts(number_of_contacts);
    await initializeMessages(number_of_contacts, number_of_messages, createdDates);
    await initializeConversations();
    console.log("Database populated successfully.");
    pool.end();
}

// populate the database.
populateDatabase(number_of_contacts, number_of_messages);