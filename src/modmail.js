var Discord = require("discord.js");
var fileSystem = require("fs");

var tickets = require("../tickets.json");

var client = new Discord.Client({
    partials: [Discord.Partials.Channel],
    intents: [Discord.GatewayIntentBits.DirectMessages]
});

var status = () => {
    client.user.setPresence({
        activities: [{
            name:"your DMs",
            type: 2
        }]
    });
};

var formatter = a => {
    var b = a.split("\n");
    a = "";
    for(var i in b)
        a += "> " + b[i] + (i == b.length-1 ? "" : "\n");
    return a;
};

var structures = {
    ticket: a => {
        return {
            id: a,
            thread: []
        };
    },
    thread: (a, b, c, d, e, f, g) => {
        return {
            id: a,
            parent: b,
            sender: c,
            anon: d,
            text: e,
            link: f ? f : null,
            display: [null, null, null],
            replies: g ? [] : null
        };
    }
};

client.on("interactionCreate", async a => {
    if (!a.customId.indexOf("smm_reply_")) {
        var b = new Discord.TextInputBuilder()
            .setCustomId("smm_replytext_" + a.customId.split("smm_reply_")[1])
            .setStyle(2)
            .setLabel(a.guildLocale == "ru" ? "Текст ответа:" : "Reply message:"),
            c = new Discord.TextInputBuilder()
            .setCustomId("smm_replyanon_" + a.customId.split("smm_reply_")[1])
            .setStyle(1)
            .setLabel(a.guildLocale == "ru"
                ? "Не отображать кто ответил?:"
                : "Do not display who have responded?:"
            )
            .setPlaceholder(a.guildLocale == "ru" ? "да/нет" : "yes/no"),
            /*select = new Discord.SelectMenuBuilder()
            .setCustomId("testselect")
            .setPlaceholder("a")
            .addOptions({label:"1",value:"1"}),*/
            d = new Discord.ActionRowBuilder().addComponents(b),
            e = new Discord.ActionRowBuilder().addComponents(c),
            f = new Discord.ModalBuilder()
            .setCustomId("smm_replymodal_" + a.customId.split("smm_reply_")[1])
            .setTitle(a.guildLocale == "ru" ? "Ответить" : "Reply")
            .addComponents([d, e]);
        a.showModal(f);
    } else if (!a.customId.indexOf("smm_replymodal_")) {
        var b = parseInt(a.customId.split("smm_replymodal_")[1].split("_")[0])
            c = parseInt(a.customId.split("smm_replymodal_")[1].split("_")[1]),
            d,
            e,
            f = [],
            g = "",
            h;
        
        d = tickets[b].thread.length;
        tickets[b].thread[d] = structures.thread(
            d,
            b,
            a.user.id,
            a.components[1].components[0].value=="yes"||
            a.components[1].components[0].value=="y"||
            a.components[1].components[0].value=="da"||
            a.components[1].components[0].value=="да"||
            a.components[1].components[0].value=="ja"||
            a.components[1].components[0].value=="si"||
            a.components[1].components[0].value=="oui"||
            a.components[1].components[0].value=="sim"||
            a.components[1].components[0].value=="evet"||
            a.components[1].components[0].value=="tak"||
            a.components[1].components[0].value=="ya"||
            a.components[1].components[0].value=="oo"||
            a.components[1].components[0].value=="1",
            a.components[0].components[0].value
        );
        
        try {
            e = await client.users.fetch(tickets[b].thread[c].sender);
            e = await e.createDM();
            e = await e.messages.fetch(tickets[b].thread[c].link);
            if (e) {
                e = await e.reply((tickets[b].thread[d].anon
                    ? a.guildLocale=="ru"
                        ? "Анонимный ответ"
                        : "Anonymous response"
                    : a.guildLocale=="ru"
                        ? "Ответ от <@" + tickets[b].thread[d].sender + ">"
                        : "Response from <@" + tickets[b].thread[d].sender + ">"
                ) + "\n" + formatter(tickets[b].thread[d].text) + "\n" + (a.guildLocale=="ru"
                    ? "Ответьте на это сообщение чтобы отправить ответ"
                    : "Reply to this message to send reply."
                ));
                tickets[b].thread[d].display[0] = e.id;
                tickets[b].thread[c].replies[tickets[b].thread[c].replies.length] = d;
                for (var i in tickets[b].thread[c].replies) {
                    h = false;
                    for (var j in f)
                        if (f[j] == tickets[b].thread[tickets[b].thread[c].replies[i]].sender) {
                            h = true;
                            break;
                        }
                    if (!h)
                        f[f.length] = tickets[b].thread[tickets[b].thread[c].replies[i]].sender;
                }
                for (var i in f)
                    g += "<@"+f[i]+">" + (i==f.length-1 ? "" : ", ");
                a.message.edit((a.guildLocale=="ru"
                    ? "Сообщение от"
                    : "Message from"
                ) + " <@"+tickets[b].thread[c].sender + ">\n" + formatter(tickets[b].thread[c].text)
                + "\n" + (a.guildLocale=="ru"
                    ? "Кто ответил: "
                    : "Who have responded: "
                ) + g);
                a.reply({
                    content: a.guildLocale == "ru"
                        ? "Ваш ответ переслан успешно."
                        : "Your reply was delivered successfully.",
                    ephemeral: true
                });
            }
        } catch(a) {

        }
        
        fileSystem.writeFile("tickets.json", JSON.stringify(tickets), () => {

        });
    }
});

client.on("messageCreate", async a => {
	if (!a.author.bot) {
        var b, c, d, e, f, g;
        
        try {
            e = await client.guilds.cache.get("720299122489294889").members.fetch(a.author.id);
            f = await client.guilds.cache.get("236928901522259968").members.fetch(a.author.id);
            if (e)
                e = await client.guilds.cache.get("720299122489294889").channels.fetch("887389764137943070");
            if (f)
                f = await client.guilds.cache.get("236928901522259968").channels.fetch("887389364492042310");
        } catch(a) {

        }
        
        if (e || f) {
            if (a.reference) {
                try {
                    g = await client.users.fetch(a.author.id);
                    g = await g.createDM();
                    g = await g.messages.fetch(a.reference.messageId);
                } catch(a) {

                }
                for (var i = tickets.length-1; i > -1; i--) {
                    for (var j = tickets[i].thread.length-1; j > -1; j--)
                        if (g.author.bot
                         && tickets[i].thread[j].link == g.reference.messageId
                         || g.author.id == a.author.id
                         && tickets[i].thread[j].link == a.reference.messageId
                        ) {
                            b = i;
                            c = j;
                            d = tickets[i].thread.length;
                            tickets[i].thread[d] = structures.thread(
                                d,
                                i,
                                a.author.id,
                                false,
                                a.content,
                                a.id,
                                true
                            );
                            break;
                        }
                    if (b && c && d)
                        break;
                }
                try {
                    if (e) {
                        e = await e.messages.fetch(tickets[b].thread[c].display[1]);
                        e = await e.reply({
                            content: "Message from <@" + tickets[b].thread[d].sender +
                                ">\n" + formatter(tickets[b].thread[d].text),
                            components: [new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder()
                                    .setCustomId("smm_reply_" + b + "_" + d)
                                    .setStyle(2)
                                    .setLabel("Reply")
                                )
                            ]
                        });
                    }
                    if (f) {
                        f = await f.messages.fetch(tickets[b].thread[c].display[2]);
                        f = await f.reply({
                            content: "Сообщение от <@" + tickets[b].thread[d].sender +
                                ">\n" + formatter(tickets[b].thread[d].text),
                            components: [new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder()
                                    .setCustomId("smm_reply_"+b+"_"+d)
                                    .setStyle(2)
                                    .setLabel("Ответить")
                                )
                            ]
                        });
                    }
                } catch(a) {

                }
            } else {
                b = tickets.length;
                tickets[b] = structures.ticket(b);
                d = tickets[b].thread.length;
                tickets[b].thread[d] = structures.thread(
                    d,
                    b,
                    a.author.id,
                    false,
                    a.content,
                    a.id,
                    true
                );
                try {
                    if (e)
                        e = await e.send({
                            content: "Message from <@" + tickets[b].thread[d].sender +
                                ">\n" + formatter(tickets[b].thread[d].text),
                            components: [new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder()
                                    .setCustomId("smm_reply_" + b + "_" + d)
                                    .setStyle(2)
                                    .setLabel("Reply")
                                )
                            ]
                        });
                    if (f)
                        f = await f.send({
                            content: "Сообщение от <@" + tickets[b].thread[d].sender +
                                ">\n" + formatter(tickets[b].thread[d].text),
                            components: [new Discord.ActionRowBuilder()
                                .addComponents(new Discord.ButtonBuilder()
                                    .setCustomId("smm_reply_" + b + "_" + d)
                                    .setStyle(2)
                                    .setLabel("Ответить")
                                )
                            ]
                        });
                } catch(a) {

                }
            }
            
            if (e)
                tickets[b].thread[d].display[1] = e.id;
            if (f)
                tickets[b].thread[d].display[2] = f.id;
            a.reply(e && f
                ? ":flag_us: Your message was delivered successfully.\n:flag_ru: Ваше сообщение переслано успешно."
                : f
                    ? "Ваше сообщение переслано успешно."
                    : "Your message was delivered successfully."
            );
            
            fileSystem.writeFile("tickets.json", JSON.stringify(tickets), () => {

            });
        }
	}
});

client.on("ready", status);

client.login("");

module.exports = {Discord, tickets, client, status};
