// 📁 backend/piTransfer.js
const axios = require("axios");
const StellarSdk = require("stellar-sdk");

module.exports = async function (statusLog) {
  const unlockTime = new Date(process.env.UNLOCK_TIME).getTime();
  const retryInterval = 200;

  const checkBalanceAndTransfer = async () => {
    const now = Date.now();

    if (now >= unlockTime) {
      try {
        const balance = await getWalletBalance();
        statusLog.push({ time: new Date().toLocaleString(), msg: `💰 Balance: ${balance}` });

        if (parseFloat(balance) > 0) {
          const tx = await sendPi(balance);
          statusLog.push({ time: new Date().toLocaleString(), msg: "✅ Transfer successful!", tx });
          return;
        } else {
          statusLog.push({ time: new Date().toLocaleString(), msg: "🔁 Balance zero, retrying..." });
        }
      } catch (err) {
        statusLog.push({ time: new Date().toLocaleString(), msg: `⚠️ Transfer failed: ${err.message}` });
      }
    } else {
      statusLog.push({ time: new Date().toLocaleString(), msg: "⏳ Waiting for unlock time..." });
    }

    setTimeout(() => checkBalanceAndTransfer(), retryInterval);
  };

  checkBalanceAndTransfer();
};

async function getWalletBalance() {
  const server = new StellarSdk.Server("https://api.mainnet.minepi.com");
  const account = await server.loadAccount(process.env.SENDER_PUBLIC_KEY);
  let balance = "0";
  account.balances.forEach(b => {
    if (b.asset_type === "native") balance = b.balance;
  });
  return balance;
}

async function sendPi(amount) {
  const server = new StellarSdk.Server("https://api.mainnet.minepi.com");
  const sourceKey = process.env.SENDER_PRIVATE_KEY;
  const destination = process.env.DESTINATION_WALLET;
  const source = StellarSdk.Keypair.fromSecret(sourceKey);
  const sourcePublicKey = source.publicKey();
  const account = await server.loadAccount(sourcePublicKey);
  const fee = await server.fetchBaseFee();

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee,
    networkPassphrase: "Pi Mainnet"
  })
    .addOperation(StellarSdk.Operation.payment({
      destination: destination,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString()
    }))
    .setTimeout(30)
    .build();

  transaction.sign(source);
  const txResult = await server.submitTransaction(transaction);
  return txResult;
}

