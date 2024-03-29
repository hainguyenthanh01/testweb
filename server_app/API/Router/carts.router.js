var express = require('express')

var router = express.Router()

const Cart = require('../Controller/carts.controller')

router.get('/', Cart.index)
router.post('/', Cart.postCart)
router.delete('/', Cart.deleteCart)
router.delete('/all', Cart.deleteAllCart)


module.exports = router