// Core

const Discord = require("discord.js");
const client = new Discord.Client();

// Bot Settings
const token = "ODU4NDY0NDQ2OTA4OTg5NTAw.YNehUQ.iDx-9CcCF4rUOPFa2w-QGtFbms4";

const prefix = "-";

// Data

let global_data = {};
let server_data = {};


// Floats

let prompts = {};

// Functions

// Script
client.on("messageReactionAdd", (message, user) => {
    
    let paths = {

        Wipe: function() {

            const entry = server_data[message.message.channel.guild.id]

            if (!entry.HowVerify.deleted) {
                entry.HowVerify.delete()
            };

            if (!entry.Verify.deleted) {
                entry.Verify.delete()
            };

            if (!entry.Category.deleted) {
                entry.Category.delete()
            };

            message.message.channel.send("🖐 Os canais foram apagados do servidor. Para recriá-los digite `-iniciar`.")

            entry.HowVerify = undefined 
            entry.Verify = undefined 
            entry.Category = undefined

            message.remove()

            prompts[user.id] = undefined

        }

    }

    if (prompts[user.id] != undefined && paths[prompts[user.id].Fase]) {
        paths[prompts[user.id].Fase]()
        return;
    };

});

client.on("message", message => {

    const content = message.content;
    const author = message.author;
    const channel = message.channel;
    const member = message.member;

    var args = content.split(" ");

    var start = args[0].slice(0, 1);
    args[0] = args[0].slice(1);

    // Handle Prompts
    let paths = {

        SetVerifiedRole: function() {
            
            var role_list = message.mentions.roles;
            var role_self

            var index = 0;
            role_list.forEach(role => {
                index += 1
                if (index == 1) {
                        var msg = message.channel.send("👌 Certo, o cargo de verificação foi configurado para %s.".replace("%s", "<@&%s>".replace("%s", role.id))); 
                        role_self = role 
                };
            })

            var msg = message.channel.send("👍 Vou preparar os novos canais de verificação, não se preocupe com a configuração pois farei automaticamente.");

            server_data[message.guild.id] = {
                VerifiedRole: role_self.id,
                HowVerify: undefined,
                Verify: undefined,
                Category: undefined,
            }

            var entry = server_data[message.guild.id]
            const category = message.guild.channels.create("Verificação", {type: "category"})
            .then(category => {
                category.createOverwrite(message.guild.roles.cache.get(role_self.id), {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false,
                })
                entry.Category = category
                const how_verify = message.guild.channels.create("como se verificar", {type: "text", parent: message.guild.channels.resolve(entry.Category)})
                .then(channel => {
                    channel.send("**Como se verificar?**\n\nPara se verificar, basta digitar `-verificar`\n\n**Já sou verificado no Bot**\n\nBasta digitar `-verificar` para ativar seu cadastro neste servidor\n\n**Quero mudar meu cadastro!**\n\nDigite `-reverificar` para refazer seu cadastro")
                    entry.HowVerify = channel
                    channel.createOverwrite(message.guild.roles.everyone.id, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: false,
                    })
                })
                const verify = message.guild.channels.create("se verificar", {type: "text", parent: message.guild.channels.resolve(entry.Category)})
                .then(channel => {
                    entry.Verify = channel
                })
            });

            message.channel.send("🤙 Criei os novos canais de verificação.")

            prompts[author.id] = undefined

        },

    }

    if (prompts[author.id] != undefined && paths[prompts[author.id].Fase] != undefined) {
        paths[prompts[author.id].Fase]()
        return;
    }

    // Check if command
    if (start != prefix || author.bot) {
        return;
    } 

    // Handle Commands
    let commands = {
        ping: function() {
            message.reply("Pong!")
        },
        iniciar: function() {

            if (!member.permissions.has("MANAGE_ROLES")) {
                message.reply("você não tem permissão o suficiente para configurar o servidor. Você precisa da permissão de `Gerenciar Cargos`.");
                return;
            }

            if (server_data[message.guild.id] && server_data[message.guild.id].HowVery != undefined) {

                var msg = message.reply("este servidor já possui os canais de verificação, gostaria de faze-los novamente?")
                .then(msg => msg.react("✅"));

                prompts[author.id] = {
                    Fase: "Wipe",
                    Subfase: "",
                };

                return;

            }

            message.channel.send("📋 Por favor dê um ping no cargo que será dado as pessoas que se verificarem. \n\n`Exemplo: @Verificados`")

            prompts[author.id] = {
                Fase: "SetVerifiedRole",
                Subfase: "",
            };

            return;

        }
    }

    if (commands[args[0]]) {
        commands[args[0]]()
    } else {
        message.reply("Comando não encontrado.")
    };

});

// Initialize 
client.login(token);
client.once("ready", () => {
    console.log("ready");
});
