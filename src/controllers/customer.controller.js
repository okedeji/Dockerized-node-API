/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update their address info
 * - updateCreditCard - allow customers to update their credit card number
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import uniqid from "uniqid";
import { Customer } from '../database/models';
// import { decode } from "punycode";
import passport from "passport";
/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async create(req, res, next) {
    try {
      let {name, email , password} = req.body,
          params = {name, email, password};

      const done = await Customer.create(params),
            customer = await Customer.findByPk(done.customer_id);
      
      return res.status(201).json(Object.assign({ customer: customer.getSafeDataValues() }, customer.signToken({
        email: customer.email,
        name: customer.name,
        customer_id: customer.customer_id
      })))

    } catch (error) {
      next(error)
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    try {
      let {email, password} = req.body;

      Customer.findOne({
        where: {email}
      })
        .then((customer) => {
          if(!customer) res.json({msg: "no customer with this email"})
          else if(!customer.validatePassword(password)) res.json({msg: "Password Incorrect"})
          else res.status(200).json(Object.assign({ customer: customer.getSafeDataValues()}, customer.signToken({
            email, 
            name: customer.name,
            customer_id: customer.customer_id
          })))
        })
        .catch(err => next(err))
    } catch (error) {
      next(error)
    }

  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    try {
      let decoded = res.locals.decoded,
          customer_id = decoded.customer_id; 

      const customer = await Customer.findByPk(customer_id);

      return res.status(200).json({
        customer : customer.getSafeDataValues()
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    try {
      let decoded = res.locals.decoded,
          customer_id = decoded.customer_id; 

      const preCustomer = await Customer.findByPk(customer_id);
      
      let {name, email, day_phone, eve_phone, mob_phone} = req.body;

      name = name || preCustomer.name
      day_phone = day_phone || preCustomer.dev_phone
      eve_phone = eve_phone || preCustomer.eve_phone
      mob_phone = mob_phone || preCustomer.mob_phone 

      await Customer.update({name, day_phone, eve_phone, mob_phone}, { where: { email }})

      const postCustomer = await Customer.findByPk(customer_id);

      return res.status(200).json(postCustomer.getSafeDataValues())
    } catch (error) {
      next(error)
    }
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    // write code to update customer address info such as address_1, address_2, city, region, postal_code, country
    // and shipping_region_id

    try {
      let decoded = res.locals.decoded,
          customer_id = decoded.customer_id; 

      const preCustomer = await Customer.findByPk(customer_id);
      
      let {address_1, address_2, city, region, postal_code, country, shipping_region_id} = req.body;

      address_1 = address_1 || preCustomer.address_1
      address_2 = address_2 || preCustomer.address_2
      city = city || preCustomer.city
      region = region || preCustomer.region 
      postal_code = postal_code || preCustomer.postal_code 
      country = country || preCustomer.country 
      shipping_region_id = shipping_region_id || preCustomer.shipping_region_id 

      await Customer.update({address_1, address_2, city, region, country, postal_code, shipping_region_id}, { where: { customer_id }})

      const postCustomer = await Customer.findByPk(customer_id);

      return res.status(200).json(postCustomer.getSafeDataValues())
    } catch (error) {
      next(error)
    }
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    try {
      let decoded = res.locals.decoded,
          customer_id = decoded.customer_id; 

      const preCustomer = await Customer.findByPk(customer_id);
      
      let { credit_card } = req.body;
      if(credit_card != undefined || credit_card != "") {
        credit_card = Array(credit_card.replace(/[^\d]/g, "").length - 3).join("x") + credit_card.substr(credit_card.length - 4)
      }else preCustomer.credit_card

      await Customer.update({ credit_card }, { where: { customer_id }})

      const postCustomer = await Customer.findByPk(customer_id);

      return res.status(200).json(postCustomer.getSafeDataValues())
    } catch (error) {
      next(error)
    }
  }

  /**
   * login with Facebook
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with customer data and access token
   * @memberof CustomerController
   */
  static async facebook(req, res, next) {
    passport.authenticate("facebook-token", {session:false}, async (err, user, info) => {
      try {
        if(err){
          if (err.name === "InternalOAuthError") res.json({msg: "facebook token expired or incorrect"})
          else next(err) 
        }else{
          let {name, email} = user,
              params = { name, email, password: "facebookAuth"},
              customer;

          const preCustomer = await Customer.findOne({where: {name, email}})

          if(preCustomer)customer = preCustomer
          else{
            const done = await Customer.create(params);
            customer = await Customer.findByPk(done.customer_id);
          }
          
          return res.status(201).json(Object.assign({ customer: customer.getSafeDataValues() }, customer.signToken({
            email: customer.email,
            name: customer.name,
            customer_id: customer.customer_id
          })))
        }
      } catch (error) {
        next(error)
      }
    })(req, res, next);
  }
}

export default CustomerController;
