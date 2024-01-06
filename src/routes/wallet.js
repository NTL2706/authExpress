import express from 'express';

import klaytn from 'services/klaytn';

const router = express.Router();

router.get('/create', async (req, res) => {
  let result = await klaytn.walletCreate();
  res.send(result);
});

router.post('/balance', async (req, res) => {
  let { privateKey } = req.body;

  let result = await klaytn.getBalance(privateKey);
  res.send(result);
});

router.post('/transfer', async (req, res) => {
  let { privateKey, recipient, amount } = req.body;

  let result = await klaytn.transfer(privateKey, recipient, amount);
  res.send(result);
});

export default router;
