'use strict';

angular.module('pdLoru')
  .service('optMarketplace', function (optMarketPlaceApi, pdFrontendOrders, auth, $q) {
    var statusesLabels = {
      posted: 'Размещен',
      confirmed: 'Подтвержден',
      shipped: 'Отправлен',
      accepted: 'Принят'
    };

    var SupplierStore = function (supplierId, filters) {
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

      return loadStoreData(filters).then(function () {
        return {
          getStoreProducts: function () {
            return _storeData;
          },
          loadStoreData: loadStoreData
        };
      });
    };

    return {
      getSupplierStore: function (supplierId, filters) {
        return new SupplierStore(supplierId, filters);
      },
      getSupplier: function (supplierId) {
        return optMarketPlaceApi.getSupplier(supplierId)
          .then(function (supplierData) {
            supplierData.isOwner = supplierData.id === auth.getUserOrganisation().id;

            return supplierData;
          });
      },
      getSuppliers: function () {
        // do not send request to server if not authenticated
        if (!auth.isAuthenticated()) {
          return [];
        }

        return optMarketPlaceApi.getSuppliers();
      },
      getMyOrders: function () {
        // get opt and retail orders
        return $q.all([optMarketPlaceApi.getMyOrders(), pdFrontendOrders.getOrdersList()])
          .then(function (results) {
            return _.map(results[0], function (order) {
              order.type = 'opt';
              return order;
            }).concat(_.map(results[1], function (order) {
              order.type = 'client';
              order.supplier = order.performer;
              order.customer = order.owner;

              return order;
            }));
          });
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
        customer = {},
        comment;
      var getPreparedCartData = function () {
        return _.map(productsInCart, function (item) {
          return {
            id: item.product.id,
            count: item.qty,
            comment: item.comment
          };
        });
      };
      var clearCart = function () {
        productsInCart = {};
        comment = '';
        customer = {};
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
        setCustomer: function (customerModel) {
          customer = customerModel;
        },
        getCustomer: function () {
          return customer;
        },
        clearCustomer: function () {
          customer = {};
        },
        setProductComment: function (productId, comment) {
          productsInCart[productId].comment = comment;
        },
        checkout: function () {
          return optMarketPlaceApi.postOrder(getPreparedCartData(), comment, customer).then(clearCart);
        },
        saveOrderChanges: function (orderId) {
          return optMarketPlaceApi.saveOrder(orderId, getPreparedCartData(), comment).then(clearCart);
        },
        restoreData: function (cartData, productsCollection) {
          _.each(cartData.products, function (cartItem) {
            this.addProduct(_.find(productsCollection, {id: cartItem.id}), cartItem.count);
            this.setProductComment(cartItem.id, cartItem.comment);
          }, this);
          this.setComment(cartData.comment);

          cartData.customer.name = cartData.customer.shortName;
          this.setCustomer(cartData.customer);
        }
      };
    };
  })
;
