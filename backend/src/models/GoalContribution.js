import { pool } from '../../config/database.js'
import Goal from './Goals.js';

class GoalContribution {
    constructor(contributionData) {
        this.id = contributionData.id;
        this.goal_id = contributionData.goal_id;
        this.nro_contribution = contributionData.nro_contribution;
        this.monto = contributionData.monto;
        this.fecha = contributionData.fecha;
        this.created_at = contributionData.created_at;
    }

    //* Crear una nueva contribución
    static async create(goal_id, monto) {
        try {
            // Buscar el próximo número de contribución para este goal
            const [row] = await pool.execute(
                `SELECT IFNULL(MAX(nro_contribution), 0) + 1 AS next_num FROM goal_contributions WHERE goal_id = ?`,
                [parseInt(goal_id)]
            );

            const nextNum = row[0].next_num;

            const [result] = await pool.execute(
                `INSERT INTO goal_contributions (goal_id, nro_contribution, monto, fecha, created_at)
                VALUES (?, ?, ?, NOW(), NOW())`,
                [parseInt(goal_id), nextNum, parseFloat(monto)]
            );

            return new GoalContribution({
                id: result.insertId,
                goal_id,
                nro_contribution: nextNum,
                monto: parseFloat(monto),
                fecha: new Date(),
                created_at: new Date()
            });
            
        } catch (error) {
            throw error;
        }
    }

    //* Obtener todas las contribuciones de un ahorro
    static async findByContribution(goal_id) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY nro_contribution DESC`,
                [parseInt(goal_id)]
            );

            return rows.map(contribution => new GoalContribution(contribution));
        } catch (error) {
            throw error;
        }
    }


    //* Buscar contribución por ID
    // static async findById(nro_contribution) {
    //     try {
    //         const [rows] = await pool.execute(
    //             `SELECT * FROM goal_contributions WHERE nro_contribution = ?`,
    //             [nro_contribution]
    //         );

    //         return rows.length ? new GoalContribution(rows[0]) : null;
    //     }
    //     catch (error) {
    //         throw error
    //     }
    // }


    //* Buscar contribución por ahorro y número
    static async findByGoalAndNumber(goal_id, nro_contribution) {
        const [rows] = await pool.execute(
            `SELECT * FROM goal_contributions WHERE goal_id = ? AND nro_contribution = ?`,
            [parseInt(goal_id), parseInt(nro_contribution)]
        );

        return rows.length ? new GoalContribution(rows[0]) : null;
    }


    //* Eliminar una contribución 
    static async delete(goal_id, nro_contribution) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Buscar el ahorro
            const goal = await Goal.findById(goal_id)
            if (!goal) throw new Error('Ahorro no encontrado.');

            // Buscar la contribución
            const contribution = await GoalContribution.findByGoalAndNumber(goal_id, nro_contribution);
            if (!contribution) throw new Error('Contribución no encontrada.');
            
            // Restar el monto del ahorro
            await connection.execute(
                `UPDATE goals SET monto_actual = monto_actual - ? WHERE id = ?`,
                [parseFloat(contribution.monto), parseInt(contribution.goal_id)]
            );

            // Eliminar la contribución
            await connection.execute(
                `DELETE FROM goal_contributions WHERE goal_id = ? AND nro_contribution = ?`,
                [parseInt(goal_id), parseInt(nro_contribution)]
            );

            await connection.commit();

            return true

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }


    //* Método para convertir la instancia a JSON limpio
    toJSON() {
        return {
            goal_id: this.goal_id,
            nro_contribution: this.nro_contribution,
            monto: this.monto,
            fecha: this.fecha,
            created_at: this.created_at,
        }
    }
}

export default GoalContribution;
