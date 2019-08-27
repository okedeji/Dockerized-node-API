/**
 * Check each method in the shopping cart controller and add code to implement
 * the functionality or fix any bug.
 * The static methods and their function include:
 * 
 * - generateUniqueCart - To generate a unique cart id
 * - addItemToCart - To add new product to the cart
 * - getCart - method to get list of items in a cart
 * - updateCartItem - Update the quantity of a product in the shopping cart
 * - emptyCart - should be able to clear shopping cart
 * - removeItemFromCart - should delete a product from the shopping cart
 * - createOrder - Create an order
 * - getCustomerOrders - get all orders of a customer
 * - getOrderSummary - get the details of an order
 * - processStripePayment - process stripe payment
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
require('dotenv').config();
import uniqid from "uniqid";
import { ShoppingCart, Product, Order, OrderDetail, Shipping, Tax, Customer} from '../database/models';
import mailCustomer from "./helpers/mail.helper";
import { mailer } from "../config/config"
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
 
/**
 *
 *
 * @class shoppingCartController
 */
class ShoppingCartController {
  /**
   * generate random unique id for cart identifier
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart_id
   * @memberof shoppingCartController
   */
  static generateUniqueCart(req, res, next) {
    try {
      const cart_id = uniqid("cart_");
      return res.status(200).json({cart_id});

    } catch (error) {
      next(error)
    }
  }

  /**
   * adds item to a cart with cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async addItemToCart(req, res, next) {
    try {
      let { cart_id, product_id, attributes, quantity } = req.body;

      ShoppingCart.create({ cart_id, product_id, attributes, quantity })
        .then(shoppingCart => {
          ["buy_now", "added_on"].forEach(el => delete shoppingCart.dataValues[el]);

          return res.status(200).json(shoppingCart);
        })
        .catch(err => next(err))

    } catch (error) {
      next(error)
    }
  }

  /**
   * get shopping cart using the cart_id
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async getCart(req, res, next) {
    try {
      const cart_id = req.params.cart_id;

      const shoppingCart = await ShoppingCart.findAll({
        where: { cart_id },
        attributes: {
          exclude: ["buy_now", "added_on"]
        },
        include: {
          model: Product,
          required: true,
          attributes: {
            exclude: ["product_id", "description", "image_2", "thumbnail", "display"]
          }
        }
      })

      const formattedCart = shoppingCart.map(el => {
        /* 
        I assume the following because it wasn't stated in the docs:
        ** discounted_price == Price after percentage discount deducted
        ** subtotal == (price || discounted_price) * quantity 
        */

        let subtotal;
        if(el.Product.discounted_price !== "0.00"){
          subtotal = parseFloat(el.Product.discounted_price) * el.quantity;
        }else{
          subtotal = parseFloat(el.Product.price) * el.quantity;
        }
        return {
          "item_id" : el.item_id,
          "cart_id" : el.cart_id,
          "name" : el.Product.name,
          "attributes" : el.attributes,
          "product_id" : el.product_id,
          "image" : el.Product.image,
          "price" : el.Product.price,
          "discounted_price" : el.Product.discounted_price,
          "quantity" : el.quantity,
          "subtotal" : subtotal, 
        }
      })

      return res.status(200).json(formattedCart);
    } catch (error) {
      next(error)
    }
  }

  /**
   * update cart item quantity using the item_id in the request param
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async updateCartItem(req, res, next) {
    try {
      const { item_id } = req.params; // eslint-disable-line
      const { quantity } = req.body;

      await ShoppingCart.update({quantity}, {
        where: { item_id }
      })

      const shoppingCart = await ShoppingCart.findOne({
        where: {item_id},
        attributes: {
          exclude: ["buy_now", "added_on"]
        }
      })

      return res.status(200).json(shoppingCart);
    } catch (error) {
      next(error)
    }
  }

  /**
   * removes all items in a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with cart
   * @memberof ShoppingCartController
   */
  static async emptyCart(req, res, next) {
    try {
      const { cart_id } = req.params;

      await ShoppingCart.destroy({
        where: { cart_id }
      })

      const shoppingCart = await ShoppingCart.findAll({})

      return res.status(200).json(shoppingCart);
    } catch (error) {
      next(error)
    }
  }

  /**
   * remove single item from cart
   * cart id is obtained from current session
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with message
   * @memberof ShoppingCartController
   */
  static async removeItemFromCart(req, res, next) {
    try {
      const { item_id } = req.params;

      await ShoppingCart.destroy({
        where: { item_id }
      })

      return res.status(200).json({message: "Item successfully deleted"})

    } catch (error) {
      return next(error);
    }
  }

  /**
   * create an order from a cart
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with created order
   * @memberof ShoppingCartController
   */
  static async createOrder(req, res, next) {
    try {
      const { cart_id, shipping_id, tax_id } = req.body;
      const customer_id = res.locals.decoded.customer_id;
      let total_amount = 0;

      const shoppingCart = await ShoppingCart.findAll({ // get all items in the shopping_cart table with the cart_id
        where: { cart_id },
        attributes: {
          exclude: ["buy_now", "added_on", "cart_id"]
        },
        include: {
          model: Product,
          required: true,
          attributes: {
            exclude: ["product_id", "description", "image", "image_2", "thumbnail", "display"]
          }
        }
      })

      const shipping = await Shipping.findOne({  where: { shipping_id } }) // Query the shipping table to get shipping_cost

      const tax = await Tax.findOne({ where: { tax_id } }) // Query the Tax table to get the tax_percentage

      const getSubtotal = (discounted_price, price, quantity) => { // helper function to calculate subtotal for each items
        if(discounted_price !== "0.00") return  parseFloat(discounted_price) * quantity
        else return parseFloat(price) * quantity
      }
      const getUnitPrice = (discounted_price, price) => { // helper function to calculate unit_price for each items
        if(discounted_price !== "0.00") return discounted_price
        else return price
      }

      shoppingCart.forEach(el => { // loop through all items to get the total_amount of all items
        let subtotal = getSubtotal(el.Product.discounted_price, el.Product.price, el.quantity);
        total_amount += subtotal
      })

      // format the total_amount by adding the shipping_cost and the tax_percentage
      let totalPlusShip = (parseFloat(total_amount) + parseFloat(shipping.shipping_cost));
      let taxPercent = (tax.tax_percentage/100) * totalPlusShip;
      total_amount = Math.round(((totalPlusShip + taxPercent) + 0.00001) * 100) / 100;

      await Order.create({shipping_id, tax_id, customer_id, total_amount})  // create the Order instance in the Order table

      const order = await Order.findOne({ where : {shipping_id, tax_id, customer_id, total_amount} }) // get back the just created Order instance 

      const orderDetails = shoppingCart.map(el => { //format orderDetails from all items from shoppingCart and order number from created order
        let unit_price = getUnitPrice(el.Product.discounted_price, el.Product.price);
        
        return {
          "order_id" : order.order_id,
          "item_id" : el.item_id,
          "product_name" : el.Product.name,
          "attributes" : el.attributes,
          "product_id" : el.product_id,
          "unit_cost" : unit_price,
          "quantity" : el.quantity,
        }
      })

      await OrderDetail.bulkCreate(orderDetails) // persist all items in the OrderDetails table
      
      return res.status(201).json({order_id: order.order_id}) // respond with the order_id

    } catch (error) {
      return next(error);
    }
  }

  /**
   * returns a list of orders placed by a customer.
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with customer's orders
   * @memberof ShoppingCartController
   */
  static async getCustomerOrders(req, res, next) {
    try {
      const { customer_id } = res.locals.decoded;  // eslint-disable-line
      
      const order = await Order.findAll({
        where: { customer_id },
        include: {
          model: Customer,
          required: true,
        }
      })

      const formattedOrder = order.map(el => {
        return {
          "order_id" : el.order_id,
          "total_amount" : el.total_amount,
          "created_on" : el.created_on,
          "shipped_on" : el.shipped_on, 
          "name" : el.Customer.name, 
        }
      })

      return res.status(200).json(formattedOrder)
      
    } catch (error) {
      return next(error);
    }
  }

  /**
   *
   *
   * @static
   * @param {obj} req express request object
   * @param {obj} res express response object
   * @returns {json} returns json response with order summary
   * @memberof ShoppingCartController
   */
  static async getOrderSummary(req, res, next) {
    try {
      const { order_id } = req.params;  // eslint-disable-line

      const order = await Order.findOne({
        where: { order_id },
        attributes: {
          exclude: ["total_amount", "created_on", "shipped_on", "status", "comments", "customer_id", "auth_code", "reference", "shipping_id", "tax_id"]
        },
        include: {
          model: OrderDetail,
          as: "orderItems",
          required: true,
          attributes: {
            exclude: ["item_id", "order_id"]
          },
        }
      })

      const eachItem = order.orderItems.map(el => {
        let subtotal = (Math.round(((el.unit_cost * el.quantity) + 0.00001) * 100) / 100).toString()
        Object.assign(el.dataValues, {subtotal});
        return el;
      })

      return res.status(200).json({
        order_id: order.order_id,
        orderItems: eachItem
      })


    } catch (error) {
      return next(error);
    }
  }

  /**
   * @static
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async processStripePayment(req, res, next) {
    
    try {
      const { email, stripeToken, order_id, description, amount } = req.body;
      const { customer_id, name } = res.locals.decoded;
      
      const order = await Order.findOne({ where: { customer_id } })

      let pay = async () => {
          await stripe.charges.create({
              amount: Math.round(parseFloat(order.total_amount)), 
              currency: 'usd',
              description: description,
              source: stripeToken,
          });
      }

      pay().then(() => {
        Order.update({status: 1},{ // I assume 1 means paid in the status column on the Order table
          where: { order_id, customer_id }
        })
          .then((order) => {
            mailCustomer(mailer, email, name).then((sent) => {
              res.json({"message": `Payment successfull and ${sent}`})
            }).catch(err => next(err))
          })
        
        
         
      }).catch((err) => {
          next(err)
      })
    } catch (error) {
      return next(error);
    }
  }
}

export default ShoppingCartController;
