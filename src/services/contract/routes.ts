import { Router } from "express";
import { identityController } from "./controller";
import validateEmailAndPhoneNumber from "./middleware";

const router = Router();

/**
 * @swagger
 * /identify:
 *   post:
 *     summary: Get a list of connected contracts. Create Missing data.
 *     description: Retrieve a list of connected contracts records from the database and process them before returning.
 *                  If the query has new information, then create new primary or secondary contract.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string | null
 *               phoneNumber:
 *                 type: string | null
 *             example:
 *               email: "mcfly@hillvalley.edu"
 *               phoneNumber: "123456"
 *     responses:
 *       200:
 *         description: Successful response with data of connected contracts.
 *         content:
 *           application/json:
 *             example:
 *               contact:
 *                 primaryContatctId: 1
 *                 emails: ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"]
 *                 phoneNumbers: ["123456"]
 *                 secondaryContactIds: [23]
 */
router.post("/identify", validateEmailAndPhoneNumber, identityController);

export default router;
