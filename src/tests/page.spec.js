import DetailView from './fixtures/simpleApp/detailView';
import CountAppView from './fixtures/countApp/countAppView';
import CountIncrementView from './fixtures/countApp/countIncrementView';
import QuestionAppView from './fixtures/questionApp/questionAppView';
import CallOutView from './fixtures/callOut/countAppView';
import RouteRoot from './fixtures/routes/root.component';
import Test from '../local/testHarness';
import * as assert from 'assert';

/**
 * Simple unit tests.
 */
describe('Page', function () {
  it('Simple page renders as expected.', function (done) {
    Test.run(DetailView)
      .then(function () {
        assert.ok(Test.exists('span'), 'could not find span element');
        assert.equal(Test.getInnerHTML('span'), 'Details', 'span does not have correct value');
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Page with events renders and behaves as expected.', function (done) {
    Test.run(
      CountAppView,
      { count: 0 },
      {
        storage: {
          session: { example: 'hello' },
          local: { text: 'world' }
        }
      })
      .then(() => {
        assert.equal(Test.getInnerHTML('#countDisplay'), '0', 'countDisplay has incorrect value.');
        Test.click('#countIncrement');

        setTimeout(function () {
          assert.equal(Test.getInnerHTML('#countDisplay'), '1', 'countDisplay has incorrect value after click.');
          done();
        }, 100);
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('CountIncrementView should work with subscriptions', function (done) {
    Test.run(CountIncrementView).then(page => {
      page.view.subscribe('Increment', event => {
        assert.equal(event.type, 'Increment');
      });
      Test.click('#countIncrement');
      done();
    }).catch(err => done(err));
  });

  it('QuestionPage renders and behaves as expected.', function (done) {
    Test.run(QuestionAppView, { questions: [] })
      .then(() => {
        assert.equal(Test.getInnerHTML('#questionSize'), '0', 'questionSize has incorrect value.');
        Test.click('#questionAdd');

        setTimeout(function () {
          assert.equal(Test.getInnerHTML('#questionSize'), '1', 'questionSize has incorrect value after click.');
          done();
        }, 100);
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Should handle request overrides as expected.', function (done) {
    Test.run(
      CallOutView,
      { count: 5 },
      {
        http: {
          request: {
            'GET:http://fake.org/functions/increment': 6
          }
        },
        store: {
          action: {
            IncrementComplete: () => {
              assert.equal(Test.getInnerHTML('#countDisplay'), '6', 'countDisplay has incorrect value after click.');
              done();
            }
          }
        }
      })
      .then(() => {
        assert.equal(Test.getInnerHTML('#countDisplay'), '5', 'countDisplay has incorrect value.');
        Test.click('#countIncrement');
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Should handle routes ok.', function (done) {
    // window.location = { href: '/one' };
    Test.run(RouteRoot, {}, { url: 'http://localhost' })
      .then(page => {
        assert.equal(Test.getInnerHTML('#default'), 'Hello from default', 'displayDefault has incorrect value.');

        page.navigate('http://localhost/one')
          .then(() => {
            assert.equal(Test.getInnerHTML('#sub1'), 'Hello from sub one', 'displaySubOne has incorrect value.');
            done();
          });
      });
  });
});
