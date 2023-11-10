import React, { Component } from "react";
import debounce from "lodash/debounce";
import "./App.css";
class App extends Component {
  constructor() {
    super();
    this.state = {
      movies: [],
      searchTerm: "",
      selectedGenre: "", // Add a state for selected genre
      page: 1,
      isLoading: false,
      genres: [], // To store the list of available genres
      selectedTab: "allMovies", // Default to 'allMovies' tab
      favorites: [], // Array to store favorite movies
      moviesBySearch: [],
    };
    this.fetchMoviesDebounced = debounce(this.fetchMovies, 300);
  }

  componentDidMount() {
    // Fetch the list of available genres from TMDB API when the component mounts
    this.fetchGenres();
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver = () => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection,
      options
    );
    this.intersectionObserver.observe(this.sentinel);
  };

  handleIntersection = (entries) => {
    if (entries[0].isIntersecting && !this.state.isLoading) {
      // this.fetchMovies();
      this.fetchMoviesDebounced();
    }
  };

  fetchGenres = () => {
    const apiKey = "db0bcc229d6281c6c3c4c1208e93c70c";
    const baseUrl = "https://api.themoviedb.org/3";
    const genresEndpoint = "/genre/movie/list"; // Endpoint to fetch movie genres

    const apiUrl = `${baseUrl}${genresEndpoint}?api_key=${apiKey}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ genres: data.genres });
      })
      .catch((error) => {
        console.error("Error fetching genres:", error);
      });
  };

  fetchMovies = () => {
    const { selectedGenre, page } = this.state;
    const apiKey = "db0bcc229d6281c6c3c4c1208e93c70c";
    const baseUrl = "https://api.themoviedb.org/3";
    const moviesEndpoint = "/discover/movie"; // Endpoint to discover movies

    // Build the API URL with genre filtering
    const apiUrl = `${baseUrl}${moviesEndpoint}?api_key=${apiKey}&page=${page}${
      selectedGenre ? `&with_genres=${selectedGenre}` : ""
    }`;

    this.setState({ isLoading: true });

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const newMovies = data.results.map((movie) => ({
          ...movie,
        }));
        this.setState((prevState) => ({
          movies: [...prevState.movies, ...newMovies],
          page: prevState.page + 1,
          isLoading: false,
        }));
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        this.setState({ isLoading: false });
      });
  };

  handleGenreSelect = (event) => {
    const selectedGenre = event.target.value;
    this.setState({ selectedGenre, movies: [], page: 1 }, () => {
      // this.fetchMovies();
      this.fetchMoviesDebounced();
    });
  };

  handleInputChange = (event) => {
    
    const searchTerm = event.target.value;
    let moviesBySearch = [];
    // Filter movies based on the search term

    if (this.state.selectedTab === "allMovies") {
      moviesBySearch = this.state.movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      moviesBySearch = this.state.favorites.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    this.setState({ searchTerm, moviesBySearch });
  };

  handleClearSearch = () => {
    // Clear the search term
    this.setState({ searchTerm: '' });
  };


  handleAddToFavorite = (movie) => {
    if (!this.state.favorites.find((favMovie) => favMovie.id === movie.id)) {
      this.setState((prevState) => ({
        favorites: [...prevState.favorites, movie],
      }));
    }
  };

  // Function to remove a movie from favorites
  handleRemoveFromFavorites = (movie) => {
    this.setState((prevState) => ({
      favorites: prevState.favorites.filter(
        (favMovie) => favMovie.id !== movie.id
      ),
    }));
  };

  // Function to switch between tabs
  handleTabChange = (tab) => {
    this.setState({ selectedTab: tab });
  };

  render() {
    const {
      movies,
      searchTerm,
      selectedGenre,
      genres,
      selectedTab,
      favorites,
      moviesBySearch,
    } = this.state;



    // Filter movies based on the selected tab
    let filteredMovies =
      selectedTab === "allMovies"
        ? movies
        : selectedTab === "favorites"
        ? favorites
        : [];
    
        if (selectedTab === "allMovies") {
          filteredMovies = this.state.movies.filter((movie) =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          
          filteredMovies = this.state.favorites.filter((movie) =>
            movie.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

    return (
      <div className="page-container">
        <h1>Movies App</h1>

        <div className="input-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={this.handleInputChange}
          />
          <button className="clear-button" onClick={this.handleClearSearch}>
              Clear
            </button>
        </div>

        <select
          className="genre-select"
          value={selectedGenre}
          onChange={this.handleGenreSelect}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <div className="tab-buttons">
          <div
            className={`tab-button ${
              selectedTab === "allMovies" ? "active" : ""
            }`}
            onClick={() => this.handleTabChange("allMovies")}
          >
            ALL MOVIES
          </div>
          <div
            className={`tab-button ${
              selectedTab === "favorites" ? "active" : ""
            }`}
            onClick={() => this.handleTabChange("favorites")}
          >
            FAVOURITES
          </div>
        </div>

        <div className="movie-grid">
          {filteredMovies.map((movie) => (
            <div className="movie-card" key={movie.id}>
              <div>
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title}
                />
                <p>{movie.title}</p>
              </div>
              {selectedTab !== "favorites" && (
                <button
                  className="favorite-button"
                  onClick={() => this.handleAddToFavorite(movie)}
                >
                  Add to Favorites
                </button>
              )}
              {selectedTab === "favorites" && (
                <button
                  className="favorite-button"
                  onClick={() => this.handleRemoveFromFavorites(movie)}
                >
                  Remove from Favorites
                </button>
              )}
            </div>
          ))}
        </div>
        <div ref={(sentinel) => (this.sentinel = sentinel)}></div>
      </div>
    );
  }
}

export default App;
