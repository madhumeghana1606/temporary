const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorTableObj =(dbObject) => {
    return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
    };
};

app.get("/movies/",async(request,response) => {
    const query1 = `SELECT movieName FROM movie;`;
    const res1 = await db.all(query1);
    response.send(res1.map(eachobject) => convertDbObjectToResponseObject(eachobject));
});

app.post("/movies/",async (request,response) => {
    const {directorId,movieName,leadActor} = request.body;
    const query2 = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}');`;
    const result2 = await db.run(query2);
    response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/",async(request,response) => {
    const {movieId} = request.params;
    const query3 = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
    const result3 = await db.get(query3);
    response.send(convertDbObjectToResponseObject(result3));
});

app.put("/movies/:movieId/",async(request,response) =>
{
   const {movieId} = request.params; 
   const {directorId,movieName,leadActor} = request.body;
   const query4 =
   `UPDATE movie SET director_id = ${directorId}, movie_name='${movieName}',lead_actor = '${leadActor}'
   WHERE movie_id = ${movieId};`;
   await db.run(query4);
   response.send("Movie Details Updated");

});

app.delete("/movies/:movieId/",async(request,response) =>
{
    const {movieId} = request.params;
    const query5 = `DELETE FROM movie WHERE movie_id = ${movieId};`;
    const result5 = await db.run(query5);
    response.send("Movie Removed");
});

app.get("/directors/",async(request,response) =>
{
    const query6 = `SELECT * FROM director`;
    const result6 = await db.all(query6);
    response.send(result6.map(object) => convertDirectorTableObj(object));
});

app.get("/directors/:directorId/movies/",async(request,response) =>{
    const {directorId} = request.params;
    const query7 = `SELECT * FROM movie WHERE director_id=${directorId};`;
    const result7 = await db.all(query7);
    response.send(result7.map(eachobject) => convertDirectorTableObj(eachobject));
});

module.exports = app;
