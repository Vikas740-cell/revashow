const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();
const prisma = require('./config/db');
const PORT = process.env.PORT || 5000;

const bcrypt = require('bcryptjs');

// Auto-create initial admin
const createInitialAdmin = async () => {
  try {
    const email = 'vikas@reva.edu.in';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('qwertyui', 10);
      await prisma.user.create({
        data: {
          email,
          name: 'Vikas Admin',
          password: hashedPassword,
          role: 'ADMIN',
          srn: 'ADMIN-001'
        }
      });
      console.log('✅ Initial admin created successfully');
    }
  } catch (error) {
    console.error('❌ Failed to create initial admin:', error.message);
  }
};

createInitialAdmin();

app.use(cors());
app.use(express.json());

// Request & Error Logging
app.use(morgan('dev'));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RevaShow Backend is running' });
});

// Production Deploy Setup (Optional monolithic serving)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
