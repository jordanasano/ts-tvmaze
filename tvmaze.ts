import axios from "axios";
import * as $ from 'jquery';

const $showsList: JQuery = $("#showsList");
const $episodesArea: JQuery = $("#episodesArea");
const $searchForm: JQuery = $("#searchForm");
const $episodeBtn: JQuery = $(".Show-getEpisodes");
const TVMAZE_API_URL: string = "http://api.tvmaze.com/";

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: Record<string,string>
};

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string
};

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {

  const response:Record<string,any> = await axios.get(`${TVMAZE_API_URL}search/shows?q=${term}`)
  console.log(response)

  const shows:Record<string,any> = response.data;

  return shows.map((show:Record<string,any>) =>{ return{
    id: show.show.id,
    name:show.show.name,
    summary: show.show.summary,
    image:show.show.image
  }});

}
/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    console.log('image =', show.image);
    const $show: JQuery = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image.original}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term: string  = $("#searchForm-term").val() as string;
  const shows: ShowInterface[] = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", async function (evt) {
  evt.preventDefault();
  console.log(evt);
 // await getEpisodesOfShow(evt.target.id);
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id:number): Promise<EpisodeInterface[]> { 
  const response = await axios.get(`${TVMAZE_API_URL}shows/${id}/episodes`);
  const episodes = response.data;

  return episodes.map((episode: Record<string, any>): EpisodeInterface => {
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }
  });
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes: EpisodeInterface[]): void { 
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode: JQuery = $(
      `<div data-show-id="${episode.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <div class="media-body">
             <h5 class="text-primary">${episode.name}</h5>
             <div><small>${episode.season}</small></div>
             <div><small>Episode: ${episode.number}</small></div>
           </div>
         </div>
       </div>
      `);

    $episodesArea.append($episode);
  }
}
