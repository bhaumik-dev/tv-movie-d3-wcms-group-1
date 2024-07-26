const axios = require("axios");
const fs = require("fs");

const apiKey = "20163370d3msh99a4a6f8ed07923p1c82f7jsned5d20730fb0";

const fetchTVSeries = () => {
  const options = {
    method: "GET",
    url: "https://imdb-top-100-movies.p.rapidapi.com/series/",
    headers: {
      "x-rapidapi-host": "imdb-top-100-movies.p.rapidapi.com",
      "x-rapidapi-key": apiKey,
    },
  };

  return axios.request(options);
};

fetchTVSeries()
  .then((response) => {
    console.log(
      "TV Series API Response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data) {
      const tvShows = response.data.slice(0, 10).map((show) => ({
        title: show.title || "Unknown Title",
        rating: parseFloat(show.rating) || 0,
        voteCount: show.vote_count || 0,
        genres: Array.isArray(show.genre) ? show.genre : ["Unknown"],
        image: show.image || "https://via.placeholder.com/150",
      }));

      fs.writeFileSync("data/tvShows.json", JSON.stringify(tvShows, null, 2));
      console.log("Top 10 data fetched and saved to tvShows.json");

      const genreCount = {};

      tvShows.forEach((show) => {
        show.genres.forEach((genre) => {
          console.log(`Processing genre: ${genre}`);
          if (genre in genreCount) {
            genreCount[genre]++;
          } else {
            genreCount[genre] = 1;
          }
        });
      });

      fs.writeFileSync(
        "data/genreCount.json",
        JSON.stringify(genreCount, null, 2)
      );
      console.log("Genre count data fetched and saved to genreCount.json");
    } else {
      console.error("Invalid response structure:", response.data);
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
