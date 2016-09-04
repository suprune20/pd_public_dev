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
            }
        };
    })
;
