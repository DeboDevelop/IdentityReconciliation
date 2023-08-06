require('dotenv').config({ path: __dirname+'/.env' });
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.json('Hello World!!!');
});

app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
});
