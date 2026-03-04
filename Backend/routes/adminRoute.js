import express from "express";
import authAdmin from "../middleware/authAdmin.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import {
  addlawyer,
  adminLogin,
  getAllLawyers,
  getAllAppointments,
  cancelAppointmentByAdmin,
  adminDashboard,
  refreshAdminAccessToken,
  logoutAdmin,
  changeAvailability,
} from "../controllers/adminController.js";
import { upload } from "../middleware/multer.js";
const AdminRouter = express.Router();

AdminRouter.post("/add-lawyer", authAdmin, upload.single("image"), addlawyer);

AdminRouter.post("/login", rateLimiter(5, 60), adminLogin);
AdminRouter.post("/refresh", refreshAdminAccessToken);
AdminRouter.post("/logout", logoutAdmin);
AdminRouter.get("/all-lawyers", authAdmin, getAllLawyers);
AdminRouter.get("/all-appointments", authAdmin, getAllAppointments);
AdminRouter.post("/cancel-appointment", authAdmin, cancelAppointmentByAdmin);
AdminRouter.get("/dashboard", authAdmin, adminDashboard);
AdminRouter.post("/change-availability", authAdmin, changeAvailability);

export default AdminRouter;
