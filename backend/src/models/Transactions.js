import { pool } from '../../config/database.js'
import Category from './Categories.js'

class Transaction {
    constructor(transactionData){
        this.id = transactionData.id;
        this.tipo = transactionData.tipo;
        this.descripcion = transactionData.descripcion;
        this.monto = transactionData.monto;
        this.fecha = transactionData.fecha;
        this.created_at = transactionData.created_at;
        this.updated_at = transactionData.updated_at;
        this.categoria_id = transactionData.categoria_id;
        this.usuario_id = transactionData.usuario_id;
    }


    //* Crear transaccion
    static async create(transactionData) {
        const { tipo, descripcion, monto, fecha, categoria_id, usuario_id } = transactionData
        
        try {
            // Verificar que la categoría existe y pertenece al usuario o es predeterminada
            const category = await Category.findById(categoria_id)
            if (!category) {
                throw new Error('La categoría especificada no existe')
            }

            // La categoría debe pertenecer al usuario o ser predeterminada (user_id = null)
            if(category.usuario_id !== null && category.usuario_id !== parseInt(usuario_id)){
                throw new Error('No tienes permisos para usar esta categoria.')
            }

            // Insertar la transaccion en la BD
            const [result] = await pool.execute(
                'INSERT INTO transactions (tipo, descripcion, monto, fecha, categoria_id, usuario_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [tipo, descripcion, parseFloat(monto), fecha, parseInt(categoria_id), parseInt(usuario_id)]
            )

            // Obtener transacción creada (consistente con Categories)
            const newTransaction = await Transaction.findById(result.insertId)
            return newTransaction
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar transaccion por id
    static async findById(id) { 
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            )

            if(rows.length === 0){
                return null
            }

            return new Transaction(rows[0])
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar todas las transacciones
    static async findAll() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions ORDER BY fecha DESC'
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(transactionData => new Transaction(transactionData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar transacciones por id de usuario
    static async findByUserId(usuario_id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE usuario_id = ?',
                [usuario_id]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(transactionData => new Transaction(transactionData))
        }
        catch (error){
            throw error
        }
    }
    
    //* Buscar transacciones por id de usuario y tipo
    static async findByUserAndType(usuario_id, tipo) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE usuario_id = ? AND tipo = ?',
                [usuario_id, tipo]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(transactionData => new Transaction(transactionData))
        }
        catch (error) {
            throw error
        }
    }

    //* Buscar transacciones por id de usuario y categoria
    static async findByUserAndCategory(usuario_id, categoria_id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE usuario_id = ? AND categoria_id = ?',
                [usuario_id, categoria_id]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(transactionData => new Transaction(transactionData))
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
            
            if (updateData.tipo !== undefined) {
                fields.push('tipo = ?');
                values.push(updateData.tipo);
            }

            if (updateData.descripcion !== undefined) {
                fields.push('descripcion = ?');
                values.push(updateData.descripcion);
            }

            if (updateData.monto !== undefined) {
                fields.push('monto = ?');
                values.push(updateData.monto);
            }

            if (updateData.fecha !== undefined) {
                fields.push('fecha = ?');
                values.push(updateData.fecha);
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

            const query = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`;
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
                'DELETE FROM transactions WHERE id = ?',
                [this.id]
            )
            
            return true
        }
        catch (error) {
            throw error
        }
    }


    //* Método para convertir la instancia a JSON limpio
    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            descripcion: this.descripcion,
            monto: this.monto,
            fecha: this.fecha,
            categoria_id: this.categoria_id,
            usuario_id: this.usuario_id,
            created_at: this.created_at,
            updated_at: this.updated_at
        }
    }


    //* Devuelve las transacciones entre un rango de fechas
    static async findByDateRange(usuario_id, fechaInicio, fechaFin) {
        try {
            if(!fechaInicio || !fechaFin){
                throw new Error ('Las fechas de inicio y fin son requeridas')
            }

            if(new Date(fechaInicio) > new Date(fechaFin)) {
                throw new Error ('La fecha de inicio no puede ser mayor que la fecha de fin')
            }

            const [rows] = await pool.execute(
                'SELECT * FROM transactions WHERE usuario_id = ? AND fecha >= ? AND fecha <= ? ORDER BY fecha DESC',
                [usuario_id, fechaInicio, fechaFin]
            )

            if(rows.length === 0){
                return null
            }

            return rows.map(transactionData => new Transaction(transactionData))
        }
        catch (error) {
            throw error
        }
    }


    static async getTotalByUser(usuario_id) {
        try {
            const [ingresos] = await pool.execute(
                'SELECT COALESCE(SUM(monto), 0) as total FROM transactions WHERE usuario_id = ? AND tipo = "ingreso"',
                [usuario_id]
            )

            const [gastos] = await pool.execute(
                'SELECT COALESCE(SUM(monto), 0) as total FROM transactions WHERE usuario_id = ? AND tipo = "gasto"',
                [usuario_id]
            )

            // Calcular el balance total (ingresos - gastos)
            const totalIngresos = parseFloat(ingresos[0].total)
            const totalGastos = parseFloat(gastos[0].total)
            const balance = totalIngresos - totalGastos

            return {
                total_ingresos: totalIngresos,
                total_gastos: totalGastos,
                balance: balance
            }
        }
        catch (error) {
            throw error
        }
    }


    static async getTotalByUserAndType(usuario_id, tipo) {
        try {
            // Validar que el tipo sea correcto
            if(tipo !== "ingreso" && tipo !== "gasto"){
                throw new Error('El tipo debe ser "ingreso" o "gasto"')
            }

            const [result] = await pool.execute(
                'SELECT COALESCE(SUM(monto), 0) as total FROM transactions WHERE usuario_id = ? AND tipo = ?',
                [usuario_id, tipo]
            )

            const total = parseFloat(result[0].total)

            return {
                tipo: tipo,
                total: total
            }
        }
        catch (error) {
            throw error
        }
    }


    static async getMonthlyBalance(usuario_id, year, month) {
        try {
            // Validar parámetros
            if (!usuario_id || !year || !month) {
                throw new Error('Los parámetros usuario_id, año y mes son requeridos')
            }

            if(year > new Date().getFullYear) {
                throw new Error ('El año no puede ser mayor al actual.')
            }

            // Validar que el mes sea válido
            if (month < 1 || month > 12) {
                throw new Error('El mes debe estar entre 1 y 12')
            }

            const [ingresos] = await pool.execute(
                'SELECT COALESCE(SUM(monto), 0) as total FROM transactions WHERE usuario_id = ? AND tipo = "ingreso" AND YEAR(fecha) = ? AND MONTH(fecha) = ?',
                [usuario_id, year, month]
            )

            const [gastos] = await pool.execute(
                'SELECT COALESCE(SUM(monto), 0) as total FROM transactions WHERE usuario_id = ? AND tipo = "gasto" AND YEAR(fecha) = ? AND MONTH(fecha) = ?',
                [usuario_id, year, month]
            )

            // Calcular el balance total (ingresos - gastos)
            const totalIngresos = parseFloat(ingresos[0].total)
            const totalGastos = parseFloat(gastos[0].total)
            const balance = totalIngresos - totalGastos

            return {
                año: year,
                mes: month,
                total_ingresos: totalIngresos,
                total_gastos: totalGastos,
                balance: balance
            }
        }
        catch (error) {
            throw error
        }
    }
    
}


export default Transaction;