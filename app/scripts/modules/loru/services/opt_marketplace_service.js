'use strict';

angular.module('pdLoru')
  .service('optMarketplace', function (optMarketPlaceApi) {
    var statusesLabels = {
      posted: 'Размещен',
      confirmed: 'Подтвержден',
      shipped: 'Отправлен',
      accepted: 'Принят'
    };

    return {
      getSupplierStore: function (supplierId) {
        return optMarketPlaceApi.getSupplierStore(supplierId);
      },
      getMyOrders: function () {
        return optMarketPlaceApi.getMyOrders();
      },
      getStatusLabel: function (statusId) {
        return statusesLabels[statusId];
      }
    };
  })
  .factory('OptMarketplaceCart', function (optMarketPlaceApi) {
    return function () {
      var productsInCart = {},
        comment;

      return {
        getItems: function () {
          return productsInCart;
        },
        addProduct: function (product, qty) {
          if (!qty) {
            this.removeProduct(product);
            return;
          }

          productsInCart[product.id] = {
            product: product,
            qty: parseInt(qty, 10)
          };
        },
        removeProduct: function (product) {
          delete productsInCart[product.id];
        },
        getTotalPrice: function () {
          return _.reduce(productsInCart, function (total, cartItem) {
            return total + (cartItem.product.price * cartItem.qty);
          }, 0);
        },
        getCount: function () {
          return _.size(productsInCart);
        },
        setComment: function (commentText) {
          comment = commentText;
        },
        checkout: function () {
          var checkoutProductsData = _.map(productsInCart, function (item) {
            return {
              id: item.product.id,
              count: item.qty
            };
          });

          return optMarketPlaceApi.postOrder(checkoutProductsData, comment)
            .then(function () {
              // clear cart data after success checkout
              productsInCart = {};
              comment = '';
            });
        }
      };
    };
  })
;
