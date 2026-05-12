const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Events,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});


// =========================
// PRODUCTS
// =========================

const products = [
    "Кукуруза",
    "Спирт",
    "Тимьян",
    "Чеснок",
    "Говядина",
    "Томат",
    "Соль",
    "Вода",
    "Бурбон",
    "Хмель",
    "Пшеница",
    "Сахарный тростник",
    "Американский женшень",
    "Тысячелистник",
    "Аляскинский женшень",
    "Сено для коня",
    "Лекарство для питомца",
    "Обычный корм",
    "Средний корм",
    "Хороший корм",
    "Сахар",
    "Морфин",
    "Подковы",
    "Стейк с кровью",
    "Другое (Комментарий)"
];


// =========================
// FINANCE REASONS
// =========================

const financeReasons = [
    "Подковывание",
    "Продажа сено",
    "Продажа лекарство",
    "Продажа Хороший корм",
    "Продажа лошади",
    "Закупка сырья",
    "Зарплаты / Премий",
    "Обучение лошади",
    "Прочее"
];


// =========================
// DATABASE FILES
// =========================

const inventoryFile = "inventory.json";
const financeFile = "finance.json";


// =========================
// LOAD DATA
// =========================

function loadInventory() {

    if (!fs.existsSync(inventoryFile)) {
        fs.writeFileSync(inventoryFile, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(inventoryFile));
}


function saveInventory(data) {
    fs.writeFileSync(inventoryFile, JSON.stringify(data, null, 2));
}


function loadFinance() {

    if (!fs.existsSync(financeFile)) {
        fs.writeFileSync(financeFile, JSON.stringify({ balance: 0 }));
    }

    return JSON.parse(fs.readFileSync(financeFile));
}


function saveFinance(data) {
    fs.writeFileSync(financeFile, JSON.stringify(data, null, 2));
}


// =========================
// COMMANDS
// =========================

const skladCommand = new SlashCommandBuilder()
    .setName("sklad")
    .setDescription("Система склада")

    .addStringOption(option =>
        option
            .setName("action")
            .setDescription("Действие")
            .setRequired(true)
            .addChoices(
                { name: "Положил", value: "Положил" },
                { name: "Взял", value: "Взял" }
            )
    )

    .addStringOption(option =>
        option
            .setName("item")
            .setDescription("Продукция")
            .setRequired(true)
            .addChoices(
                ...products.map(product => ({
                    name: product,
                    value: product
                }))
            )
    )

    .addIntegerOption(option =>
        option
            .setName("amount")
            .setDescription("Количество")
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName("comment")
            .setDescription("Комментарий")
            .setRequired(false)
    );


const invCommand = new SlashCommandBuilder()
    .setName("inv")
    .setDescription("Количество на складе");


const financeCommand = new SlashCommandBuilder()
    .setName("finance")
    .setDescription("Финансовое система")

    .addStringOption(option =>
        option
            .setName("action")
            .setDescription("Действие")
            .setRequired(true)
            .addChoices(
                { name: "Положил", value: "Положил" },
                { name: "Взял", value: "Взял" }
            )
    )

    .addIntegerOption(option =>
        option
            .setName("amount")
            .setDescription("Количество")
            .setRequired(true)
    )

    .addStringOption(option =>
        option
            .setName("reason")
            .setDescription("Причина")
            .setRequired(true)
            .addChoices(
                ...financeReasons.map(reason => ({
                    name: reason,
                    value: reason
                }))
            )
    )

    .addStringOption(option =>
        option
            .setName("comment")
            .setDescription("Комментарий")
            .setRequired(false)
    );


// =========================
// READY
// =========================

client.once(Events.ClientReady, async () => {

    console.log(`Бот включился как ${client.user.tag}`);

    await client.application.commands.set([
        skladCommand,
        invCommand,
        financeCommand
    ]);

    console.log("все command работуют.");
});


// =========================
// INTERACTIONS
// =========================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isChatInputCommand()) return;


    // =========================
    // /sklad
    // =========================

    if (interaction.commandName === "sklad") {

        const action = interaction.options.getString("action");
        const item = interaction.options.getString("item");
        const amount = interaction.options.getInteger("amount");
             const comment =
            interaction.options.getString("comment") || ".";


        const inventory = loadInventory();

        if (!inventory[item]) {
            inventory[item] = 0;
        }


        if (action === "Положил") {
            inventory[item] += amount;
        }
        else {
            inventory[item] -= amount;

        }


        saveInventory(inventory);


        const embed = new EmbedBuilder()
            .setTitle("📦 Запись склада")
            .setDescription(
`👤 Пользователь: ${interaction.user}\n🔄 Действие: ${action}\n📋 Продукт: ${item}\n🔢 Количество: ${amount}\n📦 Оставшееся количество: ${inventory[item]}\n📝 Комментарий: ${comment}`
            )
            .setColor(action === "положил" ? "Green" : "Red")
            .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });
    }


    // =========================
    // /inv
    // =========================

    if (interaction.commandName === "inv") {

        const inventory = loadInventory();

        let text = "";

        for (const item in inventory) {
            text += `📦 ${item}: ${inventory[item]}\n`;
        }

        if (text === "") {
            text = "Запасов нет.";
        }


        const embed = new EmbedBuilder()
            .setTitle("📦 Количество на складе")
            .setDescription(text)
            .setColor("Blue")
            .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });
    }


    // =========================
    // /finance
    // =========================

    if (interaction.commandName === "finance") {

        const action = interaction.options.getString("action");
        const amount = interaction.options.getInteger("amount");
        const reason = interaction.options.getString("reason");
        const comment =
            interaction.options.getString("comment") || "Количество";



        const finance = loadFinance();


        if (action === "Положил") {
            finance.balance += amount;
        }
        else {
            finance.balance -= amount;

        }


        saveFinance(finance);


        const embed = new EmbedBuilder()
            .setTitle("💰 Финансовый отчёт")
            .setDescription(
`👤 Пользователь: ${interaction.user}\n🔄 Действие: ${action}\n💵 Количество: ${amount}$\n📋 Причина: ${reason}\n💰 оставшееся количество $ в книге: ${finance.balance}$\n📝 Комментарий: ${comment}`
            )
            .setColor(action === "Положил" ? "Green" : "Gold")
            .setTimestamp();


        await interaction.reply({
            embeds: [embed]
        });
    }

});


// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN);