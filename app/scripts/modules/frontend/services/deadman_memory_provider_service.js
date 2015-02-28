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
        return $http.post(pdConfig.apiEndpoint + 'custompersons/' + personId + '/memories', memoryModel)
          .then(function (response) {
            return response.data;
          });
      }
    };
  })
  .factory('DeadmanMemoryProvider', function (pdConfig, $upload, $sce, personMemoryApi) {
    return function (id) {
      return {
        getPersonDetails: function () {
          return personMemoryApi.getPersonDetails(id);
        },
        updatePersonDetails: function (personData) {
          return personMemoryApi.putPersonDetails(id, personData);
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
                  }, function () {
                    isBusy = false;
                  });

                var memories = [
                    {
                      type: 'video',
                      mediaContent: $sce.trustAsResourceUrl('http://techslides.com/demos/sample-videos/small.mp4'),
                      text: 'test video memory record',
                      createdAt: '2014-04-10T16:58:30+00:00',
                      createdBy: {
                        id: 12,
                        firstname: 'John',
                        lastname: 'Resig',
                        middlename: null
                      }
                    },
                    {
                      type: 'image',
                      mediaContent: 'http://placehold.it/530x300',
                      text: 'test image memory record',
                      createdAt: '2014-02-03T16:58:30+00:00',
                      createdBy: {
                        id: 12,
                        firstname: 'John',
                        lastname: 'Resig',
                        middlename: null
                      }
                    },
                    {
                      type: 'text',
                      mediaContent: null,
                      text: 'test text memory record. Adasd as as ashjkdhfjsdh рыв sdhfshkjdhfks kdf shdkf ksdfkh s',
                      createdAt: '2014-02-08T16:58:30+00:00',
                      createdBy: {
                        id: 12,
                        firstname: 'John',
                        lastname: 'Resig',
                        middlename: null
                      }
                    }
                  ];
              },
              isBusy: function () {
                return isBusy;
              },
              isNoMoreProducts: function () {
                return isNoMoreMemories && (memories.length >= memoriesCountsPerRequest || !memories.length);
              },
              getMemories: function () {
                return memories;
              }
            };
          };
        },
        postGalleryPhoto: function (file) {
          return $upload.upload({
            url: pdConfig.apiEndpoint + 'burial/' + id + '/memory/gallery',
            tracker: 'commonLoadingTracker',
            file: file
          });
        },
        postMemoryRecord: function (memoryModel) {
          return personMemoryApi.postMemoryRecord(id, memoryModel);
        }
      };
    };
  })
;
