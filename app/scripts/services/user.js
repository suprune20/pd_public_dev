'use strict';

angular.module('pdApp')
  .factory('User', function ($timeout) {
    return function () {
      var getProfile = function () {
            return $timeout(function () {
              return {
                id: 1,
                photoUrl: 'http://placehold.it/150x150',
                firstName: 'Петр',
                lastName: 'Петров',
                surName: 'Петрович',
                address: 'Россия, Москва, ул.Краснознаменская, д.12-3',
                phones: [
                  '1231231222',
                  '1231245322'
                ],
                mainPhone: '4234231123',
                places: [
                  {
                    photoUrl: 'http://placehold.it/50x50',
                    address: 'Россия, Москва, ул.Краснознаменская, ряд 4, место 5',
                    location: {
                      longitude: 37.714517,
                      latitude: 55.810993
                    },
                    gallery: [
                      {
                        photoUrl: 'http://placehold.it/500x300',
                        addedAt: '24-04-2010 15:45'
                      },
                      {
                        photoUrl: 'http://placehold.it/500x300',
                        addedAt: '20-04-2010 15:45'
                      }
                    ],
                    sites: [
                      {
                        order: 1,
                        type: 'busy',
                        descriptionData: [
                          {
                            order: 1,
                            fio: 'Иванов Иван Иванович',
                            photoUrl: 'http://placehold.it/50x50',
                            birthDate: '26-06-1965',
                            deathDate: '12-03-2010'
                          },
                          {
                            order: 2,
                            fio: 'Иванова Екатерина Алексеевна',
                            photoUrl: 'http://placehold.it/50x50',
                            birthDate: '36-07-1968',
                            deathDate: '12-01-2012'
                          }
                        ]
                      },
                      {
                        order: 2,
                        type: 'reserved'
                      },
                      {
                        order: 3,
                        type: 'reserved'
                      }
                    ]
                  },
                  {
                    photoUrl: 'http://placehold.it/50x50',
                    address: 'Россия, Москва, ул.Краснознаменская, ряд 5, место 58',
                    location: {
                      longitude: 56.4,
                      latitude: 24.456
                    }
                  },
                  {
                    photoUrl: 'http://placehold.it/50x50',
                    address: 'Россия, Москва, ул.Краснознаменская, ряд 1, место 12',
                    location: {
                      longitude: 43.4,
                      latitude: 35.456
                    },
                    gallery: [
                      {
                        photoUrl: 'http://placehold.it/500x300',
                        addedAt: '24-04-2009 15:45'
                      }
                    ],
                    sites: [
                      {
                        order: 1,
                        type: 'busy',
                        descriptionData: [
                          {
                            order: 1,
                            fio: 'Иванов Иван Иванович',
                            photoUrl: 'http://placehold.it/50x50',
                            birthDate: '26-06-1965',
                            deathDate: '12-03-2010'
                          },
                          {
                            order: 2,
                            fio: 'Иванова Екатерина Алексеевна',
                            photoUrl: 'http://placehold.it/50x50',
                            birthDate: '36-07-1968',
                            deathDate: '12-01-2012'
                          }
                        ]
                      }
                    ]
                  },
                  {
                    photoUrl: 'http://placehold.it/50x50',
                    address: 'Россия, Москва, ул.Краснознаменская, ряд 45, место 1',
                    location: {
                      longitude: 50.4,
                      latitude: 25.456
                    }
                  }
                ]
              };
            }, 2000);
          };

      return {
        getProfile: getProfile
      };
    };
  })
;
