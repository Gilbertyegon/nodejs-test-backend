const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // add this line
const userController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');

const URI ='mongodb+srv://bravin:Bravin041@cluster0.kft8zqp.mongodb.net/?retryWrites=true&w=majority';
mongoose.set("strictQuery", false);

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => { console.log("Successfully connected to MongoDB.") })
  .catch((error) => { console.log("Error connecting to MongoDB: " + error) });

const app = express();
app.use(express.json());
app.use(cors()); // add this line

// User Routes
app.use('/api', authRoutes);

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
