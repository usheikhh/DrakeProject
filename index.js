import express from "express" //application framework 
import axios from "axios"  //library used to make http requests 
import bodyParser from "body-parser" //module used to parse incoming request bodies (req.body)
import qs from "qs"
import fs from "fs"




// creating an express app on port 3000
const app = express(); 
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


//acquired from spotify
var client_id = "38d4b45d7e3c4ab782c3419d97abb916";
var client_secret = "bf04c95ea63944daa9db58baa09b68e0";

var token;

//setting up data for the configuration 
let data = qs.stringify({
'grant_type': 'client_credentials',
'client_id': '38d4b45d7e3c4ab782c3419d97abb916',
'client_secret': 'bf04c95ea63944daa9db58baa09b68e0' 
});

//setting up configuration for axios request 
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://accounts.spotify.com/api/token',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded', 
  },
  data : data
};
    
var log;
await axios.request(config) //wait for response 
.then((response) => {
  log = (response.data); //saving the response 
  console.log("token saved")
})
.catch((error) => {
  console.log(error);
});

var token = log.access_token; //token now saved as a string


function album(type, albumName, pics, id, release_date, total_tracks, albumMP){
  return{
    type: type,
    albumName: albumName,
    pics: pics,
    id: id,
    release_date: release_date,
    total_tracks: total_tracks,
    albumMP: albumMP,
  };
};


function track(trackName, pic, duration, explicit, preview){
  return{
    trackName: trackName,
    pic: pic,
    duration: duration, 
    explicit: explicit,
    preview: preview,
  };
};






app.get("/", async (req,res) => {
    res.render("index.ejs")
});









app.get("/Albums", async (req, res) =>{
  let arr2 = [];

  var data;

  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4/albums?limit=50&offset=0',
      headers: { 
        'Authorization': 'Bearer ' + token, 
      }
    };
    
    await axios.request(config)
    .then((response) => {
      data = response.data;

    })
    .catch((error) => {
      console.log(error);
    });

    const mp = new Map();
    const albumMP = new Map();

    var arr = [];
    var img = data.images;
    data = data.items;
    for (const item of data){

      config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.spotify.com/v1/albums/'+item.id+'/tracks?offset=0&limit=50',
        headers: { 
          'Authorization': 'Bearer ' + token, 
        }
      };
      await axios.request(config)
      .then((response) => {
        data = response.data;
        // console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });

      
      
      let trackData = data.items;
      // console.log(trackData);

      for(const item of trackData){
        arr.push(item.name);
        albumMP[item.name] = (new track(item.name, img, item.duration_ms, item.explicit, item.preview_url ))
        arr2.push(new track(item.name, img, item.duration_ms, item.explicit, item.preview_url ))
        console.log(albumMP[item.name]);
      }

      mp[item.name] = (new album(item.album_type,item.name, item.images, item.id, item.release_date, item.total_tracks, albumMP));
      // console.log(mp[item.name]);
    }


    // for(var i in mp){
    //   console.log(mp[i].albumMP);
    // }

    // arr = arr.sort()
    // console.log(arr);

    const jsonString = JSON.stringify(arr2);
    fs.writeFile('public/data.json',jsonString, (err) => {
      if (err){
        throw new Error(err);
      }
      console.log("data.json saved successfully")
    } ); 

    res.render("albums.ejs");
    
    


    
});









app.get("/Popular", async (req, res) =>{

    var data;

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4',
        headers: { 
          'Authorization': 'Bearer ' + token, 
        }
      };
      
      await axios.request(config)
      .then((response) => {
        data = response.data;
        // console.log("saved");
      })
      .catch((error) => {
        console.log(error);
      });

      // console.log(data);
      var followers = data.followers.total; //integer
      var genres = data.genres; //array of strings 
      var popularity = data.popularity; //integer
      var images = data.images; //array

      // console.log(images[0].url)


      config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.spotify.com/v1/artists/3TVXtAsR1Inumwj472S9r4/top-tracks',
        headers: { 
          'Authorization': 'Bearer ' + token, 
        }
      };
      
      await axios.request(config)
      .then((response) => {
        data = response.data
      })
      .catch((error) => {
        console.log(error);
      });

      var tracks = data.tracks; //array of popular tracks 

      //trying to construct an object of all the popular tracks with:
        // album -> images 
        // duration 
        // explicit 
        // name 
        // popularity 
        // preview URL 


      var ID = (tracks[0].id);
      let trackList = [];
      for(const track of tracks){
        
        
        var ID = track.id;
        config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: 'https://api.spotify.com/v1/tracks/'+ID,
          headers: { 
            'Authorization': 'Bearer ' + token, 
          }
        };
        
        await axios.request(config)
        .then((response) => {
          data = response.data;
          // console.log(data.preview_url);

        })
        .catch((error) => {
          console.log(error);
        });


        //creating an object for each track to be pushed into the tracklist to be sent over to popular.ejs
        let obj = {
          trackName: "", //string
          pic: "", //string: href; og size 640x640 px
          duration: 0, //integer: duration of song in seconds
          explicit: false, //boolean if explicit or not; true: explicit
          popularity: 0, //integer: 0-100
          preview: "", //string: href to a 30 second preview; can be null if spotify doesn't have a preview

        };

        obj.pic = data.album.images[0].url;
        // console.log(obj.pic);
        obj.duration = Math.floor(data.duration_ms/1000);
        obj.explicit = data.explicit;
        obj.trackName = data.name;
        obj.popularity = data.popularity;
        obj.preview = data.preview_url;


        
        trackList.push(obj);
        
        
      };

      
    
    res.render("popular.ejs",{followers: followers, genres: genres, popularity:popularity, images: images, token:token, trackList: trackList});
});



app.listen(port, () =>{
    console.log();
    console.log(`Server running on port ${port}`)
})


