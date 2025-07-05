import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from '../routes/auth.route.js'
import doctorRoutes from '../routes/doctor.route.js'
dotenv.config();
const app = express()
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
// app.use('/api/doctors', )
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})