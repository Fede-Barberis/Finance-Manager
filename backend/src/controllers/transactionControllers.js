import Transaction from "../models/Transactions.js";
import { validarRangoFechas } from "../utils/dataValidator.js";

const transactionControllers = {

    async createTransaction (req,res) {
        try {
            const { tipo, descripcion, monto, fecha, categoria_id } = req.body

            if(!tipo || !descripcion || !monto || !fecha || !categoria_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios.'
                })
            }

            const transactionData = {
                tipo, 
                descripcion: descripcion || null, 
                monto, 
                fecha,
                categoria_id, 
                usuario_id: req.user.userId
            }

            const newTransaction = await Transaction.create(transactionData)
            res.status(201).json({
                success: true,
                message: 'Transaccion creada exitosamente.',
                data: {
                    transaction : newTransaction.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en createTransaction: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async updateTransaction (req,res) {
        try {
            const transactionId = req.params.id
            const userId = req.user.userId

            const transaction = await Transaction.findById(transactionId)

            if(!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaccion no encontrada'
                })
            }

            if(transaction.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar esta transaccion.'
                });
            }

            if(!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionaron datos para actualizar.'
                })
            }

            const updateTransaction = await transaction.update(req.body)

            res.json({
                success: true,
                message: 'Transaccion actualizada exitosamente.',
                data: {
                    transaction: updateTransaction.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en updateTransaction: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async deleteTransaction (req,res) {
        try {
            const transactionId = req.params.id
            const userId = req.user.userId

            const transaction = await Transaction.findById(transactionId)

            if(!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaccion no encontrada'
                })
            }

            if(transaction.usuario_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar esta transaccion'
                });
            }

            await transaction.delete()

            res.json({
                success: true,
                message: 'Transaccion eliminada exitosamente.',
            })
        }
        catch (error) {
            console.log('Error en deleteTransaction: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTransactionById (req,res) {
        try {
            const { id }  = req.params 
            
            if(!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de transaccion requerido.'
                })
            }

            const transaction = await Transaction.findById(id)

            if(!transaction){
                return res.status(404).json({
                    success: false,
                    message: 'Transaccion no encontrada.'
                })
            }

            if(transaction.usuario_id !== req.user.userId){
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta transaccion'
                })
            }

            res.json({
                success: true,
                data: {
                    transaction: transaction.toJSON()
                }
            })
        }
        catch (error) {
            console.log('Error en getTransactionById: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    } ,

    async getTransactionsByUser (req,res) {
        try {
            const userId = req.user.userId
            
            const transactions = await Transaction.findByUserId(userId)

            if (!transactions || transactions.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron transacciones para este usuario.',
                    data: {
                        transactions: [],
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    transaction: transactions.map(trans => trans.toJSON()),
                    count: transactions.length
                }
            })
        }
        catch (error) {
            console.log('Error en getTransactionByUser: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTransactionsByUserAndType (req,res) {
        try {
            const userId = req.user.userId
            const { tipo } = req.query

            if(!tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de transaccion es requerido.'
                })
            }

            if(tipo !== 'ingreso' && tipo !== 'gasto') {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo deber ser "Ingreso" o "Gasto".'
                })
            }

            const transactions = await Transaction.findByUserAndType(userId, tipo)

            if (!transactions || transactions.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron transacciones para este usuario.',
                    data: {
                        transactions: [],
                        tipo: tipo,
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    transaction: transactions.map(trans => trans.toJSON()),
                    tipo: tipo,
                    count: transactions.length
                }
            })
        }
        catch (error) {
            console.log('Error en getTransactionsByUserAndType: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTransactionsByUserAndCategory (req,res) {
        try {
            const userId = req.user.userId
            const { categoria_id } = req.query

            if(!categoria_id) {
                return res.status(400).json({
                    success: false,
                    message: 'El id de la categoria es requerido.'
                })
            }

            const transactions = await Transaction.findByUserAndCategory(userId, categoria_id)

            if (!transactions || transactions.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron transacciones para este usuario.',
                    data: {
                        transactions: [],
                        category: categoria_id,
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    transaction: transactions.map(trans => trans.toJSON()),
                    category: categoria_id,
                    count: transactions.length
                }
            })
        }
        catch (error) {
            console.log('Error en getTransactionsByUserAndCategory: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTransactionsByDateRange (req,res) {
        try {
            const userId = req.user.userId
            const { fechaInicio, fechaFin } = req.query

            // Validar rango de fechas
            const validacion = validarRangoFechas(fechaInicio, fechaFin);
            if (!validacion.valido) {
                return res.status(400).json({ 
                    success: false, 
                    message: validacion.mensaje 
                });
            }

            const transactions = await Transaction.findByDateRange(userId, fechaInicio, fechaFin)

            if (!transactions || transactions.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron transacciones para este usuario.',
                    data: {
                        transactions: [],
                        fechaInicio: fechaInicio,
                        fechaFin: fechaFin,
                        count: 0
                    }
                })
            }

            res.json({
                success: true,
                data: {
                    transaction: transactions.map(trans => trans.toJSON()),
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    count: transactions.length
                }
            })
        }
        catch (error) {
            console.log('Error en getTransactionsByDateRange: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTotalByUser (req,res) {
        try {

        }
        catch (error) {
            console.log('Error en createTranscation: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getTotalByUserAndType (req,res) {
        try {

        }
        catch (error) {
            console.log('Error en createTranscation: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },


    async getMonthlyBalance (req,res) {
        try {

        }
        catch (error) {
            console.log('Error en createTranscation: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno en el servidor.'
            })
        }
    },
}


export default transactionControllers