// Configuração de conexão com o MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI não configurado nas variáveis de ambiente.');
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('Conexão com MongoDB perdida. Tentando reconectar...');
});

module.exports = connectDB;
