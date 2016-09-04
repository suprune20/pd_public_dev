'use strict';

angular.module('pdLoru')

    .controller('LoruOwnOrdersAddCtrl', function ($scope, loruOrders, growl) {
        $scope.productsTotal = 0;
        $scope.order = {
            products: []
        };

        loruOrders.getCategoriesWithProducts()
            .then(function (categories) {
                $scope.categories = categories;
            });

        $scope.addProduct = function (product) {
            var addedProduct = {
                id: product.id,
                title: product.title,
                price: product.price,
                amount: 1,
                discount: 0
            };

            $scope.order.products.push(addedProduct);
            $scope.onProductChanged(addedProduct)
        };
        $scope.removeProduct = function (product) {
            $scope.order.products.splice($scope.order.products.indexOf(product.id), 1);
        };

        $scope.onProductChanged = function (product) {
            var productTotal = product.amount * product.price;

            product.total = productTotal - productTotal * product.discount / 100;
            $scope.productsTotal = _.reduce($scope.order.products, function (sum, product) {
                return sum + product.total;
            }, 0);
        };

        $scope.isSelectedProduct = function (product) {
            return _.includes(_.pluck($scope.order.products, 'id'), product.id);
        };

        $scope.onSubmit = function () {
            loruOrders.addOrder($scope.order)
                .then(function () {
                    $scope.$state.go('orders');
                }, function (errorData) {
                    growl.addErrorMessage(errorData.message || 'Произошла неизвестная ошибка');
                });
        };
    })
;
