import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export const login = async(req, res) => {
    const {username, password} = req.body;
    
    if(username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD){
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({username: ADMIN_USERNAME, role: 'admin' },
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );

    res.json({
        token, 
        user: {username: ADMIN_USERNAME}
    })
}