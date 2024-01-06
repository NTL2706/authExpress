import Caver from 'caver-js';

import { CONTACT_ABI, ENV } from 'configs/constants';

const caver = new Caver('https://public-node-api.klaytnapi.com/v1/cypress');

let account;
let contract = new caver.klay.Contract(CONTACT_ABI, ENV.klaytnContractAdress);

const walletCreate = async () => {
  try {
    const account = await caver.wallet.keyring.generate();

    const publicKey = account.address;

    const privateKey = account._key._privateKey;

    const wallet = {
      publicKey: publicKey,
      privateKey: privateKey
    };

    return wallet;
  } catch (error) {
    return { error };
  }
};

const getBalance = async privateKey => {
  try {
    let balance;

    if (account === undefined) {
      account = await accountAdd(privateKey);
    }

    await contract.methods
      .balanceOf(account.address)
      .call()
      .then(result => {
        balance = { balance: caver.utils.fromPeb(result, 'KLAY') };
      })
      .catch(error => {
        console.log(error);
        balance = { error: error };
      });

    return balance;
  } catch (error) {
    return { error };
  }
};

const transfer = async (privateKey, recipient, amount) => {
  try {
    let result;

    if (account === undefined) {
      account = await accountAdd(privateKey);
    }

    const callObj = contract.methods.transfer(recipient, caver.utils.toPeb(amount, 'KLAY'));

    const option = {
      from: account.address
    };

    const gas = await estimateGas(callObj, option);
    if (gas == 'failed') {
      result = { error: 'There is not enough klay balance in wallet.' };
    } else {
      await contract.methods
        .transfer(recipient, caver.utils.toPeb(amount, 'KLAY'))
        .send({ from: account.address, gas: gas })
        .then(data => {
          result = { result: data };
        })
        .catch(error => {
          console.log(error);
          result = { error: error };
        });
    }

    return result;
  } catch (error) {
    return { error };
  }
};

const estimateGas = async (callObj, option) => {
  try {
    let gas;

    await callObj
      .estimateGas(option)
      .then(function (gasAmount) {
        gas = gasAmount;
      })
      .catch(function (error) {
        console.log(error);
        gas = 'failed';
      });

    return gas;
  } catch (error) {
    return { error };
  }
};

const accountAdd = async privateKey => {
  try {
    const result = await caver.klay.accounts.wallet.add(privateKey);
    return result;
  } catch (error) {
    return { error };
  }
};

export default { walletCreate, transfer, getBalance };
