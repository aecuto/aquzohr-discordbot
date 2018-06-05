const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');
var sleep = require('sleep');

const botconfig = require('./botconfig.json');

var listBoss = [];

client.on('ready', () => {
  console.log(`Login as ${client.user.tag}!`);
  autoUptime();
});

function autoUptime(){
  var guildList = client.guilds.array();
  guildList.forEach(guild => guild.channels.find("name","world-boss-timers").send("uptime"));
}

var i = 0;
client.on('message', message => {

  channel = client.channels.find("name","world-boss-timers");
  var guildList = client.guilds.array();
  
  if(message.content=='uptime'){

    console.log("================================");
    console.log("GET MESSAGE ::: uptime :::::::");
    console.log("================================");
    
    async function clear() {
      message.delete();
        const fetched = await message.channel.fetchMessages({limit: 99});
        message.channel.bulkDelete(fetched);
    }
    clear();

    i++;
  }

  if(i==guildList.length){
    sendMessageDiscord();
    i=0;
  }

})

function sendMessageDiscord(gchannel){
  api = 'https://world-boss-timer-bdoth.firebaseio.com/world_boss.json';

  console.log("-->> Update timing...")

  request({url: api, json: true}, function(error, response, data){
      if(!error){

        findBossNextSpawn(data);

        sendBossTimer(listBoss);


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

  var guildList = client.guilds.array();
  guildList.forEach(guild => guild.channels.find("name","world-boss-timers").send('```'+ text +'```'));

}

function bossTimer(bosstime,bossday){

  //for boss
  curr_day=new Date().getDay();
  boss_time = bosstime*60*60;
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

      tmp.push(s + 's');

      return tmp.join('');
  }
}());

function findBossNextSpawn(data){
  curr_day=new Date().getDay();
  hour=new Date().getHours();

  for(var i=0;i<5;i++){
    for (var key in data) {
      if(data[key].day==curr_day+i){
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

      if(listBoss.length > 4){
        break;
      }
    }
  }

};


client.login(botconfig.token);
