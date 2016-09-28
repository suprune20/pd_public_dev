'use strict';

angular.module('pdLoru')

    .controller('LoruOwnOrderCtrl', function ($scope, loruOrders, growl,
            $location, pdConfig, order, categories
    ) {
        $scope.order = order;
        $scope.categories = categories;

        $scope.addProduct = function (product) {
            var addedProduct = {
                id: product.id,
                title: product.title,
                price: product.price,
                amount: 1,
                discount: 0
            };

            $scope.order.products.push(addedProduct);
        };
        
        $scope.removeProduct = function (product) {
            $scope.order.products.splice($scope.order.products.indexOf(product), 1);
        };

        $scope.getProductTotal = function (product) {
            var productTotal = product.amount * product.price;

            return productTotal - productTotal * product.discount / 100;
        };
        $scope.getProductsTotal = function () {
            return _.reduce($scope.order.products, function (sum, product) {
                return sum + $scope.getProductTotal(product);
            }, 0);
        };

        $scope.isSelectedProduct = function (product) {
            return _.includes(_.pluck($scope.order.products, 'id'), product.id);
        };

        $scope.q =  {title: ''};
        $scope.categorySearchValue = function (category) {
            var searchTitle = $scope.q.title;
            if (!searchTitle) {
                return true;
            }

            return _.some(category.products, function (product) {
                return product.title.toLowerCase().includes(searchTitle);
            });
        };

        $scope.onSubmit = function () {
            var submitFn = $scope.order.id ? loruOrders.saveOrder : loruOrders.addOrder;

            submitFn($scope.order)
                .then(function () {
                    window.location = pdConfig.backendUrl + 'order/?per_page=25&page=1&sort=-order_num';
                }, function (errorData) {
                    growl.addErrorMessage(errorData.message || 'Произошла неизвестная ошибка');
                });
        };
    })
;
