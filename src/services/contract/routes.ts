import { Router } from "express";
import { identityController } from "./controller";
import validateEmailAndPhoneNumber from "./middleware";

const router = Router();

router.post("/identify", validateEmailAndPhoneNumber, identityController);

export default router;
