import chai from "chai";
import chaiHttp from "chai-http";
import chaiThings from "chai-things";
import server from "../src/index";
import { Customer } from '../src/database/models';

const should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

describe("Endpoints for all about customer", () => { 
    before("Truncate customer table befor anything here", done => {
        Customer.destroy({truncate: true})
        done()
    })

    describe("/CUSTOMER AUTH ENDPOINTS", () => {
        it("it should create new customer", done => {
            let customer = {
                name : "name",
                email: "abc@xyz.com",
                password: "password"
            }
            chai.request(server)
                .post("/customers")
                .send(customer)
                .end((err, res) => {
                    should.not.exist(err)
                    res.should.have.status(201);
                    res.body.should.be.an("object")
                    res.body.should.have.property("customer").with.property("customer_id")
                    done()
                })
        })

        it("it should login customer", done => {
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
                    res.body.should.be.an("object")
                    res.body.should.have.property("customer").with.property("customer_id")
                    done()
                })
        })
    })

    describe("/CUSTOMER ENDPOINTS", () => {
        let token;
        beforeEach("Get token before each test", done => {
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


        it("it should get authorized customer profile", done => {
            chai.request(server) 
                .get("/customers")
                .set('authorization', token)
                .end((err, res) => {
                    const body = res.body;
                    should.not.exist(err)
                    res.should.have.status(200);
                    body.should.be.an("object").with.property("customer")
                    done();
                })
        })

        it("it should update authorized customer profile", done => {
            let customer = {
                email: "abc@xyz.com",
                name: "anothername", 
                day_phone: "87486487484",
                eve_phone: "674648464", 
                mob_phone: "648469464"
            }
            chai.request(server)
                .put("/customer")
                .send(customer)
                .set('authorization', token)
                .end((err, res) => {
                    should.not.exist(err)
                    res.should.have.status(200);
                    res.body.should.be.an("object")
                    res.body.should.have.property("customer_id")
                    res.body.eve_phone.should.eql("674648464")
                    done()
                })
        })
    })
})