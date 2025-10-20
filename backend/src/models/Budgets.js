import { pool } from '../../config/database.js'
import Category from './Categories.js';

class Budget {
    constructor(budgetData){
        this.id = budgetData.id;
        this.nombre = budgetData.nombre;
        this.estado = budgetData.estado;
        this.periodo = budgetData.periodo;
        this.inicio = budgetData.inicio;
        this.fin = budgetData.fin;
        this.monto = budgetData.monto;
        this.created_at = budgetData.created_at;
        this.updated_at = budgetData.updated_at;
        this.categoria_id = budgetData.categoria_id; 
        this.usuario_id = budgetData.usuario_id;
    }


    //* Crear presupuesto
    static async create (budgetData) {
        const { nombre, periodo, inicio, fin, monto, estado, categoria_id, usuario_id } = budgetData
        
        try {
            const category = await Category.findById(categoria_id)
            if(!category) {
                throw new Error('La categoria especificada no existe.')
            }

            if(category.usuario_id !== null && category.usuario_id !== parseInt(usuario_id)){
                throw new Error('No tienes permisos para usar esta categoria.')
            }

            const [result] = await pool.execute(
                `INSERT INTO budgets (nombre, periodo, inicio, fin, monto, estado, categoria_id, usuario_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [nombre, periodo, inicio, fin, parseFloat(monto), estado, parseInt(categoria_id), parseInt(usuario_id)]
            )

            const newBudget = Budget.findById(result.insertId)
            return newBudget
        }
        catch (error) {
            throw error
        }
    }


    //* Actualizar transacciones
    async update(updateData) {
        try {
            // Solo actualiza los campos que vienen en updateData
            const fields = [];
            const values = [];
            
            if (updateData.nombre !== undefined) {
                fields.push('nombre = ?');
                values.push(updateData.nombre);
            }

            if (updateData.periodo !== undefined) {
                fields.push('periodo = ?');
                values.push(updateData.periodo);
            }

            if (updateData.inicio !== undefined) {
                fields.push('inicio = ?');
                values.push(updateData.inicio);
            }

            if (updateData.fin !== undefined) {
                fields.push('fin = ?');
                values.push(updateData.fin);
            }

            if (updateData.monto !== undefined) {
                fields.push('monto = ?');
                values.push(updateData.monto);
            }

            if (updateData.estado !== undefined) {
                fields.push('estado = ?');
                values.push(updateData.estado);
            }


            if (updateData.categoria_id !== undefined) {
                // Solo si categoria_id viene en la petición, validamos
                const category = await Category.findById(updateData.categoria_id);
                if (!category) {
                    throw new Error('La categoría especificada no existe');
                }

                if (category.usuario_id !== null && category.usuario_id !== parseInt(this.usuario_id)) {
                    throw new Error('No tienes permisos para usar esta categoria.');
                }

                fields.push('categoria_id = ?');
                values.push(updateData.categoria_id);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            values.push(this.id);

            const query = `UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`;
            await pool.execute(query, values);

            // Actualizar el objeto actual
            Object.assign(this, updateData);
            
            return this;
        }
        catch (error) {
            throw error
        }
    }


    //* ELiminar transaccion
    async delete() {
        try {
            const [row] = await pool.execute(
                'DELETE FROM budgets WHERE id = ?',
                [this.id]
            )
            
            return true
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar Presupuesto por id
    static async findById(id) { 
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM budgets WHERE id = ?',
                [id]
            )

            if(rows.length === 0){
                return null
            }

            return new Budget(rows[0])
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar todas los presupuestos
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM budgets ORDER BY fecha DESC'
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(budgetData => new Budget(budgetData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar presupuestos por id de usuario
    static async findByUserId(usuario_id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM budgets WHERE usuario_id = ?',
                [usuario_id]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(budgetData => new Budget(budgetData))
        }
        catch (error){
            throw error
        }
    }


    //* Buscar presupuesto por nombre
    static async findByName(usuario_id, nombre) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM budgets WHERE usuario_id = ? AND nombre LIKE ? ORDER BY id ASC',
                [usuario_id, `%${nombre}%`]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(budgetData => new Budget(budgetData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar presupuesto por estado
    static async findByState(usuario_id, estado) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM budgets WHERE usuario_id = ? AND estado = ?',
                [usuario_id, estado]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(budgetData => new Budget(budgetData))
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
            inicio: this.inicio,
            fin: this.fin,
            monto: this.monto,
            estado: this.estado,
            categoria_id: this.categoria_id,
            usuario_id: this.usuario_id,
            created_at: this.created_at,
            updated_at: this.updated_at
        }
    }

}

export default Budget;