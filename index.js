const express = require('express');
const contract = require('./src/contract');
const app = express();
const cors = require('cors'); //추가해주어야 외부 호출 가능
const session = require('express-session')
const bodyParser = require('body-parser');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

const rootRouter = require('./src/routes');
require('./src/passport');

app.set('port', process.env.PORT || 3000);
app.use(cors());
app.use(bodyParser.json());

rootRouter(app);

app.get('/wrootRouterallet/create', async (req, res) => {
  let result = await contract.walletCreate();
  res.send(result);
});

app.post('/balance', async (req, res) => {
  let { privateKey } = req.body;

  let result = await contract.getBalance(privateKey);
  res.send(result);
});

app.post('/transfer', async (req, res) => {
  let { privateKey, recipient, amount } = req.body;

  let result = await contract.transfer(privateKey, recipient, amount);
  res.send(result);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});
