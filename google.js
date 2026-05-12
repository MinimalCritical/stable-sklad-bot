const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./credentials.json");

const doc = new GoogleSpreadsheet("1BgNe1fISyOdQtD_EjpBquokiU2nzQc7BhAg0tqkCoMM");

async function addLog(user, action, item, amount) {
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  await sheet.addRow({
  "Дата": new Date().toLocaleString(),
  "Пользователь": user,
  "Действие": action,
  "Товар": item,
  "Количество": amount,
  });

  console.log("Лог добавлен");
}

module.exports = { addLog };