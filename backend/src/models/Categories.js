import { pool } from '../../config/database.js';

class Category {
    constructor(categoriesData){
        this.id = categoriesData.id;
        this.nombre = categoriesData.nombre;
        this.descripcion = categoriesData.descripcion;
        this.tipo = categoriesData.tipo;
        this.color = categoriesData.color;
        this.icon = categoriesData.icon;
        this.usuario_id = categoriesData.usuario_id;
        this.is_default = categoriesData.is_default;
        this.created_at = categoriesData.created_at;
    }

    //* Crear nueva categoria
    static async create (categoriesData) {
        const { nombre, descripcion, tipo, color, icon, usuario_id } = categoriesData

        try {
            const [result] = await pool.execute(
                'INSERT INTO categories (nombre, descripcion, tipo, color, icon, usuario_id, is_default) VALUES (?,?,?,?,?,?,?)',
                [nombre, descripcion, tipo, color, icon, usuario_id, false]
            )

            // Obtener categoria creada
            const newCategory = await Category.findById(result.insertId)
            return newCategory
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar categoria por id
    static async findById (id) {
        try {
            const [row] = await pool.execute(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            )

            if(row.length === 0){
                return null
            }

            return new Category(row[0])
        }
        catch (error){
            throw error
        }
    }

    //* Buscar categorias personalziadas de un usuario
    static async findByUserId (usuario_id) {
        try {
            const [row] = await pool.execute(
                'SELECT * FROM categories WHERE usuario_id = ?',
                [usuario_id]
            )

            if(row.length === 0){
                return null
            }

            return row.map(categoryData => new Category(categoryData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar categorias personalizadas y default
    static async getAvalibleForUser (usuario_id) {
        try {
            const [row] = await pool.execute(
                'SELECT * FROM categories WHERE is_default = true OR usuario_id = ?',
                [usuario_id]
            )

            if(row.length === 0){
                return null
            }

            return row.map(categoryData => new Category(categoryData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar categorias por usuario y tipo
    static async findByUserAndType (usuario_id, tipo) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM categories WHERE (is_default = true OR usuario_id = ?) AND tipo = ? ORDER BY nombre ASC',
                [usuario_id, tipo]
            )

            return rows.map(categoryData => new Category(categoryData))
        }
        catch (error) {
            throw error
        }
    }


    //* Buscar todas las categorias
    static async findAll () {
        try {
            const [rows] = await pool.execute(
                'SELECT id, nombre, descripcion, tipo, color, icon, usuario_id, is_default, created_at FROM categories ORDER BY created_at DESC'
            )

            return rows.map(categoriesData => new Category(categoriesData))
        }
        catch (error) {
            throw error
        }
    }

    
    async update (updateData) {
        try {
            // Verificar que no es predeterminada
            if (this.is_default) {
                throw new Error('No puedes modificar categorías predeterminadas');
            }

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
            
            if (updateData.color !== undefined) {
                fields.push('color = ?');
                values.push(updateData.color);
            }
            
            if (updateData.icon !== undefined) {
                fields.push('icon = ?');
                values.push(updateData.icon);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            values.push(this.id); // Para el WHERE

            const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
            await pool.execute(query, values);

            // Actualizar el objeto actual
            Object.assign(this, updateData);
            
            return this;
        }
        catch (error){
            throw error
        }
    }


    //* Eliminar categoria
    async delete () {
        try {
            if(this.is_default) {
                throw new Error ('No puedes eliminar categorias predeterminadas')
            }

            const [rows] = await pool.execute(
                'SELECT COUNT(*) FROM transactions WHERE categoria_id = ?',
                [this.id]
            )

            const transactionCount = rows[0].count
            if(transactionCount > 0) {
                throw new Error (`No se puede eliminar la categoria. Tiene ${transactionCount} transacciones asociadas.`)
            }

            await pool.execute(
                'DELETE FROM categories WHERE id = ?',
                [this.id]
            )
            
            return true
        }
        catch (error) {
            throw error
        }
    }


    //* 
    async canDelete () {
        try {
            if(this.is_default){
                return false
            }

            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM transactions WHERE categoria_id = ?',
                [this.id]
            ) 

            const transactionCount = rows[0].count;
        
            // Si tiene transacciones, no se puede eliminar
            return transactionCount === 0;
        }
        catch (error) {
            return false
        }
    }


    //*  Convertir a JSON limpio para el frontend
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            tipo: this.tipo,
            color: this.color,
            icon: this.icon,
            usuario_id: this.usuario_id,
            is_default: this.is_default,
            created_at: this.created_at
        };
    }
}

export default Category;
