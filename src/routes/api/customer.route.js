import { Router } from 'express';
import CustomerController from '../../controllers/customer.controller';
import { getToken } from "../../controllers/helpers/auth.helper";

const router = Router();

router.route("/customers").post(CustomerController.create);
router.route("/customers/login").post(CustomerController.login);
router.route("/customers").get(getToken, CustomerController.getCustomerProfile)
router.route("/customer").put(getToken, CustomerController.updateCustomerProfile)
router.route("/customer/address").put(getToken, CustomerController.updateCustomerAddress)
router.route("/customer/creditCard").put(getToken, CustomerController.updateCreditCard)
router.route("/customers/facebook").post(CustomerController.facebook)

export default router;