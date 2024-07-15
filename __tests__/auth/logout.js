const request = require('supertest');
require('../../db-connection').IgnoreDatabaseConnection();
const {app} = require('../../index'); 

describe('Logout Tests', () => {
    it('should fail for unauthenticated user', async () => {
        const response = await request(app).patch('/auth/sign_out').send();
        expect(response.status).toBeGreaterThan(399);
    });

});
