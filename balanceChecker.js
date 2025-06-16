// 📁 backend/balanceChecker.js
const StellarSdk = require("stellar-sdk");

module.exports = async function (passphrase) {
  if (passphrase !== process.env.PASSPHRASE_SECRET) {
    return "Invalid passphrase";
  }

  const server = new StellarSdk.Server("https://api.mainnet.minepi.com");

  try {
    const account = await server.loadAccount(process.env.SENDER_PUBLIC_KEY);
    let piBalance = "0";

    account.balances.forEach(balance => {
      if (balance.asset_type === "native") {
        piBalance = balance.balance;
      }
    });

    return piBalance;
  } catch (error) {
    return `⚠️ Error: ${error.message}`;
  }
};