const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
var FilmsArray;
var ActorsArray;
var jsonFPath = "./films.json";
var jsonAPath = "./actors.json"
var LogFile = "./log.txt";
app.use(express.static("public"));





//-----------------Актёры-----------------//

app.get("/actors/readall", (req, res)=>
{
    sortActors(ActorsArray);
    res.send(JSON.stringify(ActorsArray));
})

app.get("/actors/read", (req, res)=>
{
    let id = req.query.id;
    let ac = ActorsArray.find(actor => actor.id == id);
    res.send(ac? JSON.stringify(ac): "wrong id");
})

app.post("/actors/create", (req, res)=>
{
    let b = req.body;
    console.log(b);
    if(b.name && b.birth && b.films && b.films > 0 && b.liked >= 0 && b.photo)
    {
        b.id = Math.round(Math.random()*1000000000);
        while(ActorsArray.find(actor=> actor.id == b.id))
        {
            b.id = Math.round(Math.random()*1000000000);
        }
        b.liked > 0 && b.films > 0? ActorsArray.push(b): res.send("Uncorrect number of films or(and) likes");
        changeActors();
        res.send(JSON.stringify(b));
    }
    else
    {
        res.send(`check parameters you send in request body:
    "id": int / string
    "name": string
    "birth": string // дата рождение
    "films": int // число фильмов
    "liked": int // число лайков
    "photo": string // ссылка на фото`)
    }
})

app.post("/actors/delete", (req, res) => 
{
    let id = req.body.id;
    if(id)
    {
        let b = ActorsArray.find(actor=> actor.id == id);
        if(!b)
        {
            res.send(`can't find actor with id №${id}`);
        }
        else
        {
            let ind;
            ActorsArray.forEach((element, index) => {
                if(element.id == id)
                    ind = index;
            });
            ActorsArray.splice(ind, 1);
            res.send(`Actor with id №${id} has been deleted`);
            changeActors();
        }
    }
    else
    {
        res.send("no id parameter!");
    }
})

app.post("/actors/update", (req, res)=>
{
    let b = req.body;
    let id = b.id;
    if(id)
    {
        let updAct = ActorsArray.find(actor => actor.id == id);
        let bbb = false;
        ActorsArray.forEach(actor=>
        {
            if(actor.id == id)
            {
                b.films? b.films>0?updAct.films = b.films:res.send("Uncorrect number of films"):{};
                b.liked? b.liked > 0?updAct.liked = b.liked:res.send("Uncorrect number of likes"):{};
                b.name?updAct.name = b.name:{};
                b.birth?updAct.birth = b.birth:{};
                res.send(`Actor with id №${id} was changed`);
                bbb = true;
                changeActors();
            }
        })
        if(!bbb)
            res.send(`Can't find actor with id №${id}`);

    }
    else
    {
        res.send(`Wrong id parameter!`);
    }
})

app.use((req, res, next)=>
{
    let dateNow = new Date();
    let dd = dateNow.getDate();
    let monthSingleDigit = dateNow.getMonth() + 1;
    let hh = dateNow.getHours();
    let mim = dateNow.getMinutes();
    let ss = dateNow.getSeconds();
    let mm = monthSingleDigit < 10 ? '0' + monthSingleDigit : monthSingleDigit;
    let yy = dateNow.getFullYear().toString().substr(2);
    let formattedDateAndTime = mm + '/' + dd + '/' + yy +' ' + hh + ':' + mim + ':' + ss;

    let endstr = `
    `;

    fs.appendFileSync(LogFile, "url: " + req.path + endstr);
    fs.appendFileSync(LogFile, "body: " + JSON.stringify(req.body) + endstr);
    fs.appendFileSync(LogFile, "queue: " + JSON.stringify(req.queue) + endstr);
    fs.appendFileSync(LogFile, "date/time: " + formattedDateAndTime + endstr + endstr);
    next();
})







//-----------------Фильмы-----------------//


app.post("/films/create", (req, res)=>
{
    let b = req.body;
    if(b.title && b.rating && b.budget && b.year && b.gross && b.poster && b.position)
    {
        let id = Math.round(Math.random()*1000000000000);
        while(FilmsArray.find(film=>
            {
                film.id == id;
            }))
            {
                id = Math.round(Math.random()*1000000000000);
            }
        b.id = id;
        let pos = Number.parseInt(b.position);
        let pp = 0;
        FilmsArray.forEach(element =>
        {
            element.position > pp? pp = Number.parseInt(element.position):pp = pp;
        });
        if(pos > pp)
        {
            b.position = pp+1;
        }
        else
        {
            FilmsArray.forEach(element => {Number.parseInt(element.position) >= pos?element.position = Number.parseInt(element.position) + 1:{}})
        }
        FilmsArray.push(b);
        changePositions();
        res.send(`added element: 
    ${JSON.stringify(b)}`);
    changeFilms();
    }
    else
    {
        res.send(`Missed some parameters.
Check your request for having all the parameters:
    title,
    rating,
    year,
    budget,
    gross,
    poster,
    position`);
    }
})


app.post("/films/delete", (req, res)=>
{
    let id = Number.parseInt(req.body.id);
    let ind;
    let bufItem;
    let pos;
    FilmsArray.forEach((element, index) => {
        if(Number.parseInt(element.id) == id)
        {
            ind = index;
            bufItem = element;
            pos = element.position;
        }
    });
    if(ind)
    {
        FilmsArray.splice(ind, 1);
        FilmsArray.forEach(element => {
            if(element.position > pos)
                element.position -= 1;
        });
        res.send(`deleted item: ${JSON.stringify(bufItem)}`);
        changeFilms();
        changePositions();
    }
    else
        res.send(`can't find film with id №${id}`);
})


app.post("/films/update", (req, res)=>
{
    let body = req.body
    if(!body.year && !body.budget && !body.title)
    {
        let id = body.id;
        let b;
        let ind;
        if(ind = FilmsArray.find(film => film.id == id))
        {
            b = true;
        }
        else
            b = false;
        if(b)
        {
            let bufb;
            if(body.position)
                body.position>0?ind.position = body.position:res.send("uncorrect position!");
            if(body.rating)
                body.rating >0?ind.rating = body.rating:res.send("uncorrect rating!");
            if(body.poster)
                ind.poster = body.poster
            if(body.gross)
            {
                body.gross > 0? ind.gross = body.gross: res.send("uncorrect gross!");
            }
            FilmsArray.forEach(element => {
                if(element.id == id)
                {
                    bufb = element;
                    element = ind;
                }
            });
            changePositions();
            res.send(`changed item: from ${JSON.stringify(bufb)} to ${JSON.stringify(ind)}`);
        }
        else
        {
            res.send(`can't find film with id №${id}`);
        }
    }
    else
    {
        res.send(`Allowed only to change id, position, gross and poster. Another changes are forbidden `);
    }
})


app.post("/films/read", (req, res)=>
{
   res.send(FilmsArray.find(film=>film.id == req.body.id)?FilmsArray.find(film=>film.id == req.body.id):`can't find film with id ${req.body.id}`);
})

function changeFilms()
{
    fs.writeFileSync(jsonFPath, JSON.stringify(FilmsArray));
}

function changeActors()
{
    fs.writeFileSync(jsonAPath, JSON.stringify(ActorsArray));
}

app.get('/films/readall',(req, res)=>
{
    sortFilms(FilmsArray);
    result = FilmsArray;
    res.send(result);
})

app.get('/', (req, res) =>
{
    res.send("Здарова");
    
});


app.listen(3000, () =>
{
    let jsonFBuf = fs.readFileSync(jsonFPath);
    FilmsArray = JSON.parse(jsonFBuf);
    let jsonABuf = fs.readFileSync(jsonAPath)
    ActorsArray = JSON.parse(jsonABuf);
    console.log("Start listening...");
})

function sortFilms(arr)
{
//   switch(sf)
//     {
//       case "author":
//       {
//         arr.sort((a, b)=>
//         {
//           return orf?a.author.localeCompare(b.author): -a.author.localeCompare(b.author);
//         })
//         break;
//       }
//       case "date":
//       {
//         arr.sort((a, b)=>
//         {
//           return Date.parse(a.date) >= Date.parse(b.date)? (orf?1:-1):(orf?-1:1);
//         })
//         break;
//       }
//       case "id":
//       {
        arr.sort((a, b)=>
        {
          return Number.parseInt(a.position) >= Number.parseInt(b.position)? 1:-1;
        })
    //     break;
    //   }
    //   default:
    //   {
    //     break;
    //   }
    // }
}

function sortActors(arr)
{
    arr.sort((a, b)=>
    {
        return Number.parseInt(a.liked) >= Number.parseInt(b.liked)? 1:-1;
    })
}

function changePositions()
{
    sortFilms(FilmsArray);
    let i = 1;
    FilmsArray.forEach(element => {
        element.position = i++;
    });
}