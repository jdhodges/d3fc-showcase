/*global window */
import BitFlux from './bitflux';

// A query string (?seed=) can be added to the URL
// to seed the random number generator.
// For example: ?seed=yourseed
var seed = window.location.search.split('seed=')[1];
if (seed) {
    Math.seedrandom(seed);
}

var app = BitFlux.app()
    .fetchCoinbaseProducts(true);

app.run('#app-container');

