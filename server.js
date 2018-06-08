const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');
var sleep = require('sleep');

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

setInterval(()=>autoUptime(), botconfig.second*1000);

client.on('ready', () => {
  console.log(`Login as ${client.user.tag}!`);
});

function autoUptime(){

  if(botconfig.server == 'public'){
    var guildList = client.guilds.array();
    //console.log(guildList);
    guildList.forEach(guild => {
      if(guild.channels.find("name",botconfig.channelName)){
        guild.channels.find("name",botconfig.channelName).send("uptime");
      }
    });
  }else{
    channel = client.channels.get(botconfig.textChannel);
    //console.log(channel);
    if(channel){
     channel.send("uptime");
    }
  }
}


var i = 0;
client.on('message', message => {

  //channel = client.channels.get(botconfig.textChannel);
  channel = client.channels.find("name",botconfig.channelName);
  var guildList = client.guilds.array();

  //console.log(message.channel.messages.last(2)[0].content);
  
  //if(message.channel.messages.last(2)[0].content=='uptime'){
  if(message.content=='uptime'){
    
    async function clear() {
      message.delete();
      const fetched = await message.channel.fetchMessages({limit: 99});
      message.channel.bulkDelete(fetched);
    }
    clear();
    //console.log('count: ' + count);

    i++;

    // console.log("==================");
    // console.log(message.guild.name + ' : ' + i);
    // console.log("Clear Message Complated!");
    // console.log("-----------------");

  }

  console.log("==================");
  console.log(i + ' : ' + countGuildsHaveChannel(guildList));
  console.log("-----------------");
  if(i==countGuildsHaveChannel(guildList)){
    sendMessageDiscord();
    i=0;
  }

  if(botconfig.server != "public" && i!=0){
    sendMessageDiscord();
    i=0;
  }

})

function countGuildsHaveChannel(guildList){

  var count=0;

  guildList.forEach(guild => {
    channel = guild.channels.find("name",botconfig.channelName);
    //console.log(message.channel.permissionsFor(message.member).serialize());
    if(channel){
      //message.guild.channels.find("name",botconfig.channelName).messages.last(2)[0].delete;
      count++;
    }
    //i++;
  });

  return count-1;

}

function sendMessageDiscord(gchannel){
  api = 'https://world-boss-timer-bdoth.firebaseio.com/world_boss.json';

  console.log("-> Update timing...")

  request({url: api, json: true}, function(error, response, data){
      if(!error){
        findBossNextSpawn(data);      
        sendBossTimer(listBoss);

      }else{
        console.log(error);
      }
  })

};

function sendBossTimer(listBoss){

  var text;
  for(var i=0;i<listBoss.length;i++){
    //console.log(listBoss[i].name);
    if(i==0){
      text = '<'+listBoss[i].name+'>    ' + bossTimer(listBoss[i].time,listBoss[i].day) + '  ใกล้จะเกิดแล้ว\n'; 
    }else{
      text += '<'+listBoss[i].name+'>    ' + bossTimer(listBoss[i].time,listBoss[i].day) + '  รอเกิดต่อไป\n';       
    }
  }

  if(botconfig.server == 'public'){
    var guildList = client.guilds.array();
    guildList.forEach(guild => {
      if(guild.channels.find("name",botconfig.channelName)){
        guild.channels.find("name",botconfig.channelName).send('```md\n'+ text +'```');
      }
    });
  }else{
    channel = client.channels.get(botconfig.textChannel);
    if(channel){
      channel.send('```md\n'+ text +'```');
    }
  }

}

function bossTimer(bosstime,bossday){

  //for boss
  curr_day=new Date().getDay();
  boss_time = bosstime*60*60;

  // midnight time 0:00
  if(bossday==0){
    bossday=7;
  }

  if(bossday > curr_day){
    boss_time += (bossday-curr_day)*24*60*60;
  }

  //curent
  hour=new Date().getHours();
  min= new Date().getMinutes();
  sec= new Date().getSeconds();

  current_time = (hour*60*60) + (min*60) + sec;

  return countdown(boss_time-current_time);
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

      (d) && tmp.push(d + 'd');

      (d || h) && tmp.push(h + 'h');

      (d || h || m) && tmp.push(m + 'm');

      //tmp.push(s + 's');

      return tmp.join('');
  }
}());

function conditionDay(day){
  if(day==7){
    return 0;
  }
  return day;
}


function findBossNextSpawn(data){
  curr_day=new Date().getDay();
  hour=new Date().getHours();

  for(var i=0;i<5;i++){
    for (var key in data) {
      if(data[key].day==conditionDay(curr_day+i)){
        //console.log(i + ": " + data[key].name + ' |DAY: ' + data[key].day+ ' |TIME: ' + data[key].time);
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

      if(listBoss.length == 5){
        break;
      }
    }
  }

};


client.login(botconfig.token);
