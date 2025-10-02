import Category from "../models/Categories.js";

const categoryController = {

    async getCategories (req, res) {
        try {
            const categories = await Category.getAvalibleForUser(req.user.userId)

            // Respuesta exitosa
            res.json({
                success: true,
                data: {
                    categories: categories.map(cat => cat.toJSON()),
                    count: categories.length
                }
            })
        }
        catch (error) {
            console.log('Error en getCategories:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    },

    async getCategoriesByType(req, res) {
        try {
            const userId = req.user.userId;  // Del middleware
            const tipo = req.query.type; 
            
            if(!tipo){
                return res.status(400).json({
                    success: false,
                    message: 'El parametro type es requerido.'
                })
            }

            if(tipo !== 'ingreso' && tipo !== 'gasto'){
                return res.status(400).json({
                    success: false,
                    message: 'El tipo debe ser "Ingreso" o "Gasto".'
                })
            }

            const categories = await Category.findByUserAndType(userId, tipo)
            
            res.json({
                success: true,
                data: {
                    categories: categories.map(cat => cat.toJSON()),
                    type: tipo,
                    count: categories.length
                }
            })
        }
        catch (error) {
            console.log('Error en getCategoriesByType:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    },

    async createCategory(req, res) {
        try {
            const { nombre, descripcion, tipo, color, icon } = req.body

            if(!nombre || !tipo ){
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y Tipo son obligatorios.'
                })
            }

            if(tipo !== 'ingreso' && tipo !== "gasto"){
                return res.status(400).json({
                    success: false,
                    message: 'El tipo debe ser "Ingreso" o "Gasto"'
                })
            }

            const categoryData = {
                nombre,
                descripcion: descripcion || null,
                tipo,
                color: color || '#007bff',
                icon: icon || 'category',
                usuario_id: req.user.userId
            }

            const newCategory = await Category.create(categoryData)
            res.status(201).json({
                success: true,
                message: 'Categoria creada exitosamente.',
                data: {
                    category: newCategory.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en createCategories:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    },

    async updateCategory(req, res) {
        try {
            const categoryId = req.params.id
            const userId = req.user.userId
            
            const category = await Category.findById(categoryId)

            if(!category){
                return res.status(404).json({
                    success: false,
                    message: 'Categoria no encontrada.'
                })
            }

            if(category.usuario_id !== userId && category.usuario_id !== null){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar esta categoría'
                });
            }

            if(category.is_default){
                return res.status(403).json({
                    success: false,
                    message: 'No puedes modifcar categorias predeterminadas.'
                });
            }

            const updateCategory = await category.update(req.body)

            res.json({
                success: true,
                message: 'Categoria actualizada exitosamente.',
                data: {
                    category: updateCategory.toJSON()
                }
            })
            
        }
        catch (error) {
            console.log('Error en updateCategory:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    },

    async deleteCategory(req, res) {
        try {
            const categoryId = req.params.id
            const userId = req.user.userId

            const category = await Category.findById(categoryId)

            if(!category){
                return res.status(404).json({
                    success: false,
                    message: 'Categoria no encontrada.'
                });
            }

            if(category.usuario_id !== userId && category.usuario_id !== null){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar esta categoría'
                });
            }

            if(category.is_default){
                return res.status(403).json({
                    success: false,
                    message: 'No puedes eliminar categorias predeterminadas.'
                });
            }

            await category.delete()

            res.json({
                success: true,
                message: 'Categoria eliminada exitosamente.'
            })
        }
        catch (error) {
            console.log('Error en deleteCategory:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error en el servidor' 
            });
        }
    }

}

export default categoryController;