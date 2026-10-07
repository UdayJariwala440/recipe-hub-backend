import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { getAdminData, getCurrentUser } from "./user.controller.js";

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);
router.get("/admin", authenticate, authorize("admin"), getAdminData);
export default router;
