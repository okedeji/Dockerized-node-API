/**
 * The controller defined below is the attribute controller, highlighted below are the functions of each static method
 * in the controller
 *  Some methods needs to be implemented from scratch while others may contain one or two bugs
 * 
 * - getAllAttributes - This method should return an array of all attributes
 * - getSingleAttribute - This method should return a single attribute using the attribute_id in the request parameter
 * - getAttributeValues - This method should return an array of all attribute values of a single attribute using the attribute id
 * - getProductAttributes - This method should return an array of all the product attributes
 * NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

import {Attribute, AttributeValue, ProductAttribute} from "../database/models";

class AttributeController {
  /**
   * This method get all attributes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllAttributes(req, res, next) {
    try {
      Attribute.findAll()
        .then(attributes => res.status(200).json(attributes))
        .catch(err => next(err))

    } catch (error) {
      next(error)
    }
  }

  /**
   * This method gets a single attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleAttribute(req, res, next) {
    try {
      let attribute_id = req.params.attribute_id;

      Attribute.findByPk(attribute_id)
        .then(singleAttribute => res.status(200).json(singleAttribute))
        .catch(err => next(err))

    } catch (error) {
      next(error)
    }
  }

  /**
   * This method gets a list attribute values in an attribute using the attribute id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAttributeValues(req, res, next) {
    try {
      let attribute_id = req.params.attribute_id;

      Attribute.findByPk(attribute_id, { 
        include: { 
          model: AttributeValue, 
          required: true,
          attributes: { 
            exclude: ["attribute_id"]
          }
        }
      })
        .then(attribute => res.status(200).json(attribute.AttributeValues))
        .catch(err => next(err))

    } catch (error) {
      next(error)
    }
  }

  /**
   * This method gets a list attribute values in a product using the product id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getProductAttributes(req, res, next) {
    try {
      let product_id = req.params.product_id;

      ProductAttribute.findAll({    // The query includes 3 joins ==> ProductAtribute, AttributeValue & Attribute
        where: { product_id },
        include: { 
          model: AttributeValue,
          required: true,
          include: {
            model: Attribute,
            as: "attribute_type",
            required: true,
          }
        }
      })
        .then(attribute => {
          let inProductAttributes = [];

          attribute.forEach(element => {      // Format the exposed API response
            inProductAttributes.push({
              attribute_name: element.AttributeValue.attribute_type.name,
              attribute_value_id : element.AttributeValue.attribute_value_id,
              attribute_value: element.AttributeValue.value,
            })
          });

          res.status(200).json(inProductAttributes)
        })
        .catch(err => next(err))
        
    } catch (error) {
      next(error)
    }
  }
}

export default AttributeController;
