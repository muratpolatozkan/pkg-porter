require('dotenv').config();

const express = require('express');
const axios = require('axios');
const tar = require('tar-stream');
const zlib = require('zlib');
const path = require('path');
const cors = require('cors');
const { log } = require('./logger');  // Importing the custom log function
const { AccessLog, initDb } = process.env.USE_DB === 'true' ? require('./db') : {};
const cache = require('memory-cache');  // Importing memory-cache for in-memory caching
const app = express();

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Environment variables for configuration
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://registry.npmjs.org/';
const USERNAME = process.env.USERNAME || '';
const PASSWORD = process.env.PASSWORD || '';

const URL = process.env.URL || 'http://localhost';
const PORT = process.env.PORT || 8081;
const USE_CACHE = process.env.USE_CACHE === 'true';

// Authentication header for accessing the registry, if credentials are provided
const authHeader = USERNAME && PASSWORD ? {
    auth: {
        username: USERNAME,
        password: PASSWORD
    }
} : {};

// MIME types for different file extensions
const mimeTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json'
};

/**
 * Fetches and caches a package from the registry.
 * @param {string} packageUrl - URL of the package to fetch.
 * @param {string} filePath - Path of the file inside the package.
 * @param {string} cacheKey - Key to store/retrieve the package from the cache.
 * @returns {Promise<Object>} - Returns a promise that resolves to the file contents.
 */
const fetchAndCachePackage = async (packageUrl, filePath, cacheKey) => {
    const startTime = new Date().getTime(); // Start time of the operation

    const response = await axios.get(packageUrl, {
        responseType: 'arraybuffer',
        ...authHeader
    });

    const extract = tar.extract();
    const fileContents = {};

    return new Promise((resolve, reject) => {
        extract.on('entry', (header, stream, next) => {
            const chunks = [];
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', () => {
                const fileData = Buffer.concat(chunks);
                fileContents[header.name] = fileData;
                next();
            });
            stream.resume();
        });

        extract.on('finish', () => {
            const endTime = new Date().getTime(); // End time of the operation
            const duration = endTime - startTime; // Duration of the operation
            log('info', `Package fetched and extracted in ${duration}ms`);
            resolve(fileContents);
        });

        extract.on('error', (err) => {
            log('error', `Error extracting package: ${err.message}`);  // Log extraction errors
            reject(err);
        });

        const buffer = Buffer.from(response.data, 'binary');
        const unzip = zlib.createGunzip();
        unzip.end(buffer);
        unzip.pipe(extract);
    });
};

/**
 * Route to handle package requests.
 * Downloads, caches, and serves the requested package file.
 */
app.get('/:packageName@:version/*', async (req, res) => {
    const { packageName, version } = req.params;
    const filePath = req.params[0];
    const cacheKey = `${packageName}@${version}`;

    try {
        const packageUrl = `${REGISTRY_URL}${packageName}/-/${packageName}-${version}.tgz`;

        // Check if the package is already in the cache
        if (USE_CACHE) {
            const cachedFileContents = cache.get(cacheKey);
            if (cachedFileContents) {
                const fileData = cachedFileContents[`package/${filePath}`];
                if (fileData) {
                    const ext = path.extname(filePath);
                    const mimeType = mimeTypes[ext] || 'application/octet-stream';
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
                    res.send(fileData);
                    log('info', `Served from cache: ${packageName}@${version}/${filePath}`);  // Log cache hit
                    return;
                }
            }
        }

        // If not in cache, fetch from the registry
        const fileContents = await fetchAndCachePackage(packageUrl, filePath, cacheKey);

        // Log access to the database, if enabled
        if (process.env.USE_DB === 'true') {
            await AccessLog.create({ packageName, version });
        }

        const fileData = fileContents[`package/${filePath}`];
        if (fileData) {
            const ext = path.extname(filePath);
            const mimeType = mimeTypes[ext] || 'application/octet-stream';
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
            res.send(fileData);
            log('info', `Fetched and served: ${packageName}@${version}/${filePath}`);  // Log successful fetch

            // Add to cache, if enabled
            if (USE_CACHE) {
                cache.put(cacheKey, fileContents);
            }

        } else {
            res.status(404).send('File not found');
            log('warn', `File not found: ${packageName}@${version}/${filePath}`);  // Log file not found
        }
    } catch (error) {
        log('error', `Error fetching package: ${error.message}`);  // Log fetch errors
        res.status(500).send('Error fetching package');
    }
});

// Initialize the database and start the server, if database usage is enabled
if (process.env.USE_DB === 'true') {
    initDb().then(() => {
        app.listen(PORT, () => {
            log('info', `Server is running on ${URL}${PORT ? `:${PORT}` : ''}`);
        });
    }).catch((error) => {
        log('error', `Error initializing database: ${error.message}`);
    });
} else {
    // Start the server without initializing the database
    app.listen(PORT, () => {
        log('info', `Server is running on ${URL}${PORT ? `:${PORT}` : ''}`);
    });
}
