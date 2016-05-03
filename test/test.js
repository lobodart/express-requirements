var mocha = require('mocha');
var request = require('supertest');
var should = require('should');
var app = require('./helpers/app');

var uri = '/test';

describe('Testing request parameters', function() {
  it('Required param not included - Basic message', function(done) {
    request(app)
    .get(uri)
    .expect(400, done)
    .expect({
      error: 'missing_firstName_parameter'
    });
  });

  it('Required param included but empty - Basic message', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: ''
    })
    .expect(400, done)
    .expect({
      error: 'bad_request'
    });
  });

  it('Param not alpha as it must be - Basic message', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John42'
    })
    .expect(400, done)
    .expect({
      error: 'bad_request'
    });
  });

  it('Required param not included - Custom message', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John'
    })
    .expect(400, done)
    .expect({
      error: 'lastName_is_required'
    });
  });

  it('Required param included but empty - Custom message', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: ''
    })
    .expect(400, done)
    .expect({
      error: 'lastName_is_empty'
    });
  });

  it('Param not alpha as it must be - Custom message', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe42'
    })
    .expect(400, done)
    .expect({
      error: 'lastName_must_be_alpha'
    });
  });

  it('Testing _parameter keyword (fail)', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe',
      data: 'FooBar'
    })
    .expect(400, done)
    .expect({
      error: 'wrong_data'
    });
  });

  it('Testing _parameter keyword (success)', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe',
      data: '042.jd'
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Testing _parameter keyword with integer (fail)', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe',
      license: 42
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Testing _parameter keyword with integer (success)', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe',
      license: 41
    })
    .expect(400, done)
    .expect({
      error: 'license_not_divisble_by_2'
    });
  });
});

describe('Testing scopes', function() {
  it('Testing headers scope', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe',
      'x-auth': '42'
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Testing headers scope validator error', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe'
    })
    .set('x-auth', 'auth42')
    .expect(400, done)
    .expect({
      error: 'bad_request'
    });
  });

  it('Testing headers scope validator success', function(done) {
    request(app)
    .get(uri)
    .send({
      firstName: 'John',
      lastName: 'Doe'
    })
    .set('x-auth', 'authentication')
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Testing params scope validator error', function(done) {
    request(app)
    .get('/test/foo')
    .send({
      firstName: 'John',
      lastName: 'Doe'
    })
    .expect(400, done)
    .expect({
      error: 'id_must_be_integer'
    });
  });

  it('Testing params scope validator success', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John',
      lastName: 'Doe'
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });
});

describe('Testing personal validators', function() {

});

describe('Testing inheritance', function() {
  it('Nonexistent required inheritance', function(done) {
    request(app)
    .get('/test/42')
    .expect(400, done)
    .expect({
      error: 'missing_lastName_parameter'
    });
  });

  it('Required param included but empty', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: ''
    })
    .expect(400, done)
    .expect({
      error: 'bad_request'
    });
  });

  it('Param not alpha as it must be', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John42'
    })
    .expect(400, done)
    .expect({
      error: 'bad_request'
    });
  });

  it('Param not alpha as it must be (second param)', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John',
      lastName: 'Doe42'
    })
    .expect(400, done)
    .expect({
      error: 'lastName_must_be_alpha'
    });
  });

  it('Everything should be ok', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John',
      lastName: 'Doe'
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Preparing override test', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      age: 24
    })
    .expect(200, done)
    .expect({
      success: true
    });
  });

  it('Testing override', function(done) {
    request(app)
    .get('/test/42')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      age: 'foobar'
    })
    .expect(403, done)
    .expect({
      error: 'bad_request'
    });
  });
});