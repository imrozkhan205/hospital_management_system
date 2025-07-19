import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from '../routes/auth.route.js'
import doctorRoutes from '../routes/doctor.route.js'
import patientRoutes from '../routes/patient.route.js'
import appointmentRoutes from '../routes/appointment.route.js'
import departmentroutes from '../routes/department.route.js'
import dashboardRoutes from '../routes/dashboard.route.js'
import medicalRecordsRoutes from '../routes/medicalRecord.route.js'
import userRoutes from '../routes/user.route.js'
import notificationRoutes from '../routes/notifications.route.js'

dotenv.config();
const app = express()
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/departments', departmentroutes)
app.use('/dashboard', dashboardRoutes)
app.use('/api/medical-records', medicalRecordsRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
})