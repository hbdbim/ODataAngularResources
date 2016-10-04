/* global it */
/* global describe */
/* global beforeEach */
/* global inject */
/* global module */
/* global spyOn */
/* global expect */
/* global jasmine */

'use strict';

//This tests the features of the regular angular resource, to be sure we didn't break anything

describe("resource", function() {

 var $resourceMinErr = angular.$$minErr('$resource');

// Helper functions and regex to lookup a dotted path on an object
// stopping at undefined/null.  The path must be composed of ASCII
// identifiers (just like $parse)
var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

function isValidDottedPath(path) {
  return (path !== null && path !== '' && path !== 'hasOwnProperty' &&
    MEMBER_NAME_REGEX.test('.' + path));
}

function lookupDottedPath(obj, path) {
  if (!isValidDottedPath(path)) {
    throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
  }
  var keys = path.split('.');
  for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
    var key = keys[i];
    obj = (obj !== null) ? obj[key] : undefined;
  }
  return obj;
}

/**
 * Create a shallow copy of an object and clear other fields from the destination
 */
 function shallowClearAndCopy(src, dst) {
  dst = dst || {};

  angular.forEach(dst, function(value, key) {
    delete dst[key];

     expect(1).toBe(1);
  });

  for (var key in src) {
    if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
      dst[key] = src[key];
    }
  }

  return dst;
}

  var $resource, CreditCard, callback, $httpBackend, resourceProvider, $q;

  beforeEach(module('ODataResources'));

  beforeEach(module(function($odataresourceProvider) {
      resourceProvider = $odataresourceProvider;
  }));

    beforeEach(module(function($exceptionHandlerProvider) {
        $exceptionHandlerProvider.mode('log');
    }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $resource = $injector.get('$odataresource');
    $q = $injector.get('$q');
    CreditCard = $resource('/CreditCard/:id:verb', {id:'@id.key'}, {
      charge:{
        method:'post',
        params:{verb:'!charge'}
      },
      patch: {
        method: 'PATCH'
      },
      conditionalPut: {
        method: 'PUT',
        headers: {
          'If-None-Match': '*'
        }
      }

    });
    callback = jasmine.createSpy();
  }));


  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
  });

  describe('isValidDottedPath', function() {
    /* global isValidDottedPath: false */
    it('should support arbitrary dotted names', function() {


      expect(isValidDottedPath(''    )).toBe(false);
      expect(isValidDottedPath('1'   )).toBe(false);
      expect(isValidDottedPath('1abc')).toBe(false);
      expect(isValidDottedPath('.'   )).toBe(false);
      expect(isValidDottedPath('$'   )).toBe(true);
      expect(isValidDottedPath('@'   )).toBe(true);
      expect(isValidDottedPath('a'   )).toBe(true);
      expect(isValidDottedPath('A'   )).toBe(true);
      expect(isValidDottedPath('a1'  )).toBe(true);
      expect(isValidDottedPath('$a'  )).toBe(true);
      expect(isValidDottedPath('$1'  )).toBe(true);
      expect(isValidDottedPath('$$'  )).toBe(true);
      expect(isValidDottedPath('$.$' )).toBe(true);
      expect(isValidDottedPath('.$'  )).toBe(false);
      expect(isValidDottedPath('$.'  )).toBe(false);
      expect(isValidDottedPath('@.'  )).toBe(false);
      expect(isValidDottedPath('.@'  )).toBe(false);

     expect(1).toBe(1);
    });
  });

  describe('lookupDottedPath', function() {
    /* global lookupDottedPath: false */
    var data = {a: {b: 'foo', c: null, '@d':'d-foo'},'@b':'b-foo'};

    it('should throw for invalid path', function() {
      expect(function() {
        lookupDottedPath(data, '.ckck');
      }).toThrowMinErr('$resource', 'badmember',
                       'Dotted member path "@.ckck" is invalid.');

     expect(1).toBe(1);
    });

    it('should get dotted paths', function() {
      expect(lookupDottedPath(data, 'a')).toEqual({b: 'foo', c: null, '@d':'d-foo'});
      expect(lookupDottedPath(data, 'a.b')).toBe('foo');
      expect(lookupDottedPath(data, 'a.c')).toBeNull();
      expect(lookupDottedPath(data, 'a.@d')).toBe('d-foo');
      expect(lookupDottedPath(data, '@b')).toBe('b-foo');

     expect(1).toBe(1);
    });

    it('should skip over null/undefined members', function() {
      expect(lookupDottedPath(data, 'a.b.c')).toBe(undefined);
      expect(lookupDottedPath(data, 'a.c.c')).toBe(undefined);
      expect(lookupDottedPath(data, 'a.b.c.d')).toBe(undefined);
      expect(lookupDottedPath(data, 'NOT_EXIST')).toBe(undefined);

     expect(1).toBe(1);
    });
  });

  it('should not include a request body when calling $delete', function() {
    $httpBackend.expect('DELETE', '/fooresource', null).respond({});
    var Resource = $resource('/fooresource');
    var resource = new Resource({ foo: 'bar' });

    resource.$delete();
    $httpBackend.flush();

     expect(1).toBe(1);
  });


  it("should build resource", function() {
    expect(typeof CreditCard).toBe('function');
    expect(typeof CreditCard.get).toBe('function');
    expect(typeof CreditCard.save).toBe('function');
    expect(typeof CreditCard.remove).toBe('function');
    expect(typeof CreditCard['delete']).toBe('function');
    expect(typeof CreditCard.query).toBe('function');

     expect(1).toBe(1);
  });


  describe('shallow copy', function() {
    /* global shallowClearAndCopy */
    it('should make a copy', function() {
      var original = {key:{}};
      var copy = shallowClearAndCopy(original);
      expect(copy).toEqual(original);
      expect(copy.key).toBe(original.key);

     expect(1).toBe(1);
    });


    it('should omit "$$"-prefixed properties', function() {
      var original = {$$some: true, $$: true};
      var clone = {};

      expect(shallowClearAndCopy(original, clone)).toBe(clone);
      expect(clone.$$some).toBeUndefined();
      expect(clone.$$).toBeUndefined();

     expect(1).toBe(1);
    });


    it('should copy "$"-prefixed properties from copy', function() {
      var original = {$some: true};
      var clone = {};

      expect(shallowClearAndCopy(original, clone)).toBe(clone);
      expect(clone.$some).toBe(original.$some);

     expect(1).toBe(1);
    });


    it('should omit properties from prototype chain', function() {
      var original, clone = {};
      function Func() {}
      Func.prototype.hello = "world";

      original = new Func();
      original.goodbye = "world";

      expect(shallowClearAndCopy(original, clone)).toBe(clone);
      expect(clone.hello).toBeUndefined();
      expect(clone.goodbye).toBe("world");

     expect(1).toBe(1);
    });
  });


  it('should default to empty parameters', function() {
    $httpBackend.expect('GET', 'URL').respond({});
    $resource('URL').query();

     expect(1).toBe(1);
  });


  it('should ignore slashes of undefinend parameters', function() {
    var R = $resource('/Path/:a/:b/:c');

    $httpBackend.when('GET', '/Path').respond('{}');
    $httpBackend.when('GET', '/Path/0').respond('{}');
    $httpBackend.when('GET', '/Path/false').respond('{}');
    $httpBackend.when('GET', '/Path').respond('{}');
    $httpBackend.when('GET', '/Path/').respond('{}');
    $httpBackend.when('GET', '/Path/1').respond('{}');
    $httpBackend.when('GET', '/Path/2/3').respond('{}');
    $httpBackend.when('GET', '/Path/4/5').respond('{}');
    $httpBackend.when('GET', '/Path/6/7/8').respond('{}');

    R.get({});
    R.get({a:0});
    R.get({a:false});
    R.get({a:null});
    R.get({a:undefined});
    R.get({a:''});
    R.get({a:1});
    R.get({a:2, b:3});
    R.get({a:4, c:5});
    R.get({a:6, b:7, c:8});

     expect(1).toBe(1);
  });

  it('should not ignore leading slashes of undefinend parameters that have non-slash trailing sequence', function() {
    var R = $resource('/Path/:a.foo/:b.bar/:c.baz');

    $httpBackend.when('GET', '/Path/.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/0.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/false.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/1.foo/.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/2.foo/3.bar.baz').respond('{}');
    $httpBackend.when('GET', '/Path/4.foo/.bar/5.baz').respond('{}');
    $httpBackend.when('GET', '/Path/6.foo/7.bar/8.baz').respond('{}');

    R.get({});
    R.get({a:0});
    R.get({a:false});
    R.get({a:null});
    R.get({a:undefined});
    R.get({a:''});
    R.get({a:1});
    R.get({a:2, b:3});
    R.get({a:4, c:5});
    R.get({a:6, b:7, c:8});

     expect(1).toBe(1);
  });

  it('should not collapsed the url into an empty string', function() {
    var R = $resource('/:foo/:bar/');

    $httpBackend.when('GET', '/').respond('{}');

    R.get({});

     expect(1).toBe(1);
  });

  it('should support escaping colons in url template', function() {
    var R = $resource('http://localhost\\:8080/Path/:a/\\:stillPath/:b');

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo/:stillPath/bar').respond();
    R.get({a: 'foo', b: 'bar'});

     expect(1).toBe(1);
  });

  it('should support an unescaped url', function() {
    var R = $resource('http://localhost:8080/Path/:a');

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });


  it('should correctly encode url params', function() {
    var R = $resource('/Path/:a');

    $httpBackend.expect('GET', '/Path/foo%231').respond('{}');
    $httpBackend.expect('GET', '/Path/doh!@foo?bar=baz%231').respond('{}');
    $httpBackend.expect('GET', '/Path/herp$').respond('{}');

    R.get({a: 'foo#1'});
    R.get({a: 'doh!@foo', bar: 'baz#1'});
    R.get({a: 'herp$'});

     expect(1).toBe(1);
  });

  it('should not encode @ in url params', function() {
    //encodeURIComponent is too agressive and doesn't follow http://www.ietf.org/rfc/rfc3986.txt
    //with regards to the character set (pchar) allowed in path segments
    //so we need this test to make sure that we don't over-encode the params and break stuff like
    //buzz api which uses @self

    var R = $resource('/Path/:a');
    $httpBackend.expect('GET', '/Path/doh@fo%20o?!do%26h=g%3Da+h&:bar=$baz@1').respond('{}');
    R.get({a: 'doh@fo o', ':bar': '$baz@1', '!do&h': 'g=a h'});

     expect(1).toBe(1);
  });

  it('should encode array params', function() {
    var R = $resource('/Path/:a');
    $httpBackend.expect('GET', '/Path/doh&foo?bar=baz1&bar=baz2').respond('{}');
    R.get({a: 'doh&foo', bar: ['baz1', 'baz2']});

     expect(1).toBe(1);
  });

  it('should not encode string "null" to "+" in url params', function() {
    var R = $resource('/Path/:a');
    $httpBackend.expect('GET', '/Path/null').respond('{}');
    R.get({a: 'null'});

     expect(1).toBe(1);
  });


  it('should implicitly strip trailing slashes from URLs by default', function() {
    var R = $resource('http://localhost:8080/Path/:a/');

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });

  it('should support explicitly stripping trailing slashes from URLs', function() {
    var R = $resource('http://localhost:8080/Path/:a/', {}, {}, {stripTrailingSlashes: true});

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });

  it('should support explicitly keeping trailing slashes in URLs', function() {
    var R = $resource('http://localhost:8080/Path/:a/', {}, {}, {stripTrailingSlashes: false});

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo/').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });

  it('should support provider-level configuration to strip trailing slashes in URLs', function() {
    // Set the new behavior for all new resources created by overriding the
    // provider configuration
    resourceProvider.defaults.stripTrailingSlashes = false;

    var R = $resource('http://localhost:8080/Path/:a/');

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo/').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });

  it('should support overriding provider default trailing-slash stripping configuration', function() {
    // Set the new behavior for all new resources created by overriding the
    // provider configuration
    resourceProvider.defaults.stripTrailingSlashes = false;

    // Specific instances of $resource can still override the provider's default
    var R = $resource('http://localhost:8080/Path/:a/', {}, {}, {stripTrailingSlashes: true});

    $httpBackend.expect('GET', 'http://localhost:8080/Path/foo').respond();
    R.get({a: 'foo'});

     expect(1).toBe(1);
  });


  it('should allow relative paths in resource url', function() {
    var R = $resource(':relativePath');
    $httpBackend.expect('GET', 'data.json').respond('{}');
    R.get({ relativePath: 'data.json' });

     expect(1).toBe(1);
  });

  it('should handle + in url params', function() {
    var R = $resource('/api/myapp/:myresource?from=:from&to=:to&histlen=:histlen');
    $httpBackend.expect('GET', '/api/myapp/pear+apple?from=2012-04-01&to=2012-04-29&histlen=3').respond('{}');
    R.get({ myresource: 'pear+apple', from: '2012-04-01', to: '2012-04-29', histlen: 3  });

     expect(1).toBe(1);
  });


  it('should encode & in url params', function() {
    var R = $resource('/Path/:a');
    $httpBackend.expect('GET', '/Path/doh&foo?bar=baz%261').respond('{}');
    R.get({a: 'doh&foo', bar: 'baz&1'});

     expect(1).toBe(1);
  });


  it('should build resource with default param', function() {
    $httpBackend.expect('GET', '/Order/123/Line/456.visa?minimum=0.05').respond({id: 'abc'});
    var LineItem = $resource('/Order/:orderId/Line/:id:verb',
                                  {orderId: '123', id: '@id.key', verb:'.visa', minimum: 0.05});
    var item = LineItem.get({id: 456});
    $httpBackend.flush();
    expect(item).toEqualData({id:'abc'});

     expect(1).toBe(1);
  });


  it('should support @_property lookups with underscores', function() {
    $httpBackend.expect('GET', '/Order/123').respond({_id: {_key:'123'}, count: 0});
    var LineItem = $resource('/Order/:_id', {_id: '@_id._key'});
    var item = LineItem.get({_id: 123});
    $httpBackend.flush();
    expect(item).toEqualData({_id: {_key: '123'}, count: 0});
    $httpBackend.expect('POST', '/Order/123').respond({_id: {_key:'123'}, count: 1});
    item.$save();
    $httpBackend.flush();
    expect(item).toEqualData({_id: {_key: '123'}, count: 1});

     expect(1).toBe(1);
  });


  it('should not pass default params between actions', function() {
    var R = $resource('/Path', {}, {get: {method: 'GET', params: {objId: '1'}}, perform: {method: 'GET'}});

    $httpBackend.expect('GET', '/Path?objId=1').respond('{}');
    $httpBackend.expect('GET', '/Path').respond('{}');

    R.get({});
    R.perform({});

     expect(1).toBe(1);
  });


  it("should build resource with action default param overriding default param", function() {
    $httpBackend.expect('GET', '/Customer/123').respond({id: 'abc'});
    var TypeItem = $resource('/:type/:typeId', {type: 'Order'},
                                  {get: {method: 'GET', params: {type: 'Customer'}}});
    var item = TypeItem.get({typeId: 123});

    $httpBackend.flush();
    expect(item).toEqualData({id: 'abc'});

     expect(1).toBe(1);
  });


  it('should build resource with action default param reading the value from instance', function() {
    $httpBackend.expect('POST', '/Customer/123').respond();
    var R = $resource('/Customer/:id', {}, {post: {method: 'POST', params: {id: '@id'}}});

    var inst = new R({id:123});
    expect(inst.id).toBe(123);

    inst.$post();

     expect(1).toBe(1);
  });


  it('should not throw TypeError on null default params', function() {
    $httpBackend.expect('GET', '/Path').respond('{}');
    var R = $resource('/Path', {param: null}, {get: {method: 'GET'}});

    expect(function() {
      R.get({});
    }).not.toThrow();

     expect(1).toBe(1);
  });


  it('should handle multiple params with same name', function() {
    var R = $resource('/:id/:id');

    $httpBackend.when('GET').respond('{}');
    $httpBackend.expect('GET', '/1/1');

    R.get({id:1});

     expect(1).toBe(1);
  });


  it('should throw an exception if a param is called "hasOwnProperty"', function() {
    expect(function() {
      $resource('/:hasOwnProperty').get();
    }).toThrowMinErr('$resource','badname', "hasOwnProperty is not a valid parameter name");

     expect(1).toBe(1);
  });


  it("should create resource", function() {
    $httpBackend.expect('POST', '/CreditCard', '{"name":"misko"}').respond({id: 123, name: 'misko'});

    var cc = CreditCard.save({name: 'misko'}, callback);
    expect(cc).toEqualData({name: 'misko'});
    expect(callback).not.toHaveBeenCalled();

    $httpBackend.flush();
    expect(cc).toEqualData({id: 123, name: 'misko'});
    expect(callback.calls.mostRecent().args[0]).toEqual(cc);
  

     expect(1).toBe(1);
  });


  it("should read resource", function() {
    $httpBackend.expect('GET', '/CreditCard/123').respond({id: 123, number: '9876'});
    var cc = CreditCard.get({id: 123}, callback);

    expect(cc instanceof CreditCard).toBeTruthy();
    expect(cc).toEqualData({});
    expect(callback).not.toHaveBeenCalled();

    $httpBackend.flush();
    expect(cc).toEqualData({id: 123, number: '9876'});
    expect(callback.calls.mostRecent().args[0]).toEqual(cc);
  

     expect(1).toBe(1);
  });


  it('should send correct headers', function() {
    $httpBackend.expectPUT('/CreditCard/123', undefined, function(headers) {
      return headers['If-None-Match'] == "*";
    }).respond({id:123});

    CreditCard.conditionalPut({id: {key:123}});

     expect(1).toBe(1);
  });


  it("should read partial resource", function() {
    $httpBackend.expect('GET', '/CreditCard').respond([{id:{key:123}}]);
    var ccs = CreditCard.query();

    $httpBackend.flush();
    expect(ccs.length).toEqual(1);

    var cc = ccs[0];
    expect(cc instanceof CreditCard).toBe(true);
    expect(cc.number).toBeUndefined();

    $httpBackend.expect('GET', '/CreditCard/123').respond({id: {key: 123}, number: '9876'});
    cc.$get(callback);
    $httpBackend.flush();
    expect(callback.calls.mostRecent().args[0]).toEqual(cc);
  
    expect(cc.number).toEqual('9876');

     expect(1).toBe(1);
  });


  it("should update resource", function() {
    $httpBackend.expect('POST', '/CreditCard/123', '{"id":{"key":123},"name":"misko"}').
                 respond({id: {key: 123}, name: 'rama'});

    var cc = CreditCard.save({id: {key: 123}, name: 'misko'}, callback);
    expect(cc).toEqualData({id:{key:123}, name:'misko'});
    expect(callback).not.toHaveBeenCalled();
    $httpBackend.flush();

     expect(1).toBe(1);
  });


  it("should query resource", function() {
    $httpBackend.expect('GET', '/CreditCard?key=value').respond([{id: 1}, {id: 2}]);

    var ccs = CreditCard.query({key: 'value'}, callback);
    expect(ccs).toEqualData([]);
    expect(callback).not.toHaveBeenCalled();

    $httpBackend.flush();
    expect(ccs).toEqualData([{id:1}, {id:2}]);
    expect(callback.calls.mostRecent().args[0]).toEqual(ccs);
  

     expect(1).toBe(1);
  });


  it("should call callbacks on success", function() {
    $httpBackend.expect('GET', '/CreditCard').respond([{id: 1}, {id: 2}]);

    var spy1 = jasmine.createSpy("success");
    var spy2 = jasmine.createSpy("error");

    CreditCard.query(spy1, spy2);

    $httpBackend.flush();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
  });
  it("should call callbacks on error", function() {
    $httpBackend.expect('GET', '/CreditCard').respond(500);

    var spy1 = jasmine.createSpy("success");
    var spy2 = jasmine.createSpy("error");

    CreditCard.query(spy1, spy2);

    $httpBackend.flush();
    expect(spy2).toHaveBeenCalled();
    expect(spy1).not.toHaveBeenCalled();
  });

    it("should throw if passed to much arguments", function() {
    expect(function(){
    CreditCard.query("a", "b","a", "b","a", "b","a", "b","c","a");
    }).toThrow();
  });



  it("should have all arguments optional", function() {
    $httpBackend.expect('GET', '/CreditCard').respond([{id:1}]);

    var log = '';
    var ccs = CreditCard.query(function() { log += 'cb;'; });

    $httpBackend.flush();
    expect(ccs).toEqualData([{id:1}]);
    expect(log).toEqual('cb;');

     expect(1).toBe(1);
  });


  it('should delete resource and call callback', function() {
    $httpBackend.expect('DELETE', '/CreditCard/123').respond({});
    CreditCard.remove({id:123}, callback);
    expect(callback).not.toHaveBeenCalled();

    $httpBackend.flush();
    expect(callback.calls.mostRecent().args[0]).toEqualData({});
  

    callback = jasmine.createSpy();
    $httpBackend.expect('DELETE', '/CreditCard/333').respond(204, null);
    CreditCard.remove({id:333}, callback);
    expect(callback).not.toHaveBeenCalled();

    $httpBackend.flush();
    expect(callback.calls.mostRecent().args[0]).toEqualData({});
  

     expect(1).toBe(1);
  });


  it('should post charge verb', function() {
    $httpBackend.expect('POST', '/CreditCard/123!charge?amount=10', '{"auth":"abc"}').respond({success: 'ok'});
    CreditCard.charge({id:123, amount:10}, {auth:'abc'}, callback);

     expect(1).toBe(1);
  });


  it('should post charge verb on instance', function() {
    $httpBackend.expect('POST', '/CreditCard/123!charge?amount=10',
        '{"id":{"key":123},"name":"misko"}').respond({success: 'ok'});

    var card = new CreditCard({id:{key:123}, name:'misko'});
    card.$charge({amount:10}, callback);

     expect(1).toBe(1);
  });


  it("should patch a resource", function() {
    $httpBackend.expectPATCH('/CreditCard/123', '{"name":"igor"}').
                     respond({id: 123, name: 'rama'});

    var card = CreditCard.patch({id: 123}, {name: 'igor'}, callback);

    expect(card).toEqualData({name: 'igor'});
    expect(callback).not.toHaveBeenCalled();
    $httpBackend.flush();
    expect(callback).toHaveBeenCalled();
    expect(card).toEqualData({id: 123, name: 'rama'});

     expect(1).toBe(1);
  });


  it('should create on save', function() {
    $httpBackend.expect('POST', '/CreditCard', '{"name":"misko"}').respond({id: 123}, {header1: 'a'});

    var cc = new CreditCard();
    expect(cc.$get).toBeDefined();
    expect(cc.$query).toBeDefined();
    expect(cc.$remove).toBeDefined();
    expect(cc.$save).toBeDefined();

    cc.name = 'misko';
    cc.$save(callback);
    expect(cc).toEqualData({name:'misko'});

    $httpBackend.flush();
    expect(cc).toEqualData({id:123});
    expect(callback.calls.mostRecent().args[0]).toEqual(cc);

     expect(1).toBe(1);
  });


  it('should not mutate the resource object if response contains no body', function() {
    var data = {id:{key:123}, number:'9876'};
    $httpBackend.expect('GET', '/CreditCard/123').respond(data);

    var cc = CreditCard.get({id:123});
    $httpBackend.flush();
    expect(cc instanceof CreditCard).toBe(true);

    $httpBackend.expect('POST', '/CreditCard/123', angular.toJson(data)).respond('');
    var idBefore = cc.id;

    cc.$save();
    $httpBackend.flush();
    expect(idBefore).toEqual(cc.id);

     expect(1).toBe(1);
  });


  it('should bind default parameters', function() {
    $httpBackend.expect('GET', '/CreditCard/123.visa?minimum=0.05').respond({id: 123});
    var Visa = CreditCard.bind({verb:'.visa', minimum:0.05});
    var visa = Visa.get({id:123});
    $httpBackend.flush();
    expect(visa).toEqualData({id:123});

     expect(1).toBe(1);
  });


  it('should support dynamic default parameters (global)', function() {
    var currentGroup = 'students',
        Person = $resource('/Person/:group/:id', { group: function() { return currentGroup; }});


    $httpBackend.expect('GET', '/Person/students/fedor').respond({id: 'fedor', email: 'f@f.com'});

    var fedor = Person.get({id: 'fedor'});
    $httpBackend.flush();

    expect(fedor).toEqualData({id: 'fedor', email: 'f@f.com'});

     expect(1).toBe(1);
  });


  it('should support dynamic default parameters (action specific)', function() {
    var currentGroup = 'students',
      Person = $resource('/Person/:group/:id', {}, {
        fetch: {
          method: 'GET',
          params: {group: function() { return currentGroup; }}
        }

      });

    $httpBackend.expect('GET', '/Person/students/fedor').respond({id: 'fedor', email: 'f@f.com'});

    var fedor = Person.fetch({id: 'fedor'});
    $httpBackend.flush();

    expect(fedor).toEqualData({id: 'fedor', email: 'f@f.com'});
  });


  it('should exercise full stack', function() {
    var Person = $resource('/Person/:id');

    $httpBackend.expect('GET', '/Person/123').respond('\n{\n"name":\n"misko"\n}\n');
    var person = Person.get({id:123});
    $httpBackend.flush();
    expect(person.name).toEqual('misko');

     expect(1).toBe(1);
  });

  it('should return a resource instance when calling a class method with a resource instance', function() {
    $httpBackend.expect('GET', '/Person/123').respond('{"name":"misko"}');
    var Person = $resource('/Person/:id');
    var person = Person.get({id:123});
    $httpBackend.flush();
    $httpBackend.expect('POST', '/Person').respond('{"name":"misko2"}');

    var person2 = Person.save(person);
    $httpBackend.flush();

    expect(person2).toEqual(jasmine.any(Person));

     expect(1).toBe(1);
  });

  it('should not include $promise and $resolved when resource is toJson\'ed', function() {
    $httpBackend.expect('GET', '/CreditCard/123').respond({id: 123, number: '9876'});
    var cc = CreditCard.get({id: 123});
    $httpBackend.flush();

    cc.$myProp = 'still here';

    expect(cc.$promise).toBeDefined();
    expect(cc.$resolved).toBe(true);

    var json = JSON.parse(angular.toJson(cc));
    expect(json.$promise).not.toBeDefined();
    expect(json.$resolved).not.toBeDefined();
    expect(json).toEqual({id: 123, number: '9876', $myProp: 'still here'});

     expect(1).toBe(1);
  });

  describe('promise api', function() {

    var $rootScope, $http;

    beforeEach(inject(function(_$rootScope_, _$http_) {
      $rootScope = _$rootScope_;
      $http = _$http_;
    }));

    describe('promise resolution/rejection/correction', function () {
        var myCC = { number: '1234567890123456', expiration: '09-17' };
        var myCCModification = { test: 'exists' };
        var key = {                         // === Usage Target For Key ===
            httpError: '/CreditCrd',        // errorInterceptor and errorCallback
            throwError: '/CreditCard',      // errorInterceptor and errorCallback
            throwArrayError: '/CreditCards',// errorInterceptor and errorCallback
            httpSuccess: '/MyCreditCard',   // errorInterceptor and errorCallback
            returnPromise: 0,               // errorInterceptor and errorCallback
            returnHttpPromise: 1,           // errorInterceptor and errorCallback
            returnCorrection: 2,            // errorInterceptor and errorCallback
            returnObj: 3,                   // errorInterceptor and errorCallback
            returnArray: 4,                 // errorInterceptor and errorCallback
            returnVal: 5,                   // successCallback
            returnModify: 6,                // successCallback
            returnUndefined: 7,             // successCallback
            referenceModify: 8,             // successCallback
        };

        function createMySpy(name, opt, opt2) {
            var spy = jasmine.createSpy(name);
            if (angular.isDefined(opt)) {
                if (angular.isString(opt)) {
                    if (opt2 === key.returnHttpPromise) {
                        return spy.and.callFake(function(val) {
                            return $http({ method: 'GET', url: opt });
                        });
                    }
                    return spy.and.callFake(function() {
                        var returnPromise = opt2 === key.returnPromise || angular.isArray(opt2) && opt2.indexOf(key.returnPromise) !== -1;
                        var returnCorrection = opt2 === key.returnCorrection || angular.isArray(opt2) && opt2.indexOf(key.returnCorrection) !== -1;
                        var corrected = createResource(opt);
                        var newResource = corrected.odata().single();
                        if (returnCorrection)
                            return {
                                $correction: true,
                                $value: returnPromise ? newResource.$promise : newResource
                            };
                        return returnPromise ? newResource.$promise : newResource;
                    });
                }
                switch (opt) {
                    case key.returnVal:
                        return spy.and.callFake(function(val) {
                            return val;
                        });
                    case key.returnModify:
                        return spy.and.callFake(function (val, header) {
                            return angular.extend({}, val, myCCModification);
                        });
                    case key.referenceModify:
                        return spy.and.callFake(function(val) {
                            angular.extend(val, myCCModification);
                        });
                    case key.returnObj:
                        return spy.and.callFake(function(val) {
                            return $q.when(angular.extend({}, myCC));
                        });
                    case key.returnArray:
                        return spy.and.callFake(function(val) {
                            return $q.when([angular.extend({}, myCC)]);
                        });
                    case key.returnUndefined:
                        return spy;
                    default:
                        return spy;
                }
            }
            return spy;
        }

        function createResource(uri, useInterceptor) {
            return $resource(uri, {}, {
                odata: {
                    isArray: true,
                    interceptor: {
                        responseError: useInterceptor,
                    }
                }
            });
        }

        beforeEach(function () {
            $httpBackend.when('GET', key.httpError).respond(404, undefined, { 'response-id': key.httpError });
            $httpBackend.when('GET', key.throwError).respond(200, [], { 'response-id': key.throwError });
            $httpBackend.when('GET', key.throwArrayError).respond(200, { bad: 'I should be an array' }, { 'response-id': key.throwArrayError });
            $httpBackend.when('GET', key.httpSuccess).respond(200, [angular.extend({}, myCC)], { 'response-id': key.httpSuccess });
        });

        it('should resolve with no interceptors or callbacks', function () {
            var errorInterceptor = createMySpy('errorInterceptor');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpSuccess, errorInterceptor).odata().single(null, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).not.toHaveBeenCalled();
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve with no successCallback response', function () {
            var errorInterceptor = createMySpy('errorInterceptor');
            var successCallback = createMySpy('successCallback', key.returnUndefined);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpSuccess, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).not.toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve and successCallback response should not modify promise chain value', function () {
            var errorInterceptor = createMySpy('errorInterceptor');
            var successCallback = createMySpy('successCallback', key.returnModify);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpSuccess, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).not.toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(successCallback.calls.mostRecent().returnValue.test).toBe(myCCModification.test);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve with modification via successCallback parameter reference', function () {
            var errorInterceptor = createMySpy('errorInterceptor');
            var successCallback = createMySpy('successCallback', key.referenceModify);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpSuccess, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).not.toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].test).toBe(myCCModification.test);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.test).toBeDefined();
            expect(cc.test).toBe(myCCModification.test);
        });
        it('should reject on http error with no errorInterceptor', function () {
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(successCallback).not.toHaveBeenCalled();
            expect(errorCallback).toHaveBeenCalled();
            expect(cc.$promise.$$state.value.status).toBe(404);
        });
        it('should reject on httpError from errorInterceptor', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpError);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(successCallback).not.toHaveBeenCalled();
            expect(errorCallback).toHaveBeenCalled();
            expect(errorCallback.calls.mostRecent().args[0].status).toBe(404);
        });
        it('should resolve after errorInterceptor returns new obj', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.returnObj);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(null, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorInterceptor returns new array', function () {
            var successCallback = createMySpy('successCallback');
            var errorInterceptor = createMySpy('errorInterceptor', key.returnArray);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().query(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0][0].number).toBe(myCC.number);
            expect(cc[0].number).toBeDefined();
            expect(cc[0].number).toBe(myCC.number);
        });
        it('should resolve after errorInterceptor returns new $http promise', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess, key.returnHttpPromise);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].headers('response-id')).toBe(key.httpError);
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[1]['response-id']).toBe(key.httpSuccess);
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorInterceptor returns new Resource without successCallback', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess);
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(null, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorInterceptor returns new Resource with successCallback', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].headers('response-id')).toBe(key.httpError);
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[1]['response-id']).toBe(key.httpSuccess);
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorInterceptor returns new Resource promise', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess, key.returnPromise);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should fail on another get after errorInterceptor returns new Resource without correction', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].headers('response-id')).toBe(key.httpError);
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[1]['response-id']).toBe(key.httpSuccess);
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
            errorInterceptor.calls.reset();
            cc.$odata().single();
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
        });
        it('should resolve on another get after errorInterceptor returns new Resource with correction', function () {
            var errorInterceptor = createMySpy('errorInterceptor', key.httpSuccess, [key.returnHttpPromise, key.returnCorrection]);
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback');
            var cc = createResource(key.httpError, errorInterceptor).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).toHaveBeenCalled();
            expect(errorInterceptor.calls.mostRecent().args[0].headers('response-id')).toBe(key.httpError);
            expect(errorInterceptor.calls.mostRecent().args[0].status).toBe(404);
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[1]['response-id']).toBe(key.httpSuccess);
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
            errorInterceptor.calls.reset();
            successCallback.calls.reset();
            errorCallback.calls.reset();
            cc.$odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorInterceptor).not.toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[1]['response-id']).toBe(key.httpSuccess);
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).not.toHaveBeenCalled();
        });
        it('should resolve after errorCallback returns new obj', function () {
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback', key.returnObj);
            var cc = createResource(key.throwError).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorCallback).toHaveBeenCalled();
            expect(errorCallback.calls.mostRecent().args[0]).toBe('The response returned no result');
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorCallback returns new array', function () {
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback', key.returnArray);
            var cc = createResource(key.throwArrayError).odata().query(successCallback, errorCallback);
            $httpBackend.flush();
            expect(errorCallback).toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0][0].number).toBe(myCC.number);
            expect(cc[0].number).toBeDefined();
            expect(cc[0].number).toBe(myCC.number);
        });
        it('should resolve after errorCallback returns new Resource without successCallback', function () {
            var errorCallback = createMySpy('errorCallback', key.httpSuccess);
            var cc = createResource(key.throwError).odata().single(null, errorCallback);
            $httpBackend.flush();
            expect(errorCallback).toHaveBeenCalled();
            expect(errorCallback.calls.mostRecent().args[0]).toBe('The response returned no result');
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorCallback returns new Resource with successCallback', function () {
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback', key.httpSuccess);
            var cc = createResource(key.throwError).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).toHaveBeenCalled();
            expect(errorCallback.calls.mostRecent().args[0]).toBe('The response returned no result');
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });
        it('should resolve after errorCallback returns new Resource promise', function () {
            var successCallback = createMySpy('successCallback');
            var errorCallback = createMySpy('errorCallback', key.httpSuccess, key.returnPromise);
            var cc = createResource(key.throwError).odata().single(successCallback, errorCallback);
            $httpBackend.flush();
            expect(successCallback).toHaveBeenCalled();
            expect(successCallback.calls.mostRecent().args[0].number).toBe(myCC.number);
            expect(errorCallback).toHaveBeenCalled();
            expect(errorCallback.calls.mostRecent().args[0]).toBe('The response returned no result');
            expect(cc.number).toBeDefined();
            expect(cc.number).toBe(myCC.number);
        });

    });


      describe('single resource', function() {

          it('should add $promise to the result object', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({id: 123, number: '9876'});
              var cc = CreditCard.get({id: 123});

              cc.$promise.then(callback);
              expect(callback).not.toHaveBeenCalled();

              $httpBackend.flush();

              expect(callback).toHaveBeenCalledOnce();
              expect(callback.calls.mostRecent().args[0]).toBe(cc);

              expect(1).toBe(1);
          });


          it('should keep $promise around after resolution', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              var cc = CreditCard.get({ id: 123 });

              cc.$promise.then(callback);
              $httpBackend.flush();

              callback = jasmine.createSpy();

              cc.$promise.then(callback);
              $rootScope.$apply(); //flush async queue

              expect(callback).toHaveBeenCalledOnce();

              expect(1).toBe(1);
          });


          it('should keep the original promise after instance action', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              $httpBackend.expect('POST', '/CreditCard/123').respond({ id: 123, number: '9876' });

              var cc = CreditCard.get({ id: 123 });
              var originalPromise = cc.$promise;

              cc.number = '666';
              cc.$save({ id: 123 });

              expect(cc.$promise).toBe(originalPromise);

              expect(1).toBe(1);
          });


          it('should allow promise chaining', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              var cc = CreditCard.get({ id: 123 });

              cc.$promise.then(function(value) { return 'new value'; }).then(callback);
              $httpBackend.flush();

              expect(callback).toHaveBeenCalledOnceWith('new value');

              expect(1).toBe(1);
          });


          it('should allow $promise error callback registration', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond(404, 'resource not found');
              var cc = CreditCard.get({ id: 123 });

              cc.$promise.then(null, callback);
              $httpBackend.flush();

              var response = callback.calls.mostRecent().args[0];

              expect(response.data).toEqual('resource not found');
              expect(response.status).toEqual(404);

              expect(1).toBe(1);
          });


          it('should add $resolved boolean field to the result object', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              var cc = CreditCard.get({ id: 123 });

              expect(cc.$resolved).toBe(false);

              cc.$promise.then(callback);
              expect(cc.$resolved).toBe(false);

              $httpBackend.flush();

              expect(cc.$resolved).toBe(true);

              expect(1).toBe(1);
          });


          it('should set $resolved field to true when an error occurs', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond(404, 'resource not found');
              var cc = CreditCard.get({ id: 123 });

              cc.$promise.then(null, callback);
              $httpBackend.flush();
              expect(callback).toHaveBeenCalledOnce();
              expect(cc.$resolved).toBe(true);

              expect(1).toBe(1);
          });


          it('should keep $resolved true in all subsequent interactions', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              var cc = CreditCard.get({ id: 123 });
              $httpBackend.flush();
              expect(cc.$resolved).toBe(true);

              $httpBackend.expect('POST', '/CreditCard/123').respond();
              cc.$save({ id: 123 });
              expect(cc.$resolved).toBe(true);
              $httpBackend.flush();
              expect(cc.$resolved).toBe(true);

              expect(1).toBe(1);
          });


          it('should return promise from action method calls', function() {
              $httpBackend.expect('GET', '/CreditCard/123').respond({ id: 123, number: '9876' });
              var cc = new CreditCard({ name: 'Mojo' });

              expect(cc).toEqualData({ name: 'Mojo' });

              cc.$get({ id: 123 }).then(callback);

              $httpBackend.flush();
              expect(callback).toHaveBeenCalledOnce();
              expect(cc).toEqualData({ id: 123, number: '9876' });
              callback = jasmine.createSpy();

              $httpBackend.expect('POST', '/CreditCard').respond({ id: 1, number: '9' });

              cc.$save().then(callback);

              $httpBackend.flush();
              expect(callback).toHaveBeenCalledOnce();
              expect(cc).toEqualData({ id: 1, number: '9' });

              expect(1).toBe(1);
          });


          it('should allow parsing a value from headers', function() {
              // https://github.com/angular/angular.js/pull/2607#issuecomment-17759933
              $httpBackend.expect('POST', '/CreditCard').respond(201, '', { 'Location': '/new-id' });

              var parseUrlFromHeaders = function(response) {
                  var resource = response.resource;
                  resource.url = response.headers('Location');
                  return resource;
              };

              var CreditCard = $resource('/CreditCard', {}, {
                  save: {
                      method: 'post',
                      interceptor: { response: parseUrlFromHeaders }
                  }

              });

              var cc = new CreditCard({ name: 'Me' });

              cc.$save();
              $httpBackend.flush();

              expect(cc.url).toBe('/new-id');
          });

          it('should pass the same transformed value to success callbacks and to promises', function() {
              $httpBackend.expect('GET', '/CreditCard').respond(200, { value: 'original' });

              var transformResponse = function(response) {
                  return { value: 'transformed' };
              };

              var CreditCard = $resource('/CreditCard', {}, {
                  call: {
                      method: 'get',
                      interceptor: { response: transformResponse }
                  }

              });

              var successValue,
                  promiseValue;

              var cc = new CreditCard({ name: 'Me' });

              var req = cc.$call({}, function(result) {
                  successValue = result;
              });
              req.then(function(result) {
                  promiseValue = result;
              });

              $httpBackend.flush();
              expect(successValue).toEqual({ value: 'transformed' });
              expect(promiseValue).toEqual({ value: 'transformed' });
              expect(successValue).toBe(promiseValue);
          });
      });


    describe('resource collection', function() {

      it('should add $promise to the result object', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond([{id: 1}, {id: 2}]);
        var ccs = CreditCard.query({key: 'value'});

        ccs.$promise.then(callback);
        expect(callback).not.toHaveBeenCalled();

        $httpBackend.flush();

        expect(callback).toHaveBeenCalledOnce();
        expect(callback.calls.mostRecent().args[0]).toBe(ccs);

     expect(1).toBe(1);
      });


      it('should keep $promise around after resolution', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond([{id: 1}, {id: 2}]);
        var ccs = CreditCard.query({key: 'value'});

        ccs.$promise.then(callback);
        $httpBackend.flush();

        callback = jasmine.createSpy();

        ccs.$promise.then(callback);
        $rootScope.$apply(); //flush async queue

        expect(callback).toHaveBeenCalledOnce();

     expect(1).toBe(1);
      });


      it('should allow promise chaining', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond([{id: 1}, {id: 2}]);
        var ccs = CreditCard.query({key: 'value'});

        ccs.$promise.then(function(value) { return 'new value'; }).then(callback);
        $httpBackend.flush();

        expect(callback).toHaveBeenCalledOnceWith('new value');

     expect(1).toBe(1);
      });


      it('should allow $promise error callback registration', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond(404, 'resource not found');
        var ccs = CreditCard.query({key: 'value'});

        ccs.$promise.then(null, callback);
        $httpBackend.flush();

        var response = callback.calls.mostRecent().args[0];

        expect(response.data).toEqual('resource not found');
        expect(response.status).toEqual(404);

     expect(1).toBe(1);
      });


      it('should add $resolved boolean field to the result object', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond([{id: 1}, {id: 2}]);
        var ccs = CreditCard.query({key: 'value'}, callback);

        expect(ccs.$resolved).toBe(false);

        ccs.$promise.then(callback);
        expect(ccs.$resolved).toBe(false);

        $httpBackend.flush();

        expect(ccs.$resolved).toBe(true);

     expect(1).toBe(1);
      });


      it('should set $resolved field to true when an error occurs', function() {
        $httpBackend.expect('GET', '/CreditCard?key=value').respond(404, 'resource not found');
        var ccs = CreditCard.query({key: 'value'});

        ccs.$promise.then(null, callback);
        $httpBackend.flush();
        expect(callback).toHaveBeenCalledOnce();
        expect(ccs.$resolved).toBe(true);

     expect(1).toBe(1);
      });
    });

    it('should allow per action response interceptor that gets full response', function() {
      CreditCard = $resource('/CreditCard', {}, {
        query: {
          method: 'get',
          isArray: true,
          interceptor: {
            response: function(response) {
              return response;
            }
          }
        }

      });

      $httpBackend.expect('GET', '/CreditCard').respond([{id: 1}]);

      var ccs = CreditCard.query();

      ccs.$promise.then(callback);

      $httpBackend.flush();
      expect(callback).toHaveBeenCalledOnce();

      var response = callback.calls.mostRecent().args[0];
      expect(response.resource).toBe(ccs);
      expect(response.status).toBe(200);
      expect(response.config).toBeDefined();
    });


    it('should allow per action responseError interceptor that gets full response', function() {
      CreditCard = $resource('/CreditCard', {}, {
        query: {
          method: 'get',
          isArray: true,
          interceptor: {
            responseError: function(response) {
              return $q.reject(response);
            }
          }
        }

      });

      $httpBackend.expect('GET', '/CreditCard').respond(404);

      var ccs = CreditCard.query();

      ccs.$promise.catch(callback);

      $httpBackend.flush();
      expect(callback).toHaveBeenCalledOnce();

      var response = callback.calls.mostRecent().args[0];
      expect(response.status).toBe(404);
      expect(response.config).toBeDefined();
    });
  });


  describe('failure mode', function() {
    var ERROR_CODE = 500,
        ERROR_RESPONSE = 'Server Error',
        errorCB;

    beforeEach(function() {
      errorCB = jasmine.createSpy('error').andCallFake(function(response) {
        expect(response.data).toBe(ERROR_RESPONSE);
        expect(response.status).toBe(ERROR_CODE);
      });
    });


  });

  it('should transform request/response', function() {
    var Person = $resource('/Person/:id', {}, {
      save: {
        method: 'POST',
        params: {id: '@id'},
        transformRequest: function(data) {
          return angular.toJson({ __id: data.id });
        },
        transformResponse: function(data) {
          return { id: data.__id };
        }
      }

    });

    $httpBackend.expect('POST', '/Person/123', { __id: 123 }).respond({ __id: 456 });
    var person = new Person({id:123});
    person.$save();
    $httpBackend.flush();
    expect(person.id).toEqual(456);
  });

  describe('suffix parameter', function() {

    describe('query', function() {
      it('should add a suffix', function() {
        $httpBackend.expect('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
        var UserService = $resource('/users/:id.json', {id: '@id'});
        var user = UserService.query();
        $httpBackend.flush();
        expect(user).toEqualData([{id: 1, name: 'user1'}]);

     expect(1).toBe(1);
      });

      it('should not require it if not provided', function() {
        $httpBackend.expect('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
        var UserService = $resource('/users.json');
        var user = UserService.query();
        $httpBackend.flush();
        expect(user).toEqualData([{id: 1, name: 'user1'}]);

     expect(1).toBe(1);
      });

      it('should work when query parameters are supplied', function() {
        $httpBackend.expect('GET', '/users.json?red=blue').respond([{id: 1, name: 'user1'}]);
        var UserService = $resource('/users/:user_id.json', {user_id: '@id'});
        var user = UserService.query({red: 'blue'});
        $httpBackend.flush();
        expect(user).toEqualData([{id: 1, name: 'user1'}]);

     expect(1).toBe(1);
      });

      it('should work when query parameters are supplied and the format is a resource parameter', function() {
        $httpBackend.expect('GET', '/users.json?red=blue').respond([{id: 1, name: 'user1'}]);
        var UserService = $resource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
        var user = UserService.query({red: 'blue'});
        $httpBackend.flush();
        expect(user).toEqualData([{id: 1, name: 'user1'}]);

     expect(1).toBe(1);
      });

      it('should work with the action is overriden', function() {
        $httpBackend.expect('GET', '/users.json').respond([{id: 1, name: 'user1'}]);
        var UserService = $resource('/users/:user_id', {user_id: '@id'}, {
          query: {
            method: 'GET',
            url: '/users/:user_id.json',
            isArray: true
          }

        });
        var user = UserService.query();
        $httpBackend.flush();
        expect(user).toEqualData([{id: 1, name: 'user1'}]);
      });

      it('should not convert string literals in array into Resource objects', function() {
        $httpBackend.expect('GET', '/names.json').respond(["mary", "jane"]);
        var strings = $resource('/names.json').query();
        $httpBackend.flush();
        expect(strings).toEqualData(["mary", "jane"]);

     expect(1).toBe(1);
      });

      it('should not convert number literals in array into Resource objects', function() {
        $httpBackend.expect('GET', '/names.json').respond([213, 456]);
        var numbers = $resource('/names.json').query();
        $httpBackend.flush();
        expect(numbers).toEqualData([213, 456]);

     expect(1).toBe(1);
      });

      it('should not convert boolean literals in array into Resource objects', function() {
        $httpBackend.expect('GET', '/names.json').respond([true, false]);
        var bools = $resource('/names.json').query();
        $httpBackend.flush();
        expect(bools).toEqualData([true, false]);

     expect(1).toBe(1);
      });
    });

    describe('get', function() {
      it('should add them to the id', function() {
        $httpBackend.expect('GET', '/users/1.json').respond({id: 1, name: 'user1'});
        var UserService = $resource('/users/:user_id.json', {user_id: '@id'});
        var user = UserService.get({user_id: 1});
        $httpBackend.flush();
        expect(user).toEqualData({id: 1, name: 'user1'});

     expect(1).toBe(1);
      });

      it('should work when an id and query parameters are supplied', function() {
        $httpBackend.expect('GET', '/users/1.json?red=blue').respond({id: 1, name: 'user1'});
        var UserService = $resource('/users/:user_id.json', {user_id: '@id'});
        var user = UserService.get({user_id: 1, red: 'blue'});
        $httpBackend.flush();
        expect(user).toEqualData({id: 1, name: 'user1'});

     expect(1).toBe(1);
      });

      it('should work when the format is a parameter', function() {
        $httpBackend.expect('GET', '/users/1.json?red=blue').respond({id: 1, name: 'user1'});
        var UserService = $resource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
        var user = UserService.get({user_id: 1, red: 'blue'});
        $httpBackend.flush();
        expect(user).toEqualData({id: 1, name: 'user1'});

     expect(1).toBe(1);
      });

      it('should work with the action is overriden', function() {
        $httpBackend.expect('GET', '/users/1.json').respond({id: 1, name: 'user1'});
        var UserService = $resource('/users/:user_id', {user_id: '@id'}, {
          get: {
            method: 'GET',
            url: '/users/:user_id.json'
          }

        });
        var user = UserService.get({user_id: 1});
        $httpBackend.flush();
        expect(user).toEqualData({id: 1, name: 'user1'});
      });
    });

    describe("save", function() {
      it('should append the suffix', function() {
        $httpBackend.expect('POST', '/users.json', '{"name":"user1"}').respond({id: 123, name: 'user1'});
        var UserService = $resource('/users/:user_id.json', {user_id: '@id'});
        var user = UserService.save({name: 'user1'}, callback);
        expect(user).toEqualData({name: 'user1'});
        expect(callback).not.toHaveBeenCalled();
        $httpBackend.flush();
        expect(user).toEqualData({id: 123, name: 'user1'});
        expect(callback).toHaveBeenCalledOnce();
        expect(callback.calls.mostRecent().args[0]).toEqual(user);
      

     expect(1).toBe(1);
      });

      it('should append when an id is supplied', function() {
        $httpBackend.expect('POST', '/users/123.json', '{"id":123,"name":"newName"}').respond({id: 123, name: 'newName'});
        var UserService = $resource('/users/:user_id.json', {user_id: '@id'});
        var user = UserService.save({id: 123, name: 'newName'}, callback);
        expect(callback).not.toHaveBeenCalled();
        $httpBackend.flush();
        expect(user).toEqualData({id: 123, name: 'newName'});
        expect(callback).toHaveBeenCalledOnce();
        expect(callback.calls.mostRecent().args[0]).toEqual(user);
      

     expect(1).toBe(1);
      });

      it('should append when an id is supplied and the format is a parameter', function() {
        $httpBackend.expect('POST', '/users/123.json', '{"id":123,"name":"newName"}').respond({id: 123, name: 'newName'});
        var UserService = $resource('/users/:user_id.:format', {user_id: '@id', format: 'json'});
        var user = UserService.save({id: 123, name: 'newName'}, callback);
        expect(callback).not.toHaveBeenCalled();
        $httpBackend.flush();
        expect(user).toEqualData({id: 123, name: 'newName'});
        expect(callback).toHaveBeenCalledOnce();
        expect(callback.calls.mostRecent().args[0]).toEqual(user);
      

     expect(1).toBe(1);
      });
    });

    describe('escaping /. with /\\.', function() {
      it('should work with query()', function() {
        $httpBackend.expect('GET', '/users/.json').respond();
        $resource('/users/\\.json').query();

     expect(1).toBe(1);
      });
      it('should work with get()', function() {
        $httpBackend.expect('GET', '/users/.json').respond();
        $resource('/users/\\.json').get();

     expect(1).toBe(1);
      });
      it('should work with save()', function() {
        $httpBackend.expect('POST', '/users/.json').respond();
        $resource('/users/\\.json').save({});

     expect(1).toBe(1);
      });
    });
  });

  describe('action-level url override', function() {

    it('should support overriding url template with static url', function() {
      $httpBackend.expect('GET', '/override-url?type=Customer&typeId=123').respond({id: 'abc'});
      var TypeItem = $resource('/:type/:typeId', {type: 'Order'}, {
        get: {
          method: 'GET',
          params: {type: 'Customer'},
          url: '/override-url'
        }

      });
      var item = TypeItem.get({typeId: 123});
      $httpBackend.flush();
      expect(item).toEqualData({id: 'abc'});
    });


    it('should support overriding url template with a new template ending in param', function() {
      //    url parameter in action, parameter ending the string
      $httpBackend.expect('GET', '/Customer/123').respond({id: 'abc'});
      var TypeItem = $resource('/foo/:type', {type: 'Order'}, {
        get: {
          method: 'GET',
          params: {type: 'Customer'},
          url: '/:type/:typeId'
        }

      });
      var item = TypeItem.get({typeId: 123});
      $httpBackend.flush();
      expect(item).toEqualData({id: 'abc'});

      //    url parameter in action, parameter not ending the string
      $httpBackend.expect('GET', '/Customer/123/pay').respond({id: 'abc'});
      TypeItem = $resource('/foo/:type', {type: 'Order'}, {
        get: {
          method: 'GET',
          params: {type: 'Customer'},
          url: '/:type/:typeId/pay'
        }
      });
      item = TypeItem.get({typeId: 123});
      $httpBackend.flush();
      expect(item).toEqualData({id: 'abc'});
    });


    it('should support overriding url template with a new template ending in string', function() {
      $httpBackend.expect('GET', '/Customer/123/pay').respond({id: 'abc'});
      var TypeItem = $resource('/foo/:type', {type: 'Order'}, {
        get: {
          method: 'GET',
          params: {type: 'Customer'},
          url: '/:type/:typeId/pay'
        }

      });
      var item = TypeItem.get({typeId: 123});
      $httpBackend.flush();
      expect(item).toEqualData({id: 'abc'});
    });

    it('should throw if passed hasOwnProperty as a segment of the url', function() {
      expect(function(){
        $resource('/foo/hasOwnProperty').query();
      }).toThrow();
    });

    it('should throw if passed hasOwnProperty as a template url', function() {
      expect(function(){
        $resource('/foo/:a',{a:"@hasOwnProperty"}).query();
      }).toThrow();
    });

    it('should throw if passed null', function() {
      expect(function(){
        $resource(null).query();
      }).toThrow();
    });
  });
});

describe('resource', function() {
  var $httpBackend, $resource;

  beforeEach(module(function($exceptionHandlerProvider) {
    $exceptionHandlerProvider.mode('log');
  }));

  beforeEach(module('ngResource'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $resource = $injector.get('$resource');
  }));
});
