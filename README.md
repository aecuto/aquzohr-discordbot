# Aquzohr Discord Bot | BDO[TH] Timer (How to setup) 

## สำหรับจะเป็นบอทแชร์ให้คนอื่นใช้ด้วย (ไม่ค่อยสเถียร์)

* กำหนด botconfig เป็น "server": "public" และ "channelName": "world-boss-timers" | world-boss-timers คือชื่อ text channel ที่เราต้องการ

* ชวนบอทเข้าห้อง Discord (ตั้งบอทเป็น admin ด้วยนะ)
Invite Bot : https://discordapp.com/api/oauth2/authorize?client_id=452334724250075137&scope=bot&permissions=1

* ถ้าเกิน 1 นาที แล้วบอทไม่ทำงานก็เข้าเว็บนี้ >> https://aquzohrbot.herokuapp.com/ เพื่อปลุก Aquzohr Bot

ปล.อย่าเข้ากันหลายคนเน้อ เดียวบอทรวน :)

## สำหรับใช้คนเดียว (Private)

* ชวนบอทเข้าห้อง Discord (ตั้งบอทเป็น admin ด้วยนะ): https://discordapp.com/api/oauth2/authorize?client_id=452334724250075137&scope=bot&permissions=1 

* กำหนด botconfig เป็น "server": "unpublic" หรืออะไรก็ได้ที่ไม่ใช่ public

* หาไอดี text-channel คลิกขวา channel ที่จะให้บอทเตือน แล้วกดตลิกขวา copy id | ต้องเปิด Dev Mode ใน Use setting ก่อนถึงจะ copy id ได้ ถ้าไม่เจอถาม google

* แก้ไอดีใน botcongig | "textChannel": "my_channel_id",

* รันบอทพิมพ์ (ลง nodejs กันด้วยละ)
```
$npm start
```

## อื่นๆ

ถ้าเว็บฟรีหมดมาดูเวลาตรงนี้ได้ : https://world-boss-timer-bdoth.firebaseapp.com/

color text: https://gist.github.com/ringmatthew/9f7bbfd102003963f9be7dbcf7d40e51
