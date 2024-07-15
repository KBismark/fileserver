const request = require('supertest');
require('../../db-connection').IgnoreDatabaseConnection();
const {app} = require('../../index'); 


describe('Sign up Test', () => {
    it('Sign up shoud fail for invalid email format', async () => {
        const email = 'email'
        const password = 'password'

        const response = await request(app).post('/auth/sign_up').send({ email: email, password: password });
        expect(response.status).toBeGreaterThan(399); 
    });

    it('Sign up should fail for incorrect password format', async () => {
        const email = 'email@example.com'
        const password = 'pass'

        const response = await request(app).post('/auth/sign_up').send({ email: email, password: password });
        expect(response.status).toBeGreaterThan(399); 
    });

    it('should sign up successfully', async () => {
        const {Users} = require('../../models/Users');
        const utils = require('../../utils/index')
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
        const email = 'email@example.com'
        const password = 'password'
        
        jest.spyOn(global, 'setTimeout').mockImplementation((cb, timeout)=>{
            cb()
        })
        jest.spyOn(utils, 'sendMail').mockImplementation((options, cb)=>{
            cb(null, {})
        })
        jest.spyOn(Users, 'findById').mockResolvedValueOnce(null);
        jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed_password');
        jest.spyOn(Users, 'insertMany').mockResolvedValueOnce([ { _id: email, is_in: false } ]);
        jest.spyOn(jwt, 'sign').mockReturnValue('mocked_token');
    
        const response = await request(app).post('/auth/sign_up').send({ email: email, password: password });
        expect(response.status).toBeLessThan(300); 
        
        jest.spyOn(Users, 'findById').mockReset();
        jest.spyOn(bcrypt, 'hash').mockReset();
        jest.spyOn(Users, 'insertMany').mockReset();
        jest.spyOn(jwt, 'sign').mockReset();
        jest.spyOn(global, 'setTimeout').mockReset()
        jest.spyOn(utils, 'sendMail').mockReset()
    });
  
});


