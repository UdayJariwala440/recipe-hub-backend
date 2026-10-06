import express from "express";
import { register, requestLogin, verifyLogin } from "./auth.controller.js";
import {
  registerSchema,
  loginRequestSchema,
  loginVerifySchema,
} from "./auth.validation.js";
import { validate } from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login/request", validate(loginRequestSchema), requestLogin);
router.post("/login/verify", validate(loginVerifySchema), verifyLogin);

export default router;
