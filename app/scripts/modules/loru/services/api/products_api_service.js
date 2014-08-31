'use strict';

angular.module('pdLoru')
  .service('loruProductsApi', function ($http, pdConfig, $q, $upload) {
    var uploadProductData = function (_productModel, url, config) {
      var deferred = $q.defer(),
        productModel = _.cloneDeep(_productModel),
        photoFile = productModel.photo;

      // Clear model before sending
      delete productModel.id;
      delete productModel.photo;
      // Prepare upload data
      var uploadData = _.merge(config || {}, {
        url: url,
        tracker: 'commonLoadingTracker',
        data: productModel
      });
      if (photoFile && !/^https?:\/\//.test(photoFile)) {
        uploadData.file = photoFile;
        uploadData.fileFormDataName = 'photo';
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

        return $http.get(pdConfig.apiEndpoint + 'loru/products', {params: params})
          .then(function (response) { return response.data; });
      },
      getProduct: function (productId) {
        return $http.get(pdConfig.apiEndpoint + 'loru/products/' + productId)
          .then(function (response) { return response.data; });
      },
      addProduct: function (productModel) {
        return uploadProductData(productModel, pdConfig.apiEndpoint + 'loru/products');
      },
      saveProduct: function (productModel) {
        if (!_.has(productModel, 'id')) {
          return $q.reject();
        }

        return uploadProductData(
          productModel,
          pdConfig.apiEndpoint + 'loru/products/' + productModel.id,
          { method: 'PUT' }
        );
      },
      getProductsTypes: function () {
        return $http.get(pdConfig.apiEndpoint + 'loru/products_types')
          .then(function (response) { return response.data; });
      }
    };
  })
;
