const mongoose = require('mongoose');

const express = require('express');

const path = require('path');

require('dotenv').config();

const userRouter = require('./Routes/userRoutes');



mongoose.set('strictQuery', true);

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log('MongoDB connected...');
    })
    
const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'), { index: 'register.html'}));

app.use('',userRouter);

//app.use(cors(corsOptions));  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Click here to access http://localhost:${PORT}`);
});