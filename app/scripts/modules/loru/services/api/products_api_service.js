'use strict';

angular.module('pdLoru')
  .service('loruProductsApi', function ($http, pdConfig, $q, $upload) {
    var uploadProductData = function (_productModel, url, config) {
      var deferred = $q.defer(),
        productModel = _.cloneDeep(_productModel),
        photoFile = productModel.image;

      // Clear model before sending
      delete productModel.id;
      delete productModel.image;
      // Default values for prices attributes if has been set
      if (_.has(productModel, 'retailPrice')) {
        productModel.retailPrice = productModel.retailPrice || 0;
      }
      if (_.has(productModel, 'tradePrice')) {
        productModel.tradePrice = productModel.tradePrice || 0;
      }

      // Prepare upload data
      var uploadData = _.merge(config || {}, {
        url: url,
        tracker: 'commonLoadingTracker',
        data: productModel
      });
      if (photoFile && !/^https?:\/\//.test(photoFile)) {
        uploadData.file = photoFile;
        uploadData.fileFormDataName = 'image';
      }

      $upload.upload(uploadData)
        .then(function (response) {
          deferred.resolve(response.data);
        }, function (errorResponse) {
          deferred.reject(errorResponse.data);
        });

      return deferred.promise;
    };

    return {
      getProducts: function (filters) {
        var params = {};
        _.forEach(filters, function (value, filterName) {
          params['filter[' + filterName + ']'] = value;
        });

        return $http.get(pdConfig.apiEndpoint + 'loru/products_management/products', {params: params})
          .then(function (response) {
            return _.map(response.data, function (product) {
              product.retailPrice = parseFloat(product.retailPrice) || null;
              product.tradePrice = parseFloat(product.tradePrice) || null;

              return product;
            });
          });
      },
      getProduct: function (productId) {
        return $http.get(pdConfig.apiEndpoint + 'loru/products_management/products/' + productId)
          .then(function (response) {
            var productModel = response.data;
            productModel.image = productModel.imageUrl;
            delete productModel.imageUrl;
            productModel.retailPrice = parseFloat(productModel.retailPrice) || '';
            productModel.tradePrice = parseFloat(productModel.tradePrice) || '';

            return productModel;
          });
      },
      addProduct: function (productModel) {
        return uploadProductData(productModel, pdConfig.apiEndpoint + 'loru/products_management/products');
      },
      saveProduct: function (productModel) {
        if (!_.has(productModel, 'id')) {
          return $q.reject();
        }

        return uploadProductData(
          productModel,
          pdConfig.apiEndpoint + 'loru/products_management/products/' + productModel.id,
          { method: 'PUT' }
        );
      },
      getProductsTypes: function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/product_types')
          .then(function (response) { return response.data; });
      }
    };
  })
;
