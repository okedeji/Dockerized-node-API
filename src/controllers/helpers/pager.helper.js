
exports.pager = (req, res, next) => {
    const { query } = req;
    let { page, limit, description_length } = query;

    limit = limit ? parseInt(limit) : 20;
    page = page ? parseInt(page) : 1;
    description_length = description_length ? parseInt(description_length): 200;
    
    let offset = page === 1 ? 0 : (page - 1) * limit;


    res.locals.pager = {
        sqlQueryMap : {
            limit,
            offset
        },
        description_length,
        page
    }

    next()
}