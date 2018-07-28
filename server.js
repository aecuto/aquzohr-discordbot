const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');

const botconfig = require('./botconfig.json');

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000


express()
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
}
)
.listen(PORT, () => console.log(`Listening on ${ PORT }`));

var listBoss = [];

setInterval(()=>sendMessageDiscord(), botconfig.second*1000);
setInterval(()=>sendNotification(), 1000);

client.on('ready', () => {
  console.log(`Login as ${client.user.tag}!`);

  var guildList = client.guilds.array();

  console.log(gettime() + ` -> clear message!`);
  guildList.forEach(guild => {
    channel = guild.channels.find("name",botconfig.channelName);
    if(channel){
      //console.log(channel.guild.name);
       channel.send('clear message!').catch(console.error);
    }
  });

});

client.on('message', message => {

  channel = client.channels.find("name",botconfig.channelName);

  if(message.content=='clear message!'){
    message.channel.fetchMessages()
          .then(messages => {
            message.channel.bulkDelete(messages);
            messagesDeleted = messages.array().length; // number of messages deleted
            console.log('Deletion of messages successful. Total messages deleted: '+messagesDeleted)
          })
          .catch(err => {
            console.log('Error while doing Bulk Delete');
            console.log(err);
          });
  }
  
});

function sendNotification(){

  if(listBoss[0] === undefined)
    return

  var time_notification = botconfig.time_notification*60;

  if(bossTimer(listBoss[0].time,listBoss[0].day) == time_notification){
    var guildList = client.guilds.array();

    console.log(gettime() + `-> Send Notification!`);
    guildList.forEach(guild => {
      channel = guild.channels.find("name",botconfig.channelNotificationName);
      if(channel){
        //console.log(channel.guild.name);
        channel.send('@everyone ' + listBoss[0].name + ' จะเกิดในอีก 15 นาทีนี้!!').catch(console.error);
      }
    });

  }
}


function countGuildsHaveChannel(){

  var guildList = client.guilds.array();

  var count=0;

  guildList.forEach(guild => {
    channel = guild.channels.find("name",botconfig.channelName);
    if(channel){
      //console.log(channel.guild.name);
      count++;
    }
  });

  return count;

}

function gettime(){
  time=new Date().getTime();
  var datetime = new Date(time);
  return datetime;
}

function sendMessageDiscord(){
  api = 'https://world-boss-timer-bdoth.firebaseio.com/world_boss.json';


  console.log(gettime() + " -> Update timing...")

  request({url: api, json: true}, function(error, response, data){
      if(!error){
        listBoss = [];
        findBossNextSpawn(data);      
        sendBossTimer(listBoss);

      }else{
        console.log(error);
      }
  })

};

function sendBossTimer(listBoss){

  var text = '';
  for(var i=0;i<listBoss.length;i++){
    //console.log(listBoss[i].name);
    if(i==0){
      text = '* <'+listBoss[i].name+'>\n [' + countdown(bossTimer(listBoss[i].time,listBoss[i].day)) + '](กำลังจะเกิด)\n ------ \n'; 
    }else{
      text += '* <'+listBoss[i].name+'>\n [' + countdown(bossTimer(listBoss[i].time,listBoss[i].day)) + '](รอเกิดอยู่)\n ------ \n';       
    }
  }

  if(botconfig.server == 'public'){
    var guildList = client.guilds.array();
    guildList.forEach(guild => {
      if(guild.channels.find("name",botconfig.channelName)){
        guild.channels.find("name",botconfig.channelName).send({embed: {
          color: 0xFF8F18,
          title: ":calendar_spiral:️ World Boss Schedule",
          description: "```md\n"+ text + "```",
          fields: [
            {
              name: "World Boss Timer",
              value: "สามารถดูผ่านเว็บได้ด้วยนะ [https://world-boss-timer-bdoth.firebaseapp.com/](https://world-boss-timer-bdoth.firebaseapp.com/)"
            },
            {
              name: "๊Updated",
              value: "สร้างห้อง notification มันจะแจ้ง 15 นาทีก่อนบอสจะเกิด"
            }
          ],
          footer: {
            text: "Bot Online: " + countGuildsHaveChannel() + '/' + guildList.length
          }
          }
        }).then(m => m.delete((botconfig.second-1)*1000)).catch(console.error);
      }
    });
  }else{
    channel = client.channels.get(botconfig.textChannel);
    if(channel){
      channel.send({embed: {
        color: 0xFF8F18,
        title: ":calendar_spiral:️ World Boss Schedule",
        description: "```md\n"+ text + "```",
        }
      }).then(m => m.delete((botconfig.second-1)*1000));
    }
  }

}

function bossTimer(bosstime,bossday){

  //for boss
  curr_day=new Date().getDay();
  var boss_time = 0;

  if(boss_time == 0.15){
    boss_time = 15*60;
  }else{
    boss_time = bosstime*60*60;
  }

  // midnight time 0:00
  if(bossday==0 && curr_day != 0){
    bossday=7;
  }

  if(bossday > curr_day){
    boss_time += (bossday-curr_day)*24*60*60;
  }

  //fixed show time saturday to monday
  if(curr_day==6 && bossday==1){
    boss_time += 2*24*60*60;      
  }

  //curent
  hour=new Date().getHours();
  min= new Date().getMinutes();
  sec= new Date().getSeconds();

  current_time = (hour*60*60) + (min*60) + sec;

  if(boss_time>current_time){
    return boss_time-current_time;
  }

  return 0;
}

const countdown = (function () {
  const pad = t => {
      return (t + '').length < 2 ? pad('0' + t + '') : t ;
  }
  return s => {

      const d = Math.floor(s / (3600 * 24));

      s  -= d * 3600 * 24;

      const h   = Math.floor(s / 3600);

      s  -= h * 3600;

      const m = Math.floor(s / 60);

      s  -= m * 60;

      const tmp = [];

      (d) && tmp.push(d + 'วัน ');

      (d || h) && tmp.push(h + 'ชั่วโมง ');

      (d || h || m) && tmp.push(m + 'นาที');

      //tmp.push(s + 's');

      return tmp.join('');
  }
}());

function conditionDay(day){
  if(day>=7){
    return day-7;
  }
  return day;
}


function findBossNextSpawn(data){
  curr_day=new Date().getDay();
  hour=new Date().getHours();

  for(var i =0;i<5;i++){
    for (var key in data) {
      if(data[key].day==conditionDay(curr_day+i)){
        //console.log(i + ": " + data[key].name + ' |DAY: ' + data[key].day+ ' |TIME: ' + data[key].time);
        if(listBoss.length == 5){
          break;
        }

        if(i==0 && hour < data[key].time){
          listBoss.push({
            name: data[key].name,
            time: data[key].time,
            day: data[key].day
          });
        }
        
        if(i!=0){
          listBoss.push({
            name: data[key].name,
            time: data[key].time,
            day: data[key].day
          });
        }
      }
    }

  }

  // console.log(listBoss.length);
  // console.log(listBoss);

};

//client.login(process.env.bot_token);
client.login(botconfig.token);

