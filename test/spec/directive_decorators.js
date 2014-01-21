'use strict';

describe('Directive decorators', function () {
  var $compile;
  var $rootScope;

  beforeEach(module('pdApp'));
  beforeEach(module('views/main.html'));

  describe('ngSrc directive', function () {
    beforeEach(function () {
      module(function($provide) {
        $provide.constant('imageThumbnailerConfig', {
          baseUrl: 'http://pd.com/media',
          thumbnailBaseUrl: 'http://pd.com/thumb'
        });
      });
    });
    // Inject should be used after any mocks
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it('should do not replace for thumbnail if image url is not have server host', function () {
      var element = $compile('<img ng-src="{{imageSrc}}" pd-thumb />')($rootScope);
      $rootScope.imageSrc = 'http://example.com/test.jpg';
      $rootScope.$digest();
      expect(element.attr('src')).toEqual($rootScope.imageSrc);
    });

    it('should do not replace for thumbnail if tag do not have pd-thumb attribute', function () {
      var element = $compile('<img ng-src="{{imageSrc}}" />')($rootScope);
      $rootScope.imageSrc = 'http://pd.com/media/test.jpg';
      $rootScope.$digest();
      expect(element.attr('src')).toEqual($rootScope.imageSrc);
    });

    it('should replace image src url to thumbnail url with default values of size and method', function () {
      var element = $compile('<img ng-src="{{imageSrc}}" pd-thumb />')($rootScope);
      $rootScope.imageSrc = 'http://pd.com/media/test.jpg';
      $rootScope.$digest();
      expect(element.attr('src')).toEqual('http://pd.com/thumb/test.jpg/120x100~crop~12.jpg');
    });

    it('should replace image src url to thumbnail url with custom size', function () {
      var element = $compile('<img ng-src="{{imageSrc}}" pd-thumb pd-thumb-size="100x100" />')($rootScope);
      $rootScope.imageSrc = 'http://pd.com/media/test.jpg';
      $rootScope.$digest();
      expect(element.attr('src')).toEqual('http://pd.com/thumb/test.jpg/100x100~crop~12.jpg');
    });

    it('should replace image src url to thumbnail url with custom method', function () {
      var element = $compile('<img ng-src="{{imageSrc}}" pd-thumb pd-thumb-method="smart" />')($rootScope);
      $rootScope.imageSrc = 'http://pd.com/media/test.jpg';
      $rootScope.$digest();
      expect(element.attr('src')).toEqual('http://pd.com/thumb/test.jpg/120x100~smart~12.jpg');
    });
  });
});