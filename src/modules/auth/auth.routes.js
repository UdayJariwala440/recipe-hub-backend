import express from "express";
import { register, requestLogin, verifyLogin, verifyRegistration } from "./auth.controller.js";
import {
  registerSchema,
  loginRequestSchema,
  loginVerifySchema,
  registerVerifySchema,
} from "./auth.validation.js";
import { validate } from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login/request", validate(loginRequestSchema), requestLogin);
router.post("/login/verify", validate(loginVerifySchema), verifyLogin);
router.post(
  '/register/verify',
  validate(registerVerifySchema),
  verifyRegistration
);

export default router;
