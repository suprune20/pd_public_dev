'use strict';

describe('defaultValue filter', function () {
  var defaultValueFilter;

  beforeEach(module('pdApp'));
  beforeEach(inject(function ($filter) {
    defaultValueFilter = $filter('default');
  }));

  it('should return empty string if value is null/undefined/empty', function () {
    expect(defaultValueFilter(null)).toEqual('');
    expect(defaultValueFilter(undefined)).toEqual('');
    expect(defaultValueFilter('')).toEqual('');
  });

  it('should return custom default value if value is null/undefined/empty', function () {
    expect(defaultValueFilter(null, 'null')).toEqual('null');
    expect(defaultValueFilter(undefined, 'undefined')).toEqual('undefined');
    expect(defaultValueFilter('empty string')).toEqual('empty string');
  });

  it('should do not return default value if value is not null/undefined/empty', function () {
    expect(defaultValueFilter('value', 'null')).toEqual('value');
    expect(defaultValueFilter(123, 'undefined')).toEqual(123);
  });
});