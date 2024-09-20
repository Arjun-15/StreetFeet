import express from "express";
import { allPlacedOrders, createNewOrder, getbyorderId, getbyorders, updatebyorderid } from "../controllers/order.controller.js";
import { auth } from "../../../middlewares/auth.js";

const router = express.Router();

router.route("/new").post(auth, createNewOrder);
router.route("/my/orders").get(auth, getbyorders);
router.route("/orders/placed").get(auth, allPlacedOrders);
router.route("/update/:id").put(auth, updatebyorderid);
router.route("/:id").get(auth, getbyorderId);

export default router;
