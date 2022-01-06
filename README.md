# Assignment 2 - Web API.

Name: Ruoye Qian

## Features.

...... A bullet-point list of the ADDITIONAL features you have implemented in the API.
 + Feature 1 - Modify the get method of movie reviews. Store the movie reviews in the database from TMDB for the data persistence. I defined a new Model called ReviewsModel to store the reviews of the movies. 
 + Feature 2 - Modify the post method of movie reviews. Use the regular expressions to validate the review. For example, Reviews cannot be submitted when the word count is less than 10.
 + Feature 3 - get the popular movies.
 + Feature 4 - get topRated movies.
 + Feature 5 - get upcoming movies.
 + Feature 6 - get popular moveis.
 + Feature 7 - get the particular movie's recommendations.
 + Feature 8 - get the similar movies of a particular movie.
 + Feature 9 - Get actors by page for the react app's pagination functionality. Get detail information of a particular actor.
 + Feature 10 - Get tvs by page for the react app's pagination functionality. Get detail information of a particular tv.
 + Feature 11 - Get the cast of the specific TV by Id.
 + Feature 12 - Modify the post method of users. Use the regular expressions to validate the user. For example, password must include both number and character.
 + Feature 13 - add new variable in UserModel to store favourite actors. users can add and get favourite actors by userName.
 + Feature 14 - add new variable in UserModel to store favourite tvs. users can add and get favourite tvs by userName.
 + Feature 15 - customized password validation.

## Installation Requirements

Describe what needs to be on the machine to run the API (Node v?, NPM, MongoDB instance, any other 3rd party software not in the package.json). 
 + Need to be run on the node, and cloud mongdb. 
 + "nodemon": "^2.0.15", "express": "^4.17.1", "express-session": "^1.17.2", "jsonwebtoken": "^8.5.1", "mongoose": "^6.0.3", "passport": "^0.5.0", "passport-jwt": "^4.0.0"

Describe getting/installing the software:

```bat
git clone https://github.com/Ruoye-Qian/movies-api-assignment2.git
```

In package.json, the dependency softwares and their version are recorded.

Then run the code in terminal to install
```bat
npm install
```

## API Configuration
Describe any configuration that needs to take place before running the API. 

```bat
NODE_ENV=development
PORT=8080
HOST=localhost
mongoDB=mongodb+srv://Ruoye:20001112@cluster0.gh8zt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
SEED_DB=true
SECRET=ilikecake
TMDB_KEY=YourOwnKey
```


## API Design
An overview of web API design.

|  |  GET | POST | PUT | DELETE
| -- | -- | -- | -- | -- 
| /api/genres |Get a list of genres | N/A | N/A | N/A
| /api/movies |Get a list of movies | N/A | N/A | N/A
| /api/movies/{movieid} |Get a Movie | N/A | N/A | N/A
| /api/movies/{movieid}/reviews | Get all reviews for movie | Create a new review for Movie | N/A | N/A  
| /api/movies/tmdb/upcoming |Get a list of upcoming movies | N/A | N/A | N/A 
| /api/movies/tmdb/nowplaying |Get a list of nowplying movies | N/A | N/A | N/A
| /api/movies/tmdb/topRated |Get a list of topRated movies | N/A | N/A | N/A 
| /api/movies/tmdb/popular |Get a list of popular movies | N/A | N/A | N/A 
| /api/movies/{movieid}/recommendations |Get recommendations for movie | N/A | N/A | N/A 
| /api/movies/{movieid}/similar |Get similar movies of a particular movie | N/A | N/A | N/A 
| /api/actors |Get a list of actors | N/A | N/A | N/A 
| /api/actors/{actorid} |Get an actor | N/A | N/A | N/A
| /api/tvs |Get a list of tvs | N/A | N/A | N/A 
| /api/tvs/{tvid} |Get a tv | N/A | N/A | N/A 
| /api/tvs/{tvid}/cast |Get cast of a tv | N/A | N/A | N/A
| /api/users |Get a list of users | Create a user | N/A | N/A
| /api/users/{userid}|Get a user | N/A |  Update user's information | N/A
| /api/{userName}/favourites |Get a list of favourite movies | Add favourite movies | N/A | N/A
| /api/users/{userName}/likes |Get a list of favourite actors | Add favourite actors | N/A | N/A
| /api/users/{userName}/tvPlaylist |Get a list of favourite tvs | Add favourite tvs | N/A | N/A

## Security and Authentication
Give details of authentication/ security implemented on the API(e.g. passport/sessions). Indicate which routes are protected.
 + the session is implemented in the middleware of index.js.

~~~Javascript
app.use(
  session({
    secret: "ilikecake",
    resave: true,
    saveUninitialized: true,
  })
);
~~~

 + the router is protected with passportJWT. 

~~~Javascript
app.use('/api/movies', passport.authenticate('jwt', {session: false}), moviesRouter);
app.use('/api/actors',passport.authenticate('jwt', {session: false}), actorsRouter);
app.use('/api/tvs',passport.authenticate('jwt', {session: false}), tvsRouter);
~~~

## Integrating with React App

Describe how you integrated your React app with the API. Perhaps link to the React App repo and give an example of an API call from React App. For example: 
 + Add below port into the bottom of the package.json in my Movies Application.
 
~~~Javascript
"proxy":"http://localhost:8080"
~~~

 + and change tmdb-api.js with own new API.

~~~Javascript
export const getMovies = () => {
  return fetch(
     '/api/movies',{headers: {
       'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());
};
~~~

~~~Javascript
export const login = (username, password) => {
    return fetch('/api/users', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};
~~~

~~~Javascript
export const signup = (username, password) => {
    return fetch('/api/users?action=register', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({ username: username, password: password })
    }).then(res => res.json())
};
~~~

~~~Javascript
  export const getUpcomingMovies = () => {
    return fetch(
       '/api/movies/tmdb/upcoming',{headers: {
         'Authorization': window.localStorage.getItem('token')
      }
    }
    ).then(res => res.json());
  };
~~~

~~~Javascript
  export const getNowplayingMovies = () => {
    return fetch(
       '/api/movies/tmdb/nowplaying',{headers: {
         'Authorization': window.localStorage.getItem('token')
      }
    }
    ).then(res => res.json());
  };
~~~

~~~Javascript
export const getTopRatedMovies = () => {
  return fetch(
     '/api/movies/tmdb/topRated',{headers: {
       'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());
};
~~~

~~~Javascript
export const getPopularMovies = () => {
  return fetch(
     '/api/movies/tmdb/popular',{headers: {
       'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());
};
~~~

~~~Javascript
export const getPersons = () => {
  return fetch(
     '/api/actors',{headers: {
       'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());
};
~~~

~~~Javascript
export const getTvs = () => {
  return fetch(
     '/api/tvs',{headers: {
       'Authorization': window.localStorage.getItem('token')
    }
  }
  ).then(res => res.json());
};
~~~







