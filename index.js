const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const ffbrobePath = require("@ffprobe-installer/ffprobe").path;
var async = require('async');

ffmpeg.setFfprobePath(ffbrobePath);
ffmpeg.setFfmpegPath(ffmpegPath);
var cors = require('cors')
const bodyParser = require('body-parser');
var sanitize = require("sanitize-filename");

const fetch = require('node-fetch');
const Path = require('path')
const https = require('https')
const Fs = require('fs')

const express = require('express')
const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(Path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(Path.join(__dirname, 'build', 'index.html'));
})

app.post('/', async (req,res) => {
  console.log(req.body)
  Name = req.body.name
  soundId = req.body.soundId
  userId = req.body.userId
  question_key = req.body.question_key
  await conversionProcess(Name,soundId,userId,question_key)
  res.send(req.body)
})

var name_people = [];

async function getAnswers(Name,question_key) {
  const url_question = `https://vorail-app.appspot.com/app/v1/qa/ask-all/thread?key=${question_key}`;
  
  const response = await fetch(url_question);
  const datas = await response.json()
  name_people.length = 0;
  var number_answer = datas.question.answers.length;
  console.log(number_answer);
  datas.question.answers.forEach(async (answer,index) => {
    name_people.push(answer.user.name);
    if(index > 5){
      return
    }
      const res = await https.get(`https://storage.googleapis.com/vorail/${answer.user.userId}/${answer.soundId}`, function (res){
      const path = Path.resolve(__dirname,'./answer',`${sanitize(String(answer.user.name))}.mp3`)
      const audioStream = Fs.createWriteStream(path)
      res.pipe(audioStream)

      audioStream.on('error', function(err){
        console.log('Error Writing to the stream')
        console.log(err)
      });
      
      audioStream.on('finish', async function(){
        await audioStream.close()
        
        if(index < 5 || index > 5){
          return
        }
        
        var process = await new ffmpeg()
          .input(`./question/${sanitize(String(Name))}.mp3`)
          .inputOptions('-t 10')
          .input(`./answer/${sanitize(String(name_people[0]))}.mp3`)
          .inputOptions('-t 5')
          .input(`./answer/${sanitize(String(name_people[1]))}.mp3`)
          .inputOptions('-t 5')
          .input(`./answer/${sanitize(String(name_people[2]))}.mp3`)
          .inputOptions('-t 5')
          .input(`./answer/${sanitize(String(name_people[3]))}.mp3`)
          .inputOptions('-t 5')
          .input(`./answer/${sanitize(String(name_people[4]))}.mp3`)
          .inputOptions('-t 5')
          .input(`./answer/${sanitize(String(name_people[5]))}.mp3`)
          .inputOptions('-t 8')
          .input('newVorailVideo.mp4')
          .inputOptions('-t 43')
          .duration(42.9)
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:"PRISTINA.TTF",
              text: Name,
              fontsize: 50,
              fontcolor: 'black',
              line_spacing: 30,
              // x: '(main_w/2-text_w/2)',
              x: 50,
              y: 50,
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              boxborderw: '15',
              alpha: `if(lt(t,1.5),0,if(lt(t,1.5+2),(t-1.5)/1.5,if(lt(t,1.5+2+35),1,if(lt(t,1.5+2+35+2),(2-(t-1.5-2-35))/2,0))))`,
              box: 1,
              boxcolor: '#d0d9d2',
              enable: 'gte(t\,1.5)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:"PRISTINA.TTF",
              text: name_people[0],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) +  35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxcolor: '#0063cc',
              boxborderw: '20',
              alpha: `if(lt(t,10),0,if(lt(t,10+0.5),(t-10)/10,if(lt(t,10+0.5+4),1,if(lt(t,10+0.5+4+0.5),(0.5-(t-10-0.5-4))/0.5,0))))`,
              enable: 'between(t\,10\,15)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.TTF',
              text: name_people[1],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) + 35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxborderw: '20',
              boxcolor: '#0063cc',
              alpha: `if(lt(t,15),0,if(lt(t,15+0.5),(t-15)/15,if(lt(t,15+0.5+4),1,if(lt(t,15+0.5+4+0.5),(0.5-(t-15-0.5-4))/0.5,0))))`,
              enable: 'between(t\,15\,20)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.ttf',
              text: name_people[2],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) +  35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxcolor: '#0063cc',
              boxborderw: '20',
              alpha: `if(lt(t,20),0,if(lt(t,20+0.5),(t-20)/20,if(lt(t,20+0.5+4),1,if(lt(t,20+0.5+4+0.5),(0.5-(t-20-0.5-4))/0.5,0))))`,
              enable: 'between(t\,20\,25)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.ttf',
              text: name_people[3],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) + 35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxborderw: '20',
              boxcolor: '#0063cc',
              alpha: `if(lt(t,25),0,if(lt(t,25+0.5),(t-25)/25,if(lt(t,25+0.5+4),1,if(lt(t,25+0.5+4+0.5),(0.5-(t-25-0.5-4))/0.5,0))))`,
              enable: 'between(t\,25\,30)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.ttf',
              text: name_people[4],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) +  35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxborderw: '20',
              boxcolor: '#0063cc',
              alpha: `if(lt(t,30),0,if(lt(t,30+0.5),(t-30)/30,if(lt(t,30+0.5+4),1,if(lt(t,30+0.5+4+0.5),(0.5-(t-30-0.5-4))/0.5,0))))`,
              enable: 'between(t\,30\,35)',
            }
          })
          
          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.ttf',
              text: name_people[5],
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) +  35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxborderw: '20',
              boxcolor: '#0063cc',
              alpha: `if(lt(t,35),0,if(lt(t,35+0.5),(t-35)/35,if(lt(t,35+0.5+4),1,if(lt(t,35+0.5+4+0.5),(0.5-(t-35-0.5-4))/0.5,0))))`,
              enable: 'between(t\,35\,40)',
            }
          })

          .videoFilters({
            filter: 'drawtext',
            options: {
              fontfile:'PRISTINA.ttf',
              text: 'To hear the full conversation, open Vorail on your Alexa device',
              fontsize: 50,
              fontcolor: 'white',
              line_spacing: 30,
              x: '(main_w/2-text_w/2) +  35',
              y: 'main_h/2 - text_h/2',
              // x: '(w-text_w)/2',
              // y: '4*t*t*t - 68*t*t + 280*t',
              shadowcolor: 'black',
              shadowx: 2,
              shadowy: 2,
              box: 1,
              boxborderw: '20',
              boxcolor: '#0063cc',
              alpha: `if(lt(t,40),0,if(lt(t,40+0.5),(t-40)/40,if(lt(t,40+0.5+2),1,if(lt(t,40+0.5+2+0.5),(0.5-(t-40-0.5-2))/0.5,0))))`,
              enable: 'between(t\,40\,43)',
            }
          })

          .on('error', function (err) {
            console.log(`An error occurred: ${err.message}`)
          })

          .on('end', function () {
            console.log(`Merging '${sanitize(String(Name))}.mp4' to /VideoChanged Folder is Finished !`)
          })
          
          .mergeToFile(`./videoChanged/${sanitize(String(Name))}.mp4`, "./temp");
        });
      })
  })
}

async function conversionProcess (Name,soundId,userId,question_key){
  const url = 'https://storage.googleapis.com/vorail'
  const path = Path.resolve(__dirname,'./question',`${sanitize(String(Name))}.mp3`)
  let audio_url =  `${url}/${userId}/${soundId}`
  https.get(audio_url,function(res){
    const audioStream = Fs.createWriteStream(path)
    res.pipe(audioStream)
    
    audioStream.on('error', function(err){
      console.log('Error Writing to the stream')
      console.log(err)
    })

    audioStream.on('finish', async function(){
       audioStream.close()
      await getAnswers(Name, question_key);
    })
  })
}

// getDuration();
app.listen(4000)