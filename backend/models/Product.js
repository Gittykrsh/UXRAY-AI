import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    category: String,
    stock: { type: Number, default: 100 },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model("Product", productSchema);
export default Product;
