# API JT EXpress
web scriping on https://vip.jtexpress.co.th
## วิธี Setup ENV
ดูได้ใน .env.example นะจ๊ะ

## วิธี Start Project
```
### Start Prod
$ docker-compose -f docker-compose.prod build
$ docker-compose -f docker-compose.prod up -d

### Start Dev
$ docker-compose build
$ docker-compose up
```
# ROUTE และ วิธีเรียกใช้ API 
import Insomnia.json ไปที่โปรแกรม Insomnia


# เมื่อรัน docker แล้วให้เข้าไปรัน cronjob เพื่อ relogin ตามช่วงเวลา
```

## คำสั่งเข้าไปยังเครื่องใน docker
  docker exec -ti "ชื่อ Container" bash
  เช่น docker exec -ti adonis_bot_dev bash
## คำสั่งรัน cronjob เพื่อให้บอทล็อคอินอัตโนมัติทำงาน 
  node ace run:scheduler

```