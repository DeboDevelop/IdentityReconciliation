import { Request, Response, Router } from 'express';

const router = Router();

router.post('/identify', (req: Request, res: Response) => {
    res.status(500).json({ message: 'Route is not yet implemented' });
});

export default router;