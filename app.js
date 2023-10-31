const express = require("express");
const {open} = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
const app= express();

let dataBase = null;

const initializeDBAndServer = async() => {
    try{
        dataBase = await open({
        filename: dbPath,
        driver : sqlite3.Database,
    });
    app.listen(3000, () =>{
        console.log("Server Running at http://localhost/3000/");
    });
    }catch (e) {
        console.log(`DB Error : ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

const convertMovieTable = (eachObject) => {
    return {
        movieId : eachObject.movie_id,
        directorId : eachObject.director_id,
        movieName : eachObject.movie_name,
        leadActor : eachObject.lead_actor,
    };
};

const convertDirectorTable =(eachObject) => {
    return {
        directorId : eachObject.director_id,
        directorName : eachObject.director_name,
    };
};

app.get("/movies/", async(request, response) => {
    const getMoviesQuery = `
    SELECT 
      movie_name 
    FROM 
        movie;`;
    const moviesArray = await dataBase.all(getMoviesQuery);
    response.send(moviesArray.map((eachArray) => ({movieName : eachArray.movie_name})));
});

app.get("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const getMovieQuery = `
    SELECT 
      * 
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
    const movieArray = await dataBase.get(getMovieQuery);
    response.send(convertMovieTable(movieArray));
});

app.get("/directors/", async(request, response) => {
    const getDirectorsQuery = `
      SELECT 
        * 
      FROM 
        director;`;
    const directorArray = await dataBase.all(getDirectorsQuery);
    response.send(directorArray.map((eachArray) => convertDirectorTable(eachArray)));
});

app.get("/directors/:directorId/movies/", async(request, response) => {
    const {directorId} = request.params;
    const getDirectorMovieQuery = `
      SELECT 
        movie_name 
      FROM 
        movie 
      WHERE 
        director_id = ${directorId};`;
    const moviesArray = await dataBase.all(getDirectorMovieQuery);
    response.send(moviesArray.map((eachArray) => ({ movieName : eachArray.movie_name })));
});

app.post("/movies/", async (request, response) => {
    const {directorId, movieName, leasActor} = request.body;
    const addMovieQuery = `
      INSERT INTO
        movie(director_id, movie_name, lead_actor)
      VALUES(
        ${directorId},
       '${movieName}',
       '${leadActor}');`;
    const dbResponse = await dataBase.run(addMovieQuery);
    //const movieId = dbResponse.lastID;
    response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async(request, response) => {
    const {movieId} = request.params;
    const {directorId, movieName, leadActor} = request.body;
    const updateMovieQuery = `
      UPDATE 
        movie
      SET  
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}';`;
    await.dataBase.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async(request,response) => {
    const {movieId} = request.params;
    const deleteMovieQuery = `
      DELETE FROM 
        movie 
      WHERE 
        movie_id = ${movieId};`;
    await dataBase.run(deleteMovieQuery);
    response.send("movie removed");
});

module.exports = app;
