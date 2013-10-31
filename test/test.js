var expect = require('chai').expect
var sinon = require('sinon');
var wsSocketHelper = require('../index');

var channel = 'some-channel';
var event = 'hei-event';
var dataString = 'string';

describe('wsSocketHelper', function(){
  describe('createJSONString', function() {
    it('should return json string with channel, events and data', function() {

      var jsonString = wsSocketHelper.createJSONString(channel, event, {dataString: dataString});
      var json = JSON.parse(jsonString);
      expect(json.event).to.be.equal(event);
      expect(json.channel).to.be.equal(channel);
      expect(json.data.dataString).to.be.equal(dataString);
    });
  });

  describe('callCallbacksForMessage', function () {
    it('validates if valid json', function() {
      var errors = wsSocketHelper.callCallbacksForMessage({});
      expect(errors).to.be.a('object');
      expect(errors.json).to.be.a("string");
    });

    it('validates if message contains channel and event', function () {
      var errors = wsSocketHelper.callCallbacksForMessage('{"hei": "hallo"}');
      expect(errors).to.be.a('object');
      expect(errors.event).to.be.a('string');
      expect(errors.channel).to.be.a('string');
    });

    it('calls callbacks for message', function() {
      var spy = sinon.spy();
      wsSocketHelper.addCallbackToEventOnChannel(channel, event, spy);
      var jsonString = wsSocketHelper.createJSONString(channel, event, {data: dataString});
      wsSocketHelper.callCallbacksForMessage(jsonString);
      expect(spy.calledOnce).to.be.true;
    })
  });

  describe('addCallbackToEventOnChannel', function () {
    it('adds callback', function () {
      var spy = sinon.spy();
      wsSocketHelper.addCallbackToEventOnChannel(channel, event, spy);
      var jsonString = wsSocketHelper.createJSONString(channel, event, {data: dataString});
      wsSocketHelper.callCallbacksForMessage(jsonString);
      expect(spy.calledOnce).to.be.true;
    });

    it('requires callback to be a function', function () {
      var errors = wsSocketHelper.addCallbackToEventOnChannel(channel, event, {});
      expect(errors).to.be.a('object');
      expect(errors.errors.callback).to.be.a('string');
    });

    it('returns errors when callback already added', function() {
      var func = function() {};
      var errors = wsSocketHelper.addCallbackToEventOnChannel(channel, event, func);
      expect(errors).to.be.undefined;
      errors = wsSocketHelper.addCallbackToEventOnChannel(channel, event, func);
      expect(errors).to.be.a('object');
    });
  });

  it('removes callback', function() {
    var spy = sinon.spy();
    wsSocketHelper.addCallbackToEventOnChannel(channel, event, spy);
    var jsonString = wsSocketHelper.createJSONString(channel, event, {data: dataString});
    wsSocketHelper.removeCallbackForEventOnChannel(channel, event, spy);
    wsSocketHelper.callCallbacksForMessage(jsonString);
    expect(spy.calledOnce).to.be.false;
  });

});
