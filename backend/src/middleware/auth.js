import jwt from 'jsonwebtoken';


//! MIDDLEWARE = Función que se ejecuta ANTES del controlador
const authenticateToken = (req, res, next) => {
    
    // PASO 1: Obtener el header Authorization
    // Busca en req.headers['authorization'] el token
    const authHeader = req.headers['authorization'];
    
    // PASO 2: Verificar si existe el header
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }
    
    // PASO 3: Verificar que empiece con "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Formato de token inválido. Debe ser: Bearer <token>'
        });
    }
    
    // PASO 4: Extraer solo el token (sin "Bearer ")
    // "Bearer eyJhbGciOi..." → "eyJhbGciOi..."
    const token = authHeader.split(' ')[1]; // [0]="Bearer", [1]="token"
    
    // PASO 5: Verificar si el token existe después del split
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }
    
    try {
        // PASO 6: Verificar y desencriptar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // decoded contiene: { userId: 5, email: "user@gmail.com", iat: ..., exp: ... }
        
        // PASO 7: Pasar los datos del usuario al siguiente middleware/controlador
        req.user = decoded;  // Ahora req.user.userId estará disponible
        
        // PASO 8: Continuar al siguiente middleware o controlador
        next(); // Sin next(), la petición se queda "colgada"
        
    } catch (error) {
        // PASO 9: Manejar errores de JWT
        
        if (error.name === 'JsonWebTokenError') {
            // Token malformado o con firma inválida
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            // Token expirado
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Inicia sesión nuevamente'
            });
        }
        
        // Cualquier otro error
        console.error('Error en authenticateToken:', error);
        return res.status(401).json({
            success: false,
            message: 'Error al verificar token'
        });
    }
};

export default authenticateToken;