import OrderModel from "./order.schema.js";

// Create a new order
export const createNewOrderRepo = async (data) => {
  try {
    const newOrder = await OrderModel.create(data);
    return newOrder;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get order by ID
export const getOrderByIdRepo = async (orderId) => {
  try {
    const order = await OrderModel.findById(orderId).populate("user", "name email");
    return order;
  } catch (error) {
    throw new Error("Order not found");
  }
};

// Get orders by user ID
export const getOrdersByUserRepo = async (userId) => {
  try {
    const orders = await OrderModel.find({ user: userId });
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all placed orders
export const getAllPlacedOrdersRepo = async () => {
  try {
    const orders = await OrderModel.find({ orderStatus: "Placed" });
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update order by ID
export const updateOrderByIdRepo = async (orderId, data) => {
  try {
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, data, { new: true });
    return updatedOrder;
  } catch (error) {
    throw new Error("Order update failed");
  }
};
