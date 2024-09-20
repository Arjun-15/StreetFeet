// Please don't change the pre-written code
import {
  createNewOrderRepo,
  getOrderByIdRepo,
  getOrdersByUserRepo,
  getAllPlacedOrdersRepo,
  updateOrderByIdRepo,
} from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  try {
    // Get order details from request body
    const {
      shippingInfo,
      orderedItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // Make sure required fields are present
    if (!orderedItems || orderedItems.length === 0) {
      return next(new ErrorHandler(400, "No items in the order"));
    }

    // Create new order data structure
    const orderData = {
      shippingInfo,
      orderedItems,
      user: req.user._id, // Assumes user is authenticated and attached to req
      paymentInfo,
      paidAt: Date.now(),
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    // Call repository function to create the new order
    const newOrder = await createNewOrderRepo(orderData);

    // Send a response with the newly created order
    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    return next(new ErrorHandler(500, "Error creating order"));
  }
};

// Get order by ID
export const getbyorderId = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await getOrderByIdRepo(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orders by user
export const getbyorders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserRepo(userId);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all placed orders
export const allPlacedOrders = async (req, res) => {
  try {
    const orders = await getAllPlacedOrdersRepo();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order by ID
export const updatebyorderid = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedData = req.body;
    const updatedOrder = await updateOrderByIdRepo(orderId, updatedData);
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
