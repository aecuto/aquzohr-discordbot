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

  channel = client.channels.find("name",botconfig.channelName);

  if(message.content=='uptime'){
    
    async function clear() {
      message.delete();
      const fetched = await message.channel.fetchMessages({limit: 99});
      message.channel.bulkDelete(fetched);
    }
    clear();

    i++;

  }

  if(i==countGuildsHaveChannel()){
    sendMessageDiscord();
    i=0;
  }

  if(botconfig.server != "public" && i!=0){
    sendMessageDiscord();
    i=0;
  }

})

function countGuildsHaveChannel(){

  var guildList = client.guilds.array();

  var count=0;

  guildList.forEach(guild => {
    channel = guild.channels.find("name",botconfig.channelName);
    if(channel){
      count++;
    }
  });

  return count-1;

}

function sendMessageDiscord(){
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

  var text = '';
  for(var i=0;i<listBoss.length;i++){
    //console.log(listBoss[i].name);
    if(i==0){
      text = '<'+listBoss[i].name+'>    ' + bossTimer(listBoss[i].time,listBoss[i].day) + '  ตัวที่จะเกิดถัดไป\n'; 
    }else{
      text += '<'+listBoss[i].name+'>    ' + bossTimer(listBoss[i].time,listBoss[i].day) + '  รอเกิดต่อไป\n';       
    }
  }
  var url_link="https://www.th.playblackdesert.com/News/Notice/Detail?boardNo=947&boardType=2";
  if(botconfig.server == 'public'){
    var guildList = client.guilds.array();
    guildList.forEach(guild => {
      if(guild.channels.find("name",botconfig.channelName)){
        guild.channels.find("name",botconfig.channelName).send({embed: {
          color: 0xFF8F18,
          title: ":timer: Updated World Boss Timer",
          url: url_link,
          description: "```md\n"+ text + "```",
          fields: [
            {
              name: "Update",
              value: "สามารถดูการอัพเดท ได้ที่ [Click](https://github.com/Aquzohr/aquzohrDiscordbot/blob/master/README.md)"
            },
            {
              name: "Online Timer",
              value: "สามารถดูผ่านเว็บได้ด้วยนะ [Click](https://world-boss-timer-bdoth.firebaseapp.com/)"
            }
          ],
          footer: {
            text: "Bot Online: " + countGuildsHaveChannel() + '/' + guildList.length
          }
          }
        });
      }
    });
  }else{
    channel = client.channels.get(botconfig.textChannel);
    if(channel){
      channel.send({embed: {
        color: 0xFF8F18,
        title: ":timer: Updated World Boss Timer",
        url: url_link,
        description: "```md\n"+ text + "```",
        }
      });
    }
  }

}

function bossTimer(bosstime,bossday){

  //for boss
  curr_day=new Date().getDay();
  boss_time = bosstime*60*60;

  // midnight time 0:00
  if(bossday==0 && curr_day != 0){
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

  if(boss_time>current_time){
    return countdown(boss_time-current_time);
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

  var i=0;
  do{
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
    i++;
  }while(listBoss.length < 5);

};


//client.login("");
client.login(process.env.bot_token);

