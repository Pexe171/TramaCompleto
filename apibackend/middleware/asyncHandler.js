// Helper para lidar com rotas assíncronas sem duplicar try/catch
module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
