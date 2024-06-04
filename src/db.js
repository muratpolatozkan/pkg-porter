const { Sequelize, DataTypes } = require('sequelize'); // Importing Sequelize and DataTypes from sequelize
const path = require('path'); // Importing path module to handle file paths

// Define the database directory and ensure it exists
const dbDirectory = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDirectory, 'access_log.db');

// Create the database directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

// Creating a new Sequelize instance and connecting to our SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath, // Use the defined path for the SQLite storage
    logging: false, // Disabling logging for production can be a good practice for security and performance reasons
});

// Defining the 'AccessLog' model
const AccessLog = sequelize.define('AccessLog', {
    packageName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    version: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accessTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
});

// An async function to initialize our database
const initDb = async () => {
    await sequelize.sync({ alter: true }); // Using 'alter: true' can help keep the database schema consistent with our models
};

// Exporting the 'AccessLog' model and the 'initDb' function
module.exports = {
    AccessLog,
    initDb
};
