
const Products = require('../../Models/product')
const Category = require('../../Models/category')
const Comment = require('../../Models/comment')



module.exports.index = async (req, res) => {
    const { name } = req.query
    if (!name) {
        const products = await Products.find()
        res.json(products)
    } else {
        const regexPattern = new RegExp(name, "i");
        const products = await Products.find({ name_product: { $regex: regexPattern } })
        res.status(200).json({ message: 'Successfully!', data: products, code: 200 })
    }

}


module.exports.gender = async (req, res) => {

    const gender = req.query.gender

    const category = await Category.find({ gender: gender })

    res.json(category)

}

//TH: Hàm này dùng để phân loại sản phẩm
module.exports.category = async (req, res) => {

    const id_category = req.query.id_category
    const gender = req.query.gender || null

    let products_category
    let data = []

    if (id_category === 'all') {
        products_category = await Products.find()
    } else if (gender) {
        products_category = await Products.find({ gender: gender })
    } else {
        products_category = await Products.find({ id_category: id_category })
    }
    for (let i = 0; i < products_category.length; i++) {
        const listStar = await Comment.find({ id_product: products_category[i]._id })
        if (listStar && listStar.length > 0) {
            const averageStar = listStar.reduce((sum, item) => sum + item.star, 0) / listStar.length;
            data.push({
                ...products_category[i]._doc,
                star: Number(parseFloat(averageStar.toFixed(1)))
            })

        } else {
            data.push({
                ...products_category[i]._doc,
                star: 0
            })
        }
    }

    res.json(data.reverse())
}

//TH: Chi Tiết Sản Phẩm
module.exports.detail = async (req, res) => {

    const id = req.params.id

    const product = await Products.findOne({ _id: id })

    res.json(product)

}


// QT: Tìm kiếm phân loại và phân trang sản phẩm
module.exports.pagination = async (req, res) => {

    //Lấy page từ query
    const page = parseInt(req.query.page) || 1

    //Lấy số lượng từ query
    const numberProduct = parseInt(req.query.count) || 1

    //Lấy key search từ query
    const keyWordSearch = req.query.search

    //Lấy category từ query
    const category = req.query.category

    //Lấy sản phẩm đầu và sẩn phẩm cuối
    var start = (page - 1) * numberProduct
    var end = page * numberProduct

    var products

    //Phân loại điều kiện category từ client gửi lên
    if (category === 'all') {
        products = await Products.find()
    } else {
        products = await Products.find({ id_category: category })
    }
    const productsRevers = products.reverse()

    var paginationProducts = productsRevers.slice(start, end)
    let data = []
    let arrNew = []

    if (!keyWordSearch) {

        arrNew = paginationProducts

    } else {
        var newData = paginationProducts.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.price_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })
        arrNew = newData
    }
    for (let i = 0; i < arrNew.length; i++) {
        const listStar = await Comment.find({ id_product: arrNew[i]._id })
        if (listStar && listStar.length > 0) {
            const averageStar = listStar.reduce((sum, item) => sum + item.star, 0) / listStar.length;
            data.push({
                ...arrNew[i]._doc,
                star: Number(parseFloat(averageStar.toFixed(1)))
            })

        } else {
            data.push({
                ...arrNew[i]._doc,
                star: 0
            })
        }
    }

    res.json(data)
}

// Hàm này dùng để hiện những sản phẩm search theo scoll ở component tìm kiếm bên client
module.exports.scoll = async (req, res) => {

    const page = req.query.page

    const count = req.query.count

    const search = req.query.search

    //Lấy sản phẩm đầu và sẩn phẩm cuối
    const start = (page - 1) * count
    const end = page * count

    const products = await Products.find()

    const newData = products.filter(value => {
        return value.name_product.toUpperCase().indexOf(search.toUpperCase()) !== -1
    })

    const paginationProducts = newData.slice(start, end)

    res.json(paginationProducts)

}
