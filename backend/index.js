import express from 'express';
import sessionMiddleware from './middleware/sessionMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sampleUserRoutes from './routes/sampleUserRoutes.js';
import designationRoutes from './routes/designationRoutes.js';
import addressRoutes from './routes/addressRoutes.js'

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sample-users', sampleUserRoutes);
app.use('/api/designation', designationRoutes);
app.use('/api/designation', designationRoutes);
app.use('/api/address', addressRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




