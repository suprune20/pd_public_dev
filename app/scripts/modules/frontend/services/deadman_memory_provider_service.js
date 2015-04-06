'use strict';

angular.module('pdFrontend')
  .service('personMemoryApi', function ($http, pdConfig, $upload) {
    return {
      getPersonDetails: function (personId) {
        return $http.get(pdConfig.apiEndpoint + 'custompersons/' + personId)
          .then(function (response) {
            return response.data;
          });
      },
      putPersonDetails: function (personId, personModel) {
        var putUrl = pdConfig.apiEndpoint + 'custompersons/' + personId;

        if (_.has(personModel, 'photo')) {
          var photoFile = personModel.photo;

          delete personModel.photo;

          return $upload.upload({
            url: putUrl,
            method: 'PUT',
            tracker: 'commonLoadingTracker',
            data: personModel,
            file: photoFile,
            fileFormDataName: 'photo'
          }).then(function (response) {
            return response.data;
          });
        }

        return $http.put(putUrl, personModel)
          .then(function (response) {
            return response.data;
          });
      },
      getMemories: function (personId, offset, limit) {
        return $http.get(pdConfig.apiEndpoint + 'custompersons/' + personId + '/memories', {
          params: {
            offset: offset,
            limit: limit
          }
        }).then(function (response) {
          return response.data;
        });
      },
      postMemoryRecord: function (personId, memoryModel) {
        var postMemoryUrl = pdConfig.apiEndpoint + 'custompersons/' + personId + '/memories';

        if (memoryModel.mediaContent) {
          var uploadedFile = memoryModel.mediaContent;

          delete memoryModel.mediaContent;

          return $upload.upload({
            url: postMemoryUrl,
            tracker: 'commonLoadingTracker',
            data: memoryModel,
            file: uploadedFile,
            fileFormDataName: 'mediaContent'
          }).then(function (response) {
            return response.data;
          });
        }

        return $http.post(pdConfig.apiEndpoint + 'custompersons/' + personId + '/memories', memoryModel)
          .then(function (response) {
            return response.data;
          });
      },
      postGalleryItem: function (personId, photoFile) {
        return $upload.upload({
          url: pdConfig.apiEndpoint + 'custompersons/' + personId + '/gallery',
          tracker: 'commonLoadingTracker',
          file: photoFile,
          fileFormDataName: 'photo'
        });
      }
    };
  })
  .factory('DeadmanMemoryProvider', function (pdConfig, $upload, $sce, personMemoryApi, pdFrontendClientPanel, $q) {
    return function (id) {
      return {
        getPersonDetails: function () {
          return personMemoryApi.getPersonDetails(id);
        },
        updatePersonDetails: function (personData) {
          return personMemoryApi.putPersonDetails(id, personData)
            .catch(function (errorResponse) {
              var errorData = {
                status: 'server_error'
              };

              if (400 === errorResponse.status) {
                errorData.status = 'validation_error';
                errorData.message = errorResponse.data.message;
              }

              return $q.reject(errorData);
            });
        },
        getMemoriesProvider: function () {
          return function (memoriesCountsPerRequest) {
            var isBusy = false,
              isNoMoreMemories = false,
              memories = [];

            memoriesCountsPerRequest = memoriesCountsPerRequest || 15;

            return {
              getNextMemories: function () {
                return personMemoryApi.getMemories(id, memories.length, memoriesCountsPerRequest)
                  .then(function (memoriesCollection) {
                    isBusy = false;
                    isNoMoreMemories = memoriesCollection.length < memoriesCountsPerRequest;
                    memories = memories.concat(memoriesCollection);
                    console.log(memories);
                  }, function () {
                    isBusy = false;
                  });
              },
              isBusy: function () {
                return isBusy;
              },
              isNoMoreProducts: function () {
                return isNoMoreMemories && (memories.length >= memoriesCountsPerRequest || !memories.length);
              },
              getMemories: function () {
                return memories;
              },
              postMemoryRecord: function (memoryModel) {
                return personMemoryApi.postMemoryRecord(id, memoryModel)
                  .then(function (addedMemoryModel) {
                    memories.unshift(addedMemoryModel);

                    return addedMemoryModel;
                  });
              }
            };
          };
        },
        postGalleryPhoto: function (file) {
          return personMemoryApi.postGalleryItem(id, file);
        },
        getPlacesCollection: function () {
          return pdFrontendClientPanel.getPlacesCollection()
            .then(function (placesCollection) {
              return placesCollection.places;
            });
        }
      };
    };
  })
;
