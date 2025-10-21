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

const parseEnvList = (value = '') =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

const rawConfiguredOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';
const configuredOrigins = parseEnvList(rawConfiguredOrigins);
const defaultLocalOrigins = parseEnvList(
    process.env.CLIENT_LOCAL_URLS || 'http://localhost:3000,http://127.0.0.1:3000'
);
const allowedOrigins = Array.from(
    new Set([...defaultLocalOrigins, ...configuredOrigins])
);

const configuredOriginSubstrings = parseEnvList(process.env.CLIENT_URL_SUBSTRINGS);
const allowedOriginSubstrings = ['devtunnels.ms', ...configuredOriginSubstrings];

const shouldFallbackToRequestOrigin =
    rawConfiguredOrigins.trim().length === 0 && configuredOriginSubstrings.length === 0;

const fallbackOriginsLogged = new Set();
const invalidOriginsLogged = new Set();

const resolveAllowedOrigin = (requestOrigin) => {
    if (!requestOrigin) {
        if (allowedOrigins.length === 1) {
            return allowedOrigins[0];
        }
        return null;
    }

    if (allowedOrigins.includes(requestOrigin)) {
        return requestOrigin;
    }

    try {
        const { hostname } = new URL(requestOrigin);
        if (allowedOriginSubstrings.some((substring) => hostname.includes(substring))) {
            return requestOrigin;
        }
    } catch (error) {
        if (!invalidOriginsLogged.has(requestOrigin)) {
            console.warn('Origem inválida recebida no cabeçalho Origin:', requestOrigin);
            invalidOriginsLogged.add(requestOrigin);
        }
    }

    if (shouldFallbackToRequestOrigin && requestOrigin !== 'null') {
        if (!fallbackOriginsLogged.has(requestOrigin)) {
            console.warn(
                `[CORS] Origem "${requestOrigin}" não configurada explicitamente. Aplicando fallback automático.`
            );
            fallbackOriginsLogged.add(requestOrigin);
        }
        return requestOrigin;
    }

    return null;
};

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const originToAllow = resolveAllowedOrigin(requestOrigin);

    if (originToAllow) {
        res.header('Access-Control-Allow-Origin', originToAllow);
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    const existingVaryHeader = res.get('Vary');
    if (existingVaryHeader) {
        if (!existingVaryHeader.includes('Origin')) {
            res.header('Vary', `${existingVaryHeader}, Origin`);
        }
    } else {
        res.header('Vary', 'Origin');
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
