import chai from "chai";
import chaiHttp from "chai-http";
import chaiThings from "chai-things";
import server from "../src/index";

const should = chai.should();

chai.use(chaiHttp);

describe("Endpoints for all about Product", () => { 
    // before(done => done())

    describe("/PRODUCT ENDPOINTS", () => {
        it("it should GET ALL products", done => {
            chai.request(server) 
                .get("/products")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("paginationMeta").and.property("totalRecords")
                    body.should.be.an("object").with.property("rows").to.be.an("array")
                    body.paginationMeta.totalRecords.should.eql(101);
                    done();
                })
        })

        it("it should GET ALL products with pager query", done => {
            chai.request(server) 
                .get("/products?page=2&limit=10")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("paginationMeta").and.property("totalRecords")
                    body.should.be.an("object").with.property("rows").to.be.an("array")
                    body.paginationMeta.totalRecords.should.eql(101);
                    body.paginationMeta.currentPageSize.should.eql(10);
                    body.paginationMeta.currentPage.should.eql(2);
                    body.paginationMeta.totalPages.should.eql(11); 
                    done();
                })
        })

        it("it should GET ALL products from the search query", done => {
            chai.request(server) 
                .get("/products/search?query_string=beautiful")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("rows").to.be.an("array")
                    body.rows[0].should.have.keys("product_id", "name", "description", "price", "discounted_price", "thumbnail" )
                    body.rows.should.have.lengthOf(20) 
                    done();
                })
        })

        it("it should GET ALL products with given category ID", done => {
            chai.request(server) 
                .get("/products/inCategory/1")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("rows").to.be.an("array")
                    body.rows.should.have.lengthOf(18) 
                    body.rows[0].should.have.keys("product_id", "name", "description", "price", "discounted_price", "thumbnail" )
                    done();
                })
        })

        it("it should GET ALL products with given department ID", done => {
            chai.request(server) 
                .get("/products/inDepartment/1")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("rows").to.be.an("array");
                    body.rows.should.have.lengthOf(20);
                    body.rows[0].should.have.keys("product_id", "name", "description", "price", "discounted_price", "thumbnail");
                    done();
                })
        })

        it("it should GET ALL products with given product ID", done => {
            chai.request(server) 
                .get("/products/1")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object")
                    body.should.have.keys("product_id", "name", "description", "price", "discounted_price", "thumbnail", "image_2", "image", "display" )
                    done();
                })
        })
    })

    describe("/DEPARTMENT ENDPOINTS", () => {
        it("it should GET ALL departments", done => {
            chai.request(server) 
                .get("/departments")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("array");
                    body.should.have.lengthOf(3);
                    body[0].should.be.an("object").with.property("department_id");
                    done();
                })
        })

        it("it should GET ONE department", done => {
            chai.request(server)
                .get("/departments/2")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("department_id").eql(2);
                    done();
                })
        })

        it("it should GET EMPTY array of departments", done => {
            chai.request(server)
                .get("/departments/22")
                .end((err, res) => {
                    should.not.exist(err)
                    res.should.have.status(404);
                    done();
                })
        })
    })

    describe("/CATEGORY ENDPOINTS", () => {
        it("it should GET ALL Categories", done => {
            chai.request(server)
                .get("/categories")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object");
                    body.rows.should.be.an("array").with.lengthOf(7)
                    done();
                })
        })

        it("it should GET ONE Categories", done => {
            chai.request(server)
                .get("/categories/1")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object");
                    body.should.have.property("department_id").eql(1)
                    done();
                })
        })

        /* it("it should GET ONE Categories given a Product ID", done => {
            chai.request(server)
                .get("/categories/inDepartment/2")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body[0].should.be.an("object")
                    res.body[0].should.have.property("name")
                    done();
                })
        }) */

        it("it should GET an ARRAY of Categories given a department ID", done => {
            chai.request(server)
                .get("/categories/inDepartment/1")
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object");
                    body.rows.should.be.an("array");
                    body.rows[0].category_id.should.eql(1);
                    done();
                })
        })
    })
})