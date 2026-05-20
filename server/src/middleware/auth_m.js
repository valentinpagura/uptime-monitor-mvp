//auth.js → Encripta { id, email } con JWT_SECRET → genera token 
// middleware/auth.js → Recibe token → Desencripta con JWT_SECRET → recupera { id, email }

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Agrega el userId a req
    next();  // Continúa a la siguiente ruta
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authMiddleware;