const request = require('supertest');
const {app} = require('../../index'); 



describe('Login Test', () => {
    it('Login shoud fail for invalid email format', async () => {
        const response = await request(app).patch('/auth/sign_in').send({ email: 'email', password: 'some_password' });
        expect(response.status).toBeGreaterThan(399);
    });

    it('Login shoud fail for missing password', async () => {
        const response = await request(app).patch('/auth/sign_in').send({ email: 'valid@email.com' });
        expect(response.status).toBeGreaterThan(399);
    });


    it('Login shoud fail for incorrect password', async () => {
        const bcrypt = require('bcryptjs');
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
        const response = await request(app).patch('/auth/sign_in').send({ email: 'valid@email.com', password: 'wrong_password' });
        expect(response.status).toBeGreaterThan(399);
        jest.spyOn(bcrypt, 'compare').mockRestore();
    });

    it('should log in successfully', async () => {
        const {Users} = require('../../models/Users');
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
    
        jest.spyOn(Users, 'findOne').mockResolvedValueOnce({ result: { _id: 'user_id', password: 'hashed_password', verified: true } });
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
        jest.spyOn(Users, 'findOneAndUpdate').mockResolvedValueOnce({ result: { is_in: true } });
        jest.spyOn(jwt, 'sign').mockReturnValue('mocked_token');
    
        const response = await request(app).patch('/auth/sign_in').send({ email: 'email@example.com', password: 'password' });
        expect(response.status).toBeLessThan(300); 
        jest.spyOn(Users, 'findOne').mockRestore();
        jest.spyOn(bcrypt, 'compare').mockRestore();
        jest.spyOn(Users, 'findOneAndUpdate').mockRestore();
        jest.spyOn(jwt, 'sign').mockRestore();
    });
  
});
