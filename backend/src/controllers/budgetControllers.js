import Budget from "../models/Budgets.js";
import { validarRangoFechas } from "../utils/dataValidator.js";

const budgetController = {

    async createBudget (req, res) {
        try {
            const { nombre, periodo, inicio, fin, monto, estado, categoria_id } = req.body

            if(!nombre || !inicio || !fin || !monto || !categoria_id){
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios'
                })
            }

            // Validar rango de fechas
            const validacion = validarRangoFechas(inicio, fin);
            if (!validacion.valido) {
                return res.status(400).json({ 
                    success: false, 
                    message: validacion.mensaje 
                });
            }
            

            const budgetData = {
                nombre,
                periodo,
                inicio,
                fin,
                monto,
                estado,
                categoria_id,
                usuario_id: req.user.userId
            }

            const newBudget = await Budget.create(budgetData)
            res.status(201).json({
                success: true,
                message: 'Presupuesto creado exitosamente.',
                data: {
                    budget: newBudget.toJSON() 
                }
            })
        }
        catch (error) {
            console.log('Error en createBudget.', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },


    async updateBudget (req, res) {
        try {
            const budgetId = req.params.id
            const userId = req.user.userId

            const budget = await Budget.findById(budgetId)

            if(!budget) {
                return res.status(404).json({
                    success: false,
                    message: 'Presupuesto no encontrado.'
                })
            }

            if(budget.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar este presupuesto.'
                });
            }

            if(!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionaron datos para actualizar.'
                })
            }

            const updateBudget = await budget.update(req.body)

            res.json({
                success: true,
                message: 'Presupuesto actualizado exitosamente.',
                data: {
                    transaction: updateBudget.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en updateBudget.', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor'
            })
        }
    },


    async deleteBudget (req,res) {
        try {
            const budgetId = req.params.id
            const userId = req.user.userId

            const budget = await Budget.findById(budgetId)

            if(!budget) {
                return res.status(404).json({
                    success: false,
                    message: 'Presupuesto no encontrado'
                })
            }

            if(budget.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este presupuesto'
                });
            }

            await budget.delete()

            res.json({
                success: true,
                message: 'Presupuesto eliminado exitosamente.',
            })
        }
        catch (error) {
            console.log('Error en deleteBudget: ', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },


    async getBudgetById (req,res) {
        try {
            const { id }  = req.params 
            
            if(!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de presupuesto requerido.'
                })
            }

            const budget = await Budget.findById(id)

            if(!budget){
                return res.status(404).json({
                    success: false,
                    message: 'Presupuesto no encontrado.'
                })
            }

            if(budget.usuario_id !== req.user.userId){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este presupuesto'
                })
            }

            res.json({
                success: true,
                data: {
                    budget: budget.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en getBudgetById: ', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },


    async getBudgetByName (req, res) {
        try {
            const userId = req.user.userId
            const { nombre }  = req.query
            
            if(!nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre de presupuesto requerido.'
                })
            }

            const budget = await Budget.findByName(userId, nombre)

            if(!budget){
                return res.status(404).json({
                    success: false,
                    message: 'Presupuesto no encontrado.'
                })
            }

            if(budget.usuario_id !== userId){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este presupuesto'
                })
            }

            res.json({
                success: true,
                data: {
                    budget: budget.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en getBudgetByName: ', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },


    async getBudgetByUser (req,res) {
        try {
            const userId = req.user.userId
            
            const budgets = await Budget.findByUserId(userId)

            if (!budgets || budgets.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron presupuestos para este usuario.',
                    data: {
                        budgets: [],
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    budget: budgets.map(bud => bud.toJSON()),
                    count: budgets.length
                }
            })
        }
        catch (error) {
            console.log('Error en getBudgetByUser: ', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },

    async getBudgetByState (req,res) {
        try {
            const userId = req.user.userId
            const { estado } = req.query

            if(!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar el estado (true o false).'
                })
            }

            const estadoBool = estado === 'true' ? 1 : 0;

            const budgets = await Budget.findByState(userId, estadoBool)

            if (!budgets || budgets.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron presupuestos para este usuario.',
                    data: {
                        budget: [],
                        estado: estado,
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    budget: budgets.map(bud => bud.toJSON()),
                    estado: estado,
                    count: budgets.length
                }
            })
        }
        catch (error) {
            console.log('Error en getBudgetsByUserAndState: ', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            })
        }
    },
}

export default budgetController;