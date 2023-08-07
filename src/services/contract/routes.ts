import { Request, Response, Router } from 'express';
import validateEmailAndPhoneNumber from "./middleware"

const router = Router();

router.post('/identify', validateEmailAndPhoneNumber, (req: Request, res: Response) => {
    res.status(500).json({ message: 'Route is not yet implemented' });
});

export default router;