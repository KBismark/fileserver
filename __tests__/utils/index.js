
describe('TryCatch', () => {
    const {TryCatch} = require('../../utils/trycatch')
    // successfully executes a resolved promise
    it('should return the result when the promise resolves', async () => {
      const action = async () => 'success';
      const response = await TryCatch(action);
      expect(response.result).toBe('success');
      expect(response.errored).toBe(false);
    });

    // handles a rejected promise
    it('should return an error when the promise rejects', async () => {
      const action = async () => { throw new Error('failure'); };
      const response = await TryCatch(action);
      expect(response.result).toBeUndefined();
      expect(response.errored).toBeInstanceOf(Error);
      expect((response.errored).message).toBe('failure');
    });
});
