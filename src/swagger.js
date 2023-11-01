const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de criação de QRCode',
    description: 'API de geração de qrcode, usa a autenticação de token para seu acesso'
  },
  host: 'localhost:3000',
  schemas: ['http'],
};

const outputFile = './swagger-output.json';
const routes = ['./index.js'];

swaggerAutogen(outputFile, routes, doc).then(() => {
  require('./index.js'); 
});