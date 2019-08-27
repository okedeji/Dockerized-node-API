
/**
 * Tax controller contains methods which are needed for all tax request
 * Implement the functionality for the methods
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */

 import { Tax } from "../database/models"

class TaxController {
  /**
   * This method get all taxes
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllTax(req, res, next) {
    try {
      const tax = await Tax.findAll()
      return res.status(200).json(tax);
    } catch (error) {
      next(error)
    }
  }

  /**
   * This method gets a single tax using the tax id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleTax(req, res, next) {
    try {
      const { tax_id } = req.params;

      const tax = await Tax.findOne({
        where: { tax_id }
      })

      return res.status(200).json(tax);
    } catch (error) {
      next(error)
    }
  }
}

export default TaxController;
