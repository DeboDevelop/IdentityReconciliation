import { Request, Response, NextFunction } from 'express';
import Joi from '@hapi/joi';

const schema = Joi.object({
    email: Joi.string().email().allow(null),
    phoneNumber: Joi.string().pattern(/^\d+$/).allow(null),
});

const validateEmailAndPhoneNumber = (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    if(req.body.email === null && req.body.phoneNumber === null) {
        return res.status(400).json({ error: 'Both Email and phoneNumber can\'t be null' });
    }

    next();
};

export default validateEmailAndPhoneNumber;
