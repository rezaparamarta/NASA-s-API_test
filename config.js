require('dotenv').config(); // Load environment variables dari .env

const config = {
    apiKey: process.env.API_KEY,  // Ambil API key dari .env
};

module.exports = config;
