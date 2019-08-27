import chai from "chai";
import chaiHttp from "chai-http";
import chaiThings from "chai-things";
import server from "../src/index";

const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

describe("Endpoints for all about shoppingCart", () => {
    let cart_id;
    describe("/CART ENDPOINTS", () => {
        let token, item_id;
        before("Get token before each test", done => {
            let customer = {
                email: "abc@xyz.com",
                password: "password"
            }
            chai.request(server)
                .post("/customers/login")
                .send(customer)
                .end((err, res) => {
                    should.not.exist(err)
                    res.should.have.status(200);
                    token =  res.body.accessToken
                    done()
                })
        })


        it("it should generate unique ID", done => {
            chai.request(server) 
                .get("/shoppingcart/generateUniqueId")
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    cart_id = body.cart_id;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("cart_id")
                    done();
                })
        })

        it("it should add item to cart", done => {
            let customer = {
                cart_id, 
                product_id: 1, 
                attributes: "blue and yellow", 
                quantity: 1
            }
            chai.request(server)
                .post("/shoppingcart/add")
                .send(customer)
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    res.body.should.be.an("object").with.property("item_id")
                    body.should.have.keys("item_id", "cart_id", "product_id", "attributes", "quantity")
                    done()
                })
        })

        it("it should get cart with given cart_id", done => {
            chai.request(server) 
                .get("/shoppingcart/" + cart_id)
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    item_id = body[0].item_id
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("array")
                    body[0].should.be.an("object")
                    done();
                })
        }) 

        it("it should update item_quantity of cart with item_id", done => {
            let quantity = 2;
            chai.request(server) 
                .put("/shoppingcart/update/" + item_id) 
                .send({ quantity })
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("quantity").eql(2)
                    done();
                })
        }) 

        it("it should delete cart with given cart_id", done => {
            chai.request(server) 
                .delete("/shoppingcart/empty/" + cart_id)
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("array")
                    done();
                })
        })

        it("it should remove item with given item_id from cart", done => {
            let customer = {
                cart_id, 
                product_id: 1,
                attributes: "blue and yellow", 
                quantity: 1
            }
            chai.request(server)
                .post("/shoppingcart/add")
                .send(customer)
                .set('authorization', token)
                .end((err, res) => {
                    chai.request(server) 
                        .delete("/shoppingcart/removeProduct/1")
                        .set('authorization', token)
                        .end((err, res) => {
                            const body = res.body;
                            should.not.exist(err)
                            res.should.have.status(200);
                            body.should.be.an("object")
                            done();
                        })
                })
        })
    })

    describe("/ORDER ENDPOINTS", () => {
        let token, order_id;
        before("Get token before each test", done => {
            let customer = {
                email: "abc@xyz.com",
                password: "password"
            }
            chai.request(server)
                .post("/customers/login")
                .send(customer)
                .end((err, res) => {
                    should.not.exist(err)
                    res.should.have.status(200);
                    token =  res.body.accessToken
                    done()
                })
        })


        it("it should create an order", done => {
            let order = {
                cart_id,
                "shipping_id" : 1,
                "tax_id" : 1,
            }
            chai.request(server) 
                .post("/orders")
                .set('authorization', token)
                .send(order)
                .end((err, res) => {
                    const body = res.body;
                    cart_id = body.cart_id;
                    should.not.exist(err)
                    res.should.have.status(201);
                    body.should.be.an("object").with.property("order_id")
                    done();
                })
        })

        it("it should get order with customer_id", done => {
            chai.request(server) 
                .get("/orders/inCustomer")
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    order_id = body[0].order_id
                    cart_id = body.cart_id;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("array")
                    body[0].should.have.property("name")
                    done();
                })
        })

        it("it should get order with order_id", done => {
            chai.request(server) 
                .get("/orders/" + order_id)
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    cart_id = body.cart_id;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("order_id");
                    body.orderItems.should.be.an("array");
                    done();
                })
        })
    })
}) 