'use strict';

angular.module('pdFrontend')
  .factory('Burial', function ($http, pdConfig, $timeout, $rootScope, $upload, $sce) {
    return function (id) {
      return {
        getMemoryDetails: function () {
//          return $http.get(pdConfig.apiEndpoint + 'burial/' + id + '/memory', {
//            tracker: 'commonLoadingTracker'
//          }).then(function (response) {
//            return response.data;
//          });
          var tempMemoryPromise = $timeout(function () {
            var a = {
              photo: null,
              firstname: 'John',
              lastname: 'Smith',
              middlename: null,
              dob: '12-05-1964',
              dod: '1-11-2001',
              commonText: 'RIP John',
              gallery: [
                {
                  photoUrl: 'http://placehold.it/100x100',
                  addedAt: '24-12-2014 12:12:23'
                },
                {
                  photoUrl: 'http://placehold.it/120x120',
                  addedAt: '26-12-2014 12:12:23'
                },
                {
                  photoUrl: 'http://placehold.it/150x150',
                  addedAt: '25-12-2014 12:12:23'
                }
              ]
            };
            a.gallery = _(a.gallery)
              .sortBy('addedAt')
              .reverse()
              .value()
            ;

            return a;
          }, 2000);
          $rootScope.commonLoadingTracker.addPromise(tempMemoryPromise);

          return tempMemoryPromise;
        },
        getMemoriesProvider: function () {
          return function (memoriesCountsPerRequest) {
            var isBusy = false,
              isNoMemories = false,
              memories = [];
            memoriesCountsPerRequest = memoriesCountsPerRequest || 15;

            return {
              getNextMemories: function () {
//                return $http.get(pdConfig.apiEndpoint + 'burial/' + id + '/memories', {
//                  tracker: 'commonLoadingTracker'
//                }).then(function (resp) {
//                  isBusy = false;
//                  isNoMemories = resp.data.results.length < memoriesCountsPerRequest;
//                  memories = products.concat(resp.data.results);
//                }, function () { isBusy = false; });
                var tempMemoriesPromise = $timeout(function () {
                  memories = [
                    {
                      type: 'video',
                      mediaContent: $sce.trustAsResourceUrl('http://localhost:9000/images/small.mp4'),
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
                }, 2000);
                $rootScope.commonLoadingTracker.addPromise(tempMemoriesPromise);

                return tempMemoriesPromise;
              },
              isBusy: function () { return isBusy; },
              isNoMoreProducts: function () {
                return isNoMemories && (memories.length >= memoriesCountsPerRequest || !memories.length);
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
        }
      };
    };
  })
;
