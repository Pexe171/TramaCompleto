// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); 

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado para seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();
    try {
        await User.deleteMany({ email: 'admin@trama.com' }); // Limpa admin antigo se existir

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('senhaSuperForte123', salt);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@trama.com',
            passwordHash: passwordHash,
            role: 'admin',
            displayName: 'Admin do Portal'
        });

        await adminUser.save();
        console.log('Usuário Admin criado com sucesso!');
    } catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedAdmin();
