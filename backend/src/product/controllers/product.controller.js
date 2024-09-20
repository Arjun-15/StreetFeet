// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const queryCopy = { ...req.query };

    // 1. Search functionality (e.g., searching by product name)
    if (req.query.search) {
      queryCopy.name = {
        $regex: req.query.search, // Use regex for partial matching
        $options: "i", // Case-insensitive search
      };
    }

    // 2. Filter functionality (e.g., filtering by category, price range)
    if (req.query.category) {
      queryCopy.category = req.query.category;
    }

    // Handle price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      queryCopy.price = {};
      if (req.query.minPrice) {
        queryCopy.price.$gte = Number(req.query.minPrice); // Greater than or equal to minPrice
      }
      if (req.query.maxPrice) {
        queryCopy.price.$lte = Number(req.query.maxPrice); // Less than or equal to maxPrice
      }
    }

    // 3. Pagination functionality
    const page = Number(req.query.page) || 1; // Default to page 1 if not provided
    const limit = Number(req.query.limit) || 10; // Default to 10 products per page
    const skip = (page - 1) * limit; // Skip products for previous pages

    // Get the total number of products (for pagination)
    const totalProducts = await getTotalCountsOfProduct(queryCopy);

    let products;
    // Fetch products with filtering and pagination
    if(totalProducts <= 9){
     products = await getAllProductsRepo(queryCopy)
    }
    else{
     products = await getAllProductsRepo(queryCopy)
      .limit(limit)
      .skip(skip);
    }

    res.status(200).json({
      success: true,
      totalProducts,
      products,
      page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.query;

    // Ensure both productId and reviewId are provided in the query
    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(
          400,
          "Please provide productId and reviewId as query params"
        )
      );
    }

    // Find the product based on productId
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }

    // Get all reviews of the product
    const reviews = product.reviews;

    // Find the index of the review to be deleted
    const isReviewExistIndex = reviews.findIndex((rev) => {
      return rev._id.toString() === reviewId.toString();
    });

    // If the review doesn't exist, throw an error
    if (isReviewExistIndex < 0) {
      return next(new ErrorHandler(400, "Review doesn't exist"));
    }

    // Remove the review from the product's reviews array
    const reviewToBeDeleted = reviews[isReviewExistIndex];
    reviews.splice(isReviewExistIndex, 1);

    // Recalculate the product's average rating based on remaining reviews
    let avgRating = 0;
    reviews.forEach((rev) => {
      avgRating += rev.rating;
    });

    const updatedRatingOfProduct =
      reviews.length === 0 ? 0 : avgRating / reviews.length;

    product.rating = updatedRatingOfProduct;

    // Save the updated product with the new reviews and rating
    await product.save({ validateBeforeSave: false });

    // Respond with success and details of the deleted review
    res.status(200).json({
      success: true,
      msg: "Review deleted successfully",
      deletedReview: reviewToBeDeleted,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
