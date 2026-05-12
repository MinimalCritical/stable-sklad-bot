const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./credentials.json');

const SHEET_ID = '1BgNe1fISyOdQtD_EjpBquokiU2nzQc7BhAg0tqkCoMM';

async function addLog(user, action, item, amount) {

    const doc = new GoogleSpreadsheet(SHEET_ID);

    await doc.useServiceAccountAuth(creds);

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
        Дата: new Date().toLocaleString(),
        Пользователь: user,
        Действие: action,
        Товар: item,
        Количество: amount
    });
}

module.exports = { addLog };