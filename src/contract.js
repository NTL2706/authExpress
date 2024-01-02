const env = require("./env");
const ContractAbi = require("./klaytnAbi");
const Caver = require('caver-js')
const caver = new Caver('https://public-node-api.klaytnapi.com/v1/cypress');
let account;

let contract = new caver
    .klay
    .Contract(ContractAbi, env.klaytnContractAdress);

const walletCreate = async () => {

    const account = await caver
        .wallet
        .keyring
        .generate();

    const publicKey = account.address;

    const privateKey = account._key._privateKey;

    const wallet = {
        "publicKey": publicKey,
        "privateKey": privateKey
    };

    //console.log(publicKey, "private", privateKey);

    return wallet;
};

const getBalance = async (privateKey) => {
    let balance;

    if (account === undefined) {
        account = await accountAdd(privateKey);
    }

    await contract
        .methods
        .balanceOf(account.address)
        .call()
        .then(result => {
            balance = { "balance": caver.utils.fromPeb(result, 'KLAY') };
        })
        .catch(error => {
            console.log(error);
            balance = { "error": error };
        });

    return balance;
};

const transfer = async (privateKey, recipient, amount) => {
    let result;

    if (account === undefined) {
        account = await accountAdd(privateKey);
    }

    const callObj = contract
        .methods
        .transfer(recipient, caver.utils.toPeb(amount, 'KLAY'));

    const option = {
        from: account.address
    };

    //console.log("klaytn balance", await web3.eth.getBalance(account.address));

    const gas = await estimateGas(callObj, option);
    if (gas == "failed") {
        result = { "error": "There is not enough klay balance in wallet." }
    } else {
        await contract
            .methods
            .transfer(recipient, caver.utils.toPeb(amount, 'KLAY'))
            .send({ from: account.address, gas: gas })
            .then((data) => {
                result = { "result": data };
            })
            .catch(error => {
                console.log(error);
                result = { "error": error };
            });
    }

    return result;

};

async function estimateGas(callObj, option) {

    let gas;

    await callObj
        .estimateGas(option)
        .then(function (gasAmount) {
            gas = gasAmount;
        })
        .catch(function (error) {
            console.log(error);
            gas = "failed";
        })

    return gas;
}

async function accountAdd(privateKey) {
    return await caver.klay.accounts.wallet.add(privateKey);
}


exports.walletCreate = walletCreate;
exports.transfer = transfer;
exports.getBalance = getBalance;
