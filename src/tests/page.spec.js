import DetailView from './fixtures/simpleApp/detailView';
import CountAppView from './fixtures/countApp/countAppView';
import QuestionAppView from './fixtures/questionApp/questionAppView';
import CallOutView from './fixtures/callOut/countAppView';
import RouteRoot from './fixtures/routes/root.component';
import PageBuilder from '../local/pageBuilder';
import * as assert from 'assert';

/**
 * Simple unit tests.
 */
describe('Page', function () {
  it('Simple page renders as expected.', function (done) {
    PageBuilder.test(DetailView)
      .then(function () {
        const span = document.querySelector('span');
        assert.ok(span, 'could not find span element');
        assert.equal(span.innerHTML, 'Details', 'span does not have correct value');
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Page with events renders and behaves as expected.', function (done) {
    PageBuilder.test(
      CountAppView,
      { count: 0 },
      {
        storage: {
          session: { example: 'hello' },
          local: { text: 'world' }
        }
      })
      .then(function (page) {
        page.tick();
        let displayCount = document.querySelector('#countDisplay');
        const incrementCount = document.querySelector('#countIncrement');

        assert.ok(displayCount, 'could not find countDisplay element');
        assert.equal(displayCount.innerHTML, '0', 'countDisplay has incorrect value.');
        assert.ok(incrementCount, 'could not find countIncrement element');

        // simulate a click on the increment count element.
        incrementCount.dispatchEvent(new window.Event('click'));
        page.tick();

        setTimeout(function () {
          displayCount = document.querySelector('#countDisplay');
          assert.ok(displayCount, 'could not find countDisplay element after click.');
          assert.equal(displayCount.innerHTML, '1', 'countDisplay has incorrect value after click.');
          done();
        }, 100);
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('QuestionPage renders and behaves as expected.', function (done) {
    PageBuilder.test(QuestionAppView, { questions: [] })
      .then(function (page) {
        page.tick();
        let questionSize = document.querySelector('#questionSize');
        const questionAdd = document.querySelector('#questionAdd');

        assert.ok(questionSize, 'could not find questionSize element');
        assert.equal(questionSize.innerHTML, '0', 'questionSize has incorrect value.');
        assert.ok(questionAdd, 'could not find questionAdd element');

        // simulate a click on the increment count element.
        questionAdd.dispatchEvent(new window.Event('click'));
        page.tick();

        setTimeout(function () {
          questionSize = document.querySelector('#questionSize');
          assert.ok(questionSize, 'could not find questionSize element after click.');
          assert.equal(questionSize.innerHTML, '1', 'questionSize has incorrect value after click.');
          done();
        }, 100);
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Should handle request overrides as expected.', function (done) {
    PageBuilder.test(
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
              const displayCount = document.querySelector('#countDisplay');
              assert.ok(displayCount, 'could not find countDisplay element after click.');
              assert.equal(displayCount.innerHTML, '6', 'countDisplay has incorrect value after click.');
              done();
            }
          }
        }
      })
      .then(function (page) {
        page.tick();
        const displayCount = document.querySelector('#countDisplay');
        const incrementCount = document.querySelector('#countIncrement');

        assert.ok(displayCount, 'could not find countDisplay element');
        assert.equal(displayCount.innerHTML, '5', 'countDisplay has incorrect value.');
        assert.ok(incrementCount, 'could not find countIncrement element');

        // simulate a click on the increment count element.
        incrementCount.dispatchEvent(new window.Event('click'));
        page.tick();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('Should handle routes ok.', function (done) {
    // window.location = { href: '/one' };
    PageBuilder.test(RouteRoot, {}, { url: 'http://localhost' })
      .then(page => {
        const displayDefault = document.querySelector('#default');
        assert.ok(displayDefault, 'could not find displayDefault element.');
        assert.equal(displayDefault.innerHTML, 'Hello from default', 'displayDefault has incorrect value.');

        page.navigate('http://localhost/one')
          .then(() => {
            const displaySubOne = document.querySelector('#sub1');
            assert.ok(displaySubOne, 'could not find displaySubOne element.');
            assert.equal(displaySubOne.innerHTML, 'Hello from sub one', 'displaySubOne has incorrect value.');
            done();
          });
      });
  });
});
