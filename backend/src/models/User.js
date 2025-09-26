import { pool } from '../../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    constructor(userData) {
        this.id = userData.id;
        this.username = userData.username;
        this.name = userData.name;
        this.email = userData.email;
        this.password = userData.password;
        this.fch_creacion = userData.fch_creacion;
        this.updated_at = userData.updated_at;
    }

    //* Crear nuevo usuario
    static async create(userData) {
        const { username, name, email, password } = userData;

        try {
            // Encriptar la contraseña
            const saltRounds = 10
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const [result] = await pool.execute(
                'INSERT INTO users (username, name, email, password) VALUES (?,?,?,?)',
                [username, name, email, hashedPassword]
            )

            // Obtener usuario creado
            const newUser = await User.findById(result.insertId)
            return newUser
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar usuario por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            )

            if (rows.length === 0) {
                return null; // Usuario no encontrado
            }

            return new User(rows[0]);
        }
        catch (error) {
            throw Error
        }
    }


    //* Buscar usuario por email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            )

            if (rows.length === 0) {
                return null; // Usuario no encontrado
            }

            return new User(rows[0]);
        }
        catch (error) {
            throw Error
        }
    }


    //* Buscar usuario por username
    static async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            )

            if (rows.length === 0) {
                return null; // Usuario no encontrado
            }

            return new User(rows[0]);
        }
        catch (error) {
            throw Error
        }
    }


    //* Validar contraseña
    async validatePassword (password) {
        try {
            return await bcrypt.compare(password, this.password);
        }
        catch (error) {
            throw Error
        }
    }


    //* Actualizar usuario
    async update (updateData) {
        try {
            const { name, email} = updateData;

            await pool.execute(
                'UPDATE users SET name = ?, email = ? WHERE id = ?',
                [name, email, this.id]
            )

            // Actualizar datos del objeto actual
            this.name = name
            this.email = email

            return this
        }
        catch (error) {
            throw Error
        }
    }


    //* Eliminar usuario
    async delete () {
        try {
            await pool.execute(
                'DELETE FROM users WHERE id = ?',
                [this.id]
            )
            return true
        }
        catch (error) {
            throw Error
        }
    }


    //* Convetir a JSON (ocultar password)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }


    //* Obtener todos los usuarios (para admin)
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT id, username, name, email, fch_creacion, updated_at FROM users ORDER BY fch_creacion DESC'
            )

            return rows.map(userData => new User(userData));
        }
        catch (error) {
            throw Error
        }
    }
}

export default User;