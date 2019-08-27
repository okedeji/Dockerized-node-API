/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 * 
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import {
  Product,
  ProductCategory,
  Department,
  AttributeValue,
  Attribute,
  Category,
  Sequelize,
  sequelize
} from '../database/models';

const { Op } = Sequelize;

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    try {
      let {sqlQueryMap, description_length, page}  = res.locals.pager;

      const products = await Product.findAndCountAll(sqlQueryMap);

      products.rows.forEach(el => {
        el.description =  el.description.substr(0, description_length)
      });

      return res.status(200).json({
        "paginationMeta":   {
          "currentPage": page,
          "currentPageSize": sqlQueryMap.limit,
          "totalPages": Math.ceil(products.count/sqlQueryMap.limit), 
          "totalRecords": products.count, 
        }, 
        rows: products.rows
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    try {
      const { query_string, all_words } = req.query; // what does all_words mean?

      let {sqlQueryMap, description_length}  = res.locals.pager,
          {limit, offset} = sqlQueryMap;

      let sql = ` SELECT product_id, name, description, price, discounted_price, thumbnail FROM product 
                  WHERE MATCH (name, description) AGAINST (:query_string)
                  LIMIT :offset, :limit`;

      const products = await sequelize.query(sql, { 
        replacements: { query_string, offset, limit }, 
        type: sequelize.QueryTypes.SELECT,
        model: Product
      })

      await products.forEach(el => {
        el.description =  el.description.substr(0, description_length)
      });

      return res.status(200).json({
        rows: products
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      let {sqlQueryMap, description_length}  = res.locals.pager;
      const products = await Product.findAndCountAll({
        include: {
          model: Category,
          where: { category_id },
          required: true
        },
        limit: sqlQueryMap.limit,
        offset: sqlQueryMap.offset
      });

      let formattedProduct = products.rows.map(el => {
        return {
          "product_id": el.product_id, 
          "name": el.name,
          "description": el.description.substr(0, description_length),
          "price": el.price,
          "discounted_price": el.discounted_price, 
          "thumbnail": el.thumbnail,
        }
      });
      
      return res.status(200).json({rows: formattedProduct});
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    try {
      const { department_id } = req.params;
      let {sqlQueryMap, description_length}  = res.locals.pager;
      const products = await Product.findAndCountAll({
        include: {
          model: Category,
          where: { department_id },
          required: true
        },
        limit: sqlQueryMap.limit,
        offset: sqlQueryMap.offset
      });

      let formattedProduct = products.rows.map(el => {
        return {
          "product_id": el.product_id, 
          "name": el.name,
          "description": el.description.substr(0, description_length),
          "price": el.price,
          "discounted_price": el.discounted_price, 
          "thumbnail": el.thumbnail,
        }
      });
      
      return res.status(200).json({rows: formattedProduct});
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    try {
      const { product_id } = req.params;  // eslint-disable-line
      const product = await Product.findByPk(product_id);

      let description_length = res.locals.pager.description_length;

      product.description = product.description.substr(0, description_length)

      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    try {
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${department_id} does not exist`,  // eslint-disable-line
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      return res.status(200).json({rows: categories});
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line
    try {
      const category = await Category.findByPk(category_id);
      if (category) {
        return res.status(200).json(category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${category_id} does not exist`,  // eslint-disable-line
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line
    try {
      const category = await Category.findAll({
        where: {department_id}
      });
      if (category) {
        return res.status(200).json({rows: category});
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${department_id} does not exist`,  // eslint-disable-line
        }
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
