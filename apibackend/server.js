// Servidor Express principal
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
    const allowedOrigin = process.env.CLIENT_URL;
    if (allowedOrigin) {
        res.header('Access-Control-Allow-Origin', allowedOrigin);
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    return next();
});

app.use('/api', require('./routes/api'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/interact', require('./routes/interactionRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const clientBuildPath = path.join(__dirname, 'client', 'build');

if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
} else {
    app.get('/', (_req, res) => {
        res.status(200).json({ message: 'API executando. Build do cliente não encontrado.' });
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor executando na porta ${PORT}`));
