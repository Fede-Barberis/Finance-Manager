import Goal from "../models/Goals.js";
import GoalContribution from "../models/GoalContribution.js";
import { validarFecha } from "../utils/dataValidator.js";

const goalsControllers = {

    async createGoal(req,res) {
        try {
            const { nombre, descripcion, monto_objetivo, fecha_meta } = req.body

            if(!nombre || !monto_objetivo || !fecha_meta) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios.'
                })
            }

            // Validar fechas
            const validacion = validarFecha(fecha_meta);
            if (!validacion.valido) {
                return res.status(400).json({ 
                    success: false, 
                    message: validacion.mensaje 
                });
            }

            const goalData = {
                nombre,
                descripcion: descripcion || null,
                monto_objetivo: parseFloat(monto_objetivo),
                fecha_meta,
                usuario_id: req.user.userId
            };

            const newGoal = await Goal.create(goalData)

            res.status(201).json({
                success: true,
                message: 'Ahorro creado exitosamente.',
                data: {
                    goal: newGoal.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en createGoal: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },

    async updateGoal (req,res) {
        try {
            const goalId = req.params.id
            const userId = req.user.userId

            const goal = await Goal.findById(goalId)

            if(!goal) {
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado'
                })
            }

            if(goal.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar este ahorro.'
                });
            }

            if(!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionaron datos para actualizar.'
                })
            }

            const updateGoal = await goal.update(req.body)

            res.json({
                success: true,
                message: 'Ahorro actualizado exitosamente.',
                data: {
                    goal: updateGoal.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en updateGoal: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },

    async deleteGoal (req,res) {
        try {
            const goalId = req.params.id
            const userId = req.user.userId

            const goal = await Goal.findById(goalId)

            if(!goal) {
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado.'
                })
            }

            if(goal.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este ahorro.'
                });
            }

            await goal.delete()

            res.json({
                success: true,
                message: 'Ahorro eliminado exitosamente.',
            })
        }
        catch (error) {
            console.log('Error en deleteGoal: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getGoalById (req,res) {
        try {
            const { id }  = req.params 
            
            if(!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de ahorro requerido.'
                })
            }

            const goal = await Goal.findById(id)

            if(!goal){
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado.'
                })
            }

            if(goal.usuario_id !== req.user.userId){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este ahorro.'
                })
            }

            res.json({
                success: true,
                data: {
                    goal: goal.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en getGoalById: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    } ,


    async getGoalByUser (req,res) {
        try {
            const userId = req.user.userId
            const goals = await Goal.findByUserId(userId)

            if (!goals || goals.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron ahorros para este usuario.',
                    data: {
                        goals: [],
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    goals: goals.map(goal => goal.toJSON()),
                    count: goals.length
                }
            })
        }
        catch (error) {
            console.log('Error en getGoalByUser: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getGoalByState (req,res) {
        try {
            const userId = req.user.userId
            const { estado } = req.query

            if(!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado de ahorro es requerido.'
                })
            }

            if(estado !== "activo" && estado !== "cancelado" && estado !== "completado"){
                return res.status(400).json({
                    success: false,
                    message: 'El estado debe ser "activo" - "cancelado" - "completado".'
                })
            }

            const goals = await Goal.findByState(userId, estado)

            if (!goals || goals.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron ahorros para este usuario.',
                    data: {
                        goals: [],
                        estado: estado,
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    goals: goals.map(goal => goal.toJSON()),
                    estado: estado,
                    count: goals.length
                }
            })
        }
        catch (error) {
            console.log('Error en getGoalByState: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getGoalByName (req, res) {
        try {
            const userId = req.user.userId
            const { nombre } = req.query
            
            if(!nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del ahorro es requerido.'
                })
            }

            const goal = await Goal.findByName(userId, nombre)

            if(!goal) {
                return res.status(400).json({
                    success: false,
                    message: 'No se encontro ningun ahorro con ese nombre.'
                })
            }

            res.json({
                success: true,
                data: {
                    goal: goal.map(goal => goal.toJSON())
                }
            })
        }
        catch (error) {
            console.log('Error en getGoalByName: ', error);
            res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    // =========================
    // 📦 CONTRIBUCIONES
    // =========================

    // Crear contribución
    async addContribution (req, res) {
        try {
            const { goal_id, monto } = req.body;
            const usuario_id = req.user.userId;

            if (!goal_id || !monto) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar el goal_id y el monto.'
                });
            }

            if (monto <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El monto debe ser mayor a cero.'
                });
            }

            const goal = await Goal.findById(goal_id);

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado.'
                });
            }

            if (goal.usuario_id !== usuario_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar este ahorro.'
                });
            }

            await Goal.addContribution(goal_id, monto);

            res.status(201).json({
                success: true,
                message: 'Contribución agregada exitosamente.',
                data: {
                    monto: monto
                }
            });
        } catch (error) {
            console.error('Error en addContribution:', error);
            res.status(500).json({
            success: false,
            message: error.message || 'Error interno del servidor.'
            });
        }
    },


    // Eliminar una contribución
    async deleteContribution(req, res) {
        try {
            const { goal_id, nro_contribution } = req.params;
            const userId = req.user.userId
            
            if (!goal_id || !nro_contribution) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar el ID del ahorro y el número de contribución.'
                });
            }

            const goal = await Goal.findById(goal_id);
            if (!goal) {
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado.'
                });
            }

            if (goal.usuario_id !== userId) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'No tienes permisos para eliminar este ahorro.' 
                });
            }

            const contribution = await GoalContribution.findByGoalAndNumber(goal_id, nro_contribution);
            if (!contribution) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Contribución no encontrada.' 
                });
            }

            await GoalContribution.delete(goal_id, nro_contribution);

            res.json({ 
                success: true, 
                message: 'Contribucion eliminada exitosamente.',
                deletedContribution: contribution
            });
        } catch (error) {
            console.log('Error en deleteContribution:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno en el servidor.'
            });
        }
    } ,


    // Obtener todas las contribuciones de un ahorro
    async getContributionsByGoal (req, res) {
        try {
            const { goal_id } = req.params;
            const usuario_id = req.user.userId;

            const goal = await Goal.findById(goal_id);
            if (!goal) {
                return res.status(404).json({
                    success: false,
                    message: 'Ahorro no encontrado.'
                });
            }

            if (goal.usuario_id !== usuario_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver las contribuciones de este ahorro.'
                });
            }

            const contributions = await GoalContribution.findByContribution(goal_id);
            const total = contributions.reduce((acc, c) => acc + parseFloat(c.monto), 0);


            res.json({
                success: true,
                data: {
                    contributions: contributions.map(c => c.toJSON())
                },
                count: contributions.length,
                total
            });
        } catch (error) {
            console.error('Error en getContributionsByGoal:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor.'
            });
        }
    }
}

export default goalsControllers;