import pool from '../config/db.js'

export const getNotificationsByUser = async(req, res) => {
    const user_id = req.params.user_id;
    try {
        const [rows] = await pool.query(
            "SELECT * from notifications WHERE user_id = ? ORDER BY created_at DESC", [user_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({message: "Error fetching notifications", error: error.message})        
    }
}

export const markNotificationAsRead = async(req, res) => {
    const {id} = req.params;
    try {
        await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    } catch (error) {
        res.status(500).json({message: "Error updating notification", error: error.message})
    }
}

export const createNotification = async(req, res) => {
    const {user_id, message} = req.body;
    try {
        await pool.query("INSERT INTO notifications (user_id, message) VALUES (?,?)", [user_id, message])
        res.status(201).json({message: "Notification created"});
    } catch (error) {
        res.status(500).json({message: "Error creating notification", error: error.message});
    }
}

export const readNotifications = async(req, res) => {
    const user_id = req.params.user_id;
    try {
        await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [user_id]);
    } catch (error) {
        res.status(500).json({message: "Error updating notifications", error: error.message})
    }
}