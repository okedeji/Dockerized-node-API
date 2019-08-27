import { Router } from 'express';
import ShoppingCartController from '../../controllers/shoppingCart.controller';
import { getToken } from "../../controllers/helpers/auth.helper"

const router = Router();
router.get('/shoppingcart/generateUniqueId', getToken, ShoppingCartController.generateUniqueCart);
router.post('/shoppingcart/add', getToken, ShoppingCartController.addItemToCart);
router.get('/shoppingcart/:cart_id', getToken, ShoppingCartController.getCart);
router.put('/shoppingcart/update/:item_id', getToken, ShoppingCartController.updateCartItem);
router.delete('/shoppingcart/empty/:cart_id', getToken, ShoppingCartController.emptyCart);
router.delete('/shoppingcart/removeProduct/:item_id', getToken, ShoppingCartController.removeItemFromCart);

router.post('/orders', getToken, ShoppingCartController.createOrder);
router.get('/orders/inCustomer', getToken,  ShoppingCartController.getCustomerOrders);
router.get('/orders/:order_id', getToken, ShoppingCartController.getOrderSummary);

router.post('/stripe/charge', getToken, ShoppingCartController.processStripePayment);

export default router;
