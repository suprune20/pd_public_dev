'use strict';

angular.module('pdLoru')

    .service('loruOrdersApi', function ($http, pdConfig, $q) {
        return {
            getCategories: function () {
                return $http.get(pdConfig.apiEndpoint + 'loru/categories')
                    .then(function (response) { return response.data; });
            },
            postOrder: function (orderData) {
                return $http.post(pdConfig.apiEndpoint + 'loru/orders', orderData)
                    .then(
                        function (response) { return response.data; },
                        function (response) {
                            return $q.reject(response.data);
                        }
                    );
            },
            putOrder: function (orderData) {
                return $http.put(pdConfig.apiEndpoint + 'loru/orders/' + orderData.id, orderData)
                    .then(
                        function (response) { return response.data; },
                        function (response) {
                            return $q.reject(response.data);
                        }
                    );
            },
            getOrder: function (orderId) {
                return $http.get(pdConfig.apiEndpoint + 'loru/orders/' + orderId)
                    .then(function (response) { return response.data; });
            }
        };
    })

    .service('loruOrders', function (loruOrdersApi, $q) {
        return {
            getCategoriesWithProducts: function () {
                return loruOrdersApi.getCategories();
            },
            addOrder: function (orderModel) {
                return loruOrdersApi.postOrder(orderModel);
            },
            getOrder: function (orderId) {
                return loruOrdersApi.getOrder(orderId);
            },
            saveOrder: function (orderModel) {
                return loruOrdersApi.putOrder(orderModel);
            }
        };
    })
;
