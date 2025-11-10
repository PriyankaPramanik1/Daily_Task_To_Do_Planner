import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDb } from './app/config/dbConnect';

import { router } from './app/router/userRoutes';
import { taskRouter } from './app/router/taskRoutes';
import { categoryRouter } from './app/router/categoryRoutes';
import { labelRouter } from './app/router/labelRoutes';
import { reminderRouter } from './app/router/reminderRoutes';
import { reposrRouter } from './app/router/reportRoutes';

const app = express();
const PORT = process.env.PORT || 8300;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// app.use(createDefaultRoles);

app.use(router)
app.use(taskRouter)
app.use(categoryRouter)
app.use(labelRouter)
app.use(reminderRouter)
app.use(reposrRouter)

connectDb.then(() => {
    app.listen(process.env.PORT, () => console.log(`Server is listening on port http://localhost:${process.env.PORT}`))
});
