import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authController = {
    
    //* REGISTRAR USUARIO
    async register(req, res) {
        try {
            const { username, name, email, password } = req.body

            // Validar que lleguen todos los datos
            if(!username || !name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios' });
            }

            // Validar formato de email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email invalido' });
            }

            // Validar la longitud de la password
            if(password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres' 
                });
            }
            
            // Verificar si el email ya existe
            const existingUserByEmail = await User.findByEmail(email)
            if(existingUserByEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado' 
                });
            }

            // Verificar si el username ya existe
            const existingUserByUsername = await User.findByUsername(username)
            if(existingUserByUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                })
            }

            // Crear el usuario
            const newUser = await User.create({ username, name, email, password });
            
            // Generar el token JWT
            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            // Respuesta exitosa
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: newUser.toJSON(),
                    token
                }
            })
        }
        catch (error) {
            console.log('Error en register:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    },

    //* LOGIN USUARIO
    async login(req, res) {
        try {
            const { email, password} = req.body

            // Validar que lleguen todos los datos
            if(!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son obligatorios'
                })
            }

            // Buscar usuario por email
            const user = await User.findByEmail(email)
            if(!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales invalidas'
                })
            }

            // Validar contraseña
            const isPasswordValid = await user.validatePassword(password)
            if(!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales invalidas'
                })
            }

            // Generar el token JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email},
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            // Respuesta exitosa
            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: user.toJSON(),
                    token
                }
            })
        }
        catch (error) {
            console.log('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            })
        }
    },

    //* OBTENER PERFIL DEL USUSARIO (requiere autenticacion)
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId)
            if(!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                })
            }

            // Respuesta exitosa
            res.json({
                success: true,
                data: user.toJSON()
            })
        }
        catch (error) {
            console.log('Error en getProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            })
        }
    },

    //* ACTUALIZAR PERFIL DEL USUARIO (requiere autenticacion)
    async updateProfile(req, res) {
        try {
            const { name, email } = req.body

            // Validar que lleguen todos los datos
            if(!name || !email) {
                return res.status(400).json({
                    success: false, 
                    message: 'Nombre y email son obligatorios'
                })
            }

            // Validar formato de email
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email invalido'
                })
            }

            // Obtener usuario actual
            const user = await User.findById(req.user.userId)
            if(!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                })
            }

            // Verifacar si el nuevo email ya existe (y no es el mismo usuario)
            if(email !== user.email) {
                const existingUser = await User.findByEmail(email)
                if(existingUser){
                    return res.status(409).json({
                        success: false,
                        message: 'El email ya esta en uso por otro usuario'
                    })
                }
            }

            // Actualizar usuario
            await user.update({ name, email })

            // Respuesta exitosa
            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: {
                    user: user.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en updateProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            })    
        }
    }
};

export default authController;