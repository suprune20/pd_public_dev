'use strict';

angular.module('pdLoru')
  .service('optMarketplace', function (optMarketPlaceApi) {
    var statusesLabels = {
      posted: 'Размещен',
      confirmed: 'Подтвержден',
      shipped: 'Отправлен',
      accepted: 'Принят'
    };

    var SupplierStore = function (supplierId) {
      var _storeData;

      var loadStoreData = function (filters) {
        // Prepare query params from filters
        var params = {};
        _.forEach(filters, function (value, filterName) {
          params['filter[' + filterName + ']'] = value;
        });

        return optMarketPlaceApi.getSupplierStore(supplierId, params)
          .then(function (storeData) { _storeData = storeData; });
      };

      return loadStoreData().then(function () {
        return {
          getStoreProducts: function () {
            return _storeData;
          },
          loadStoreData: loadStoreData
        };
      });
    };

    return {
      getSupplierStore: function (supplierId) {
        return new SupplierStore(supplierId);
      },
      getMyOrders: function () {
        return optMarketPlaceApi.getMyOrders();
      },
      getOrder: function (id) {
        return optMarketPlaceApi.getOrder(id);
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
      var getPreparedCartData = function () {
        return _.map(productsInCart, function (item) {
          return {
            id: item.product.id,
            count: item.qty
          };
        });
      };
      var clearCart = function () {
        productsInCart = {};
        comment = '';
      };

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
        getComment: function () {
          return comment;
        },
        checkout: function () {
          return optMarketPlaceApi.postOrder(getPreparedCartData(), comment).then(clearCart);
        },
        saveOrderChanges: function (orderId) {
          return optMarketPlaceApi.saveOrder(orderId, getPreparedCartData(), comment).then(clearCart);
        },
        restoreData: function (cartData, productsCollection) {
          _.each(cartData.products, function (cartItem) {
            this.addProduct(_.find(productsCollection, {id: cartItem.id}), cartItem.count);
          }, this);
          this.setComment(cartData.comment);
        }
      };
    };
  })
;
