
import Test from '../local/testHarness';
import CountReducer from './fixtures/callOut/countReducer';
import * as assert from 'assert';

/**
 * Simple unit tests.
 */
describe('Reducer', function () {
  it('Simple reducer works as expected.', function (done) {
    Test.run(
      CountReducer,
      1,
      {
        http: {
          request: {
            'GET:http://fake.org/functions/increment': 5
          }
        },
        store: {
          action: {
            IncrementComplete: event => {
              assert.equal(event.state, 5, 'state is not correct.');
              done();
            }
          }
        }
      }
    )
      .then(reducer => {
        assert.equal(reducer.store.getState(), 1, 'initial state is incorrect.');
        reducer.emit('Increment');
      })
      .catch(err => {
        done(err);
      });
  });
});
