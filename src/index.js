// importando as dependencias

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path');
const qrcode = require('qrcode');
require('dotenv').config();

// documentação

// credentials
const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS
const secret = process.env.SECRET

// PORTA
const port = 3000

// iniciando o express
const app = express()

// configurando o JSON para as respostas
app.use(express.json())
app.use(cors())
// Models
const User = require('../models/User')

// Endpoints da API
// Configurar o diretório público para arquivos estáticos
app.use(express.static(path.join(__dirname, 'screenRegister')));

// Public route
app.get('/' , (req, res) => {
  res.sendFile(path.join(__dirname, 'screenRegister', 'registrationsScreen.html'));

})

function checkToken(req, res, next) {
  const headerToken = req.headers['authorization']
  const token = headerToken && headerToken.split(" ")[1]

  if(!token) {
    return res.status(400).json({
      msg: 'acesso negado'
    })
  }

  try{
    jwt.verify(token, secret)

    next()

  } catch(error) {
    return res.status(401).json({
      msg: "Token inválido"
    })
  }
}

// Register User
app.post('/v1/register/user', async(req, res) => {
  const {name, email, password, confirmpassword} = req.body

  // validations
  if(!name) {
    return res.status(422).json({msg: "O nome é obrigatório"})
  }
  if(!email) {
    return res.status(422).json({msg: "O email é obrigatório"})
  }
  if(!password) {
    return res.status(422).json({msg: "A senha é obrigatório"})
  }
  if(!confirmpassword) {
    return res.status(422).json({msg: "A confirmação de senha é obrigatório"})
  }

  if(password !== confirmpassword) {
    return res.status(422).json({msg: "As senhas não conferem!"})
  }

  // verificação para saber se o usuario ja existe
  const existUser = await User.findOne({ email: req.body.email })

  if(existUser) {
    return res.status(422).json({msg: "Por favor, utilizar outro e-mail!"})
  }

  // create password
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  // create user

  const user = new User({
    name,
    email,
    password: passwordHash
  })

  try {
    await user.save()
    res.status(201).json({msg: "Usuario criado com sucesso!"})

  } catch(error) {
    res.status(500).json({msg: error})
  }
})

// auth use
app.post('/v1/login/user', async (req, res) => {
  const { email, password } = req.body;

  // Validações
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória" });
  }

  // Verificar se o usuário existe
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: 'Usuário não encontrado' });
  }

  // Verificar se as senhas conferem
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: 'Senha inválida!' });
  }

  try {
    const token = jwt.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password
    }, secret);

    res.status(200).json({ msg: "Usuário autenticado com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// Criando o QRCode
app.get('/v1/qrcode/*', checkToken, (req, res) => {
  const url = req.params[0];

  if (!url) {
    res.status(400).send('URL ausente');
    return;
  }

  qrcode.toDataURL(url, (err, qrCode) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao gerar o QR code');
    } else {
      res.send(`${qrCode}`);
    }
  });
});

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger-output.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// disponibilizando uma porta para a api

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@auth-api-qrcode.k1vbhf1.mongodb.net/?retryWrites=true&w=majority`).then(() => {
  app.listen(port, () => {
    console.log("Servidor Online!")
  })
}).catch((error) => {
    return console.log("ocorreu um erro", error)
})