import { Router } from 'express';
import ProductController from '../../controllers/product.controller';
import { pager } from "../../controllers/helpers/pager.helper"

// These are valid routes but they may contain a bug, please try to define and fix them

const router = Router();
router.get('/products', pager,  ProductController.getAllProducts);
router.get('/products/search', pager, ProductController.searchProduct);
router.get('/products/inCategory/:category_id', pager, ProductController.getProductsByCategory);
router.get('/products/inDepartment/:department_id', pager, ProductController.getProductsByDepartment);
router.get('/products/:product_id', pager, ProductController.getProduct);

router.get('/departments', ProductController.getAllDepartments);
router.get('/departments/:department_id', ProductController.getDepartment);

router.get('/categories', ProductController.getAllCategories);
router.get('/categories/:category_id', ProductController.getSingleCategory);
router.get('/categories/inDepartment/:department_id', ProductController.getDepartmentCategories);

export default router;
