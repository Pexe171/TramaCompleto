// Configuração de conexão com o MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.set('strictQuery', true);

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection) {
        return cachedConnection;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI não configurado nas variáveis de ambiente.');
    }

    try {
        const connection = await mongoose.connect(uri);
        cachedConnection = connection;
        console.log(`MongoDB conectado: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        throw error;
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('Conexão com MongoDB perdida. Tentando reconectar...');
});

mongoose.connection.on('reconnected', () => {
    console.log('Conexão com MongoDB restabelecida.');
});

mongoose.connection.on('error', (error) => {
    console.error('Erro de conexão com MongoDB:', error);
});

module.exports = connectDB;
