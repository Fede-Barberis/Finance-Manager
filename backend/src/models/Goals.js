import { pool } from '../../config/database.js'
import GoalContribution from './GoalContribution.js';


class Goal {
    constructor(goalData) {
        this.id = goalData.id;
        this.nombre = goalData.nombre;
        this.descripcion = goalData.descripcion;
        this.monto_objetivo = goalData.monto_objetivo;
        this.monto_actual = goalData.monto_actual;
        this.estado = goalData.estado;
        this.fecha_inicio = goalData.fecha_inicio; 
        this.fecha_meta = goalData.fecha_meta;
        this.created_at = goalData.created_at;
        this.updated_at = goalData.updated_at;
        this.usuario_id = goalData.usuario_id; 
    }


    //* Crear Ahorro
    static async create (goalData) {
        const { nombre, descripcion, monto_objetivo, fecha_meta, usuario_id  } = goalData
        
        try {
            const [result] = await pool.execute(
            `INSERT INTO goals (nombre, descripcion, monto_objetivo, fecha_inicio, fecha_meta, usuario_id, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), ?, ?, NOW(), NOW())`,
            [nombre, descripcion, parseFloat(monto_objetivo), fecha_meta, parseInt(usuario_id)]
            );

            const newGoals = await Goal.findById(result.insertId)
            return newGoals
        }
        catch (error) {
            throw error;
        }
    }


    //* Agregar contribucion
    static async addContribution (goal_id, monto) {
        if (monto <= 0) throw new Error("El monto debe ser mayor a 0");

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Crear contribución
            await GoalContribution.create(goal_id, monto);

            // Actualizar monto_actual del goal
            await connection.execute(
                `UPDATE goals SET monto_actual = monto_actual + ? WHERE id = ?`,
                [parseFloat(monto), parseInt(goal_id)]
            );

            await connection.commit();

            return {
                success: true,
                message: 'Contribución agregada correctamente',
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    

    //* Actualizar ahorro
    async update (updateData) {
        try {
            // Solo actualiza los campos que vienen en updateData
            const fields = [];
            const values = [];
            
            if (updateData.nombre !== undefined) {
                fields.push('nombre = ?');
                values.push(updateData.nombre);
            }

            if (updateData.descripcion !== undefined) {
                fields.push('descripcion = ?');
                values.push(updateData.descripcion);
            }

            if (updateData.monto_objetivo !== undefined) {
                fields.push('monto_objetivo = ?');
                values.push(updateData.monto_objetivo);
            }

            if (updateData.estado !== undefined) {
                fields.push('estado = ?');
                values.push(updateData.estado);
            }

            if (updateData.fecha_meta !== undefined) {
                fields.push('fecha_meta = ?');
                values.push(updateData.fecha_meta);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            values.push(this.id);

            const query = `UPDATE goals SET ${fields.join(', ')} WHERE id = ?`;
            await pool.execute(query, values);

            // Actualizar el objeto actual
            Object.assign(this, updateData);
            
            return this;
        }
        catch (error) {
            throw error
        }
    }


    //* Eliminar ahorro
    async delete () {
        try {
            const [row] = await pool.execute(
                'DELETE FROM goals WHERE id = ?',
                [this.id]
            )
            
            return true
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar ahorro por id
    static async findById (id) {
        try {
            const [row] = await pool.execute(
                'SELECT * FROM goals WHERE id = ?',
                [id]
            )

            return row.length ? new Goal(row[0]) : null;
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar todos los ahorros
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM goals ORDER BY fecha_inicio DESC'
            )

            return rows.length ? rows.map(goalData => new Goal(goalData)) : null
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar transacciones por id de usuario
    static async findByUserId(usuario_id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM goals WHERE usuario_id = ?',
                [usuario_id]
            )

            return rows.length ? rows.map(goalData => new Goal(goalData)) : null
        }
        catch (error){
            throw error
        }
    }


    //* Filtrar por nombre
    static async findByName (usuario_id, nombre) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM goals WHERE usuario_id = ? AND nombre LIKE ?',
                [usuario_id, `%${nombre}%`]
            )

            return rows.length ? rows.map(goalData => new Goal(goalData)) : null
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar ahorro por estado
    static async findByState(usuario_id, estado) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM goals WHERE usuario_id = ? AND estado = ?',
                [usuario_id, estado]
            )

            return rows.length ? rows.map(goalData => new Goal(goalData)) : null
        }
        catch (error) {
            throw error
        }
    }


    //* Método para convertir la instancia a JSON limpio
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            monto_objetivo: this.monto_objetivo,
            monto_actual: this.monto_actual,
            estado: this.estado,
            fecha_inicio: this.fecha_inicio,
            fecha_meta: this.fecha_meta,
            created_at: this.created_at,
            updated_at: this.updated_at,
            usuario_id: this.usuario_id
        }
    }

}

export default Goal;