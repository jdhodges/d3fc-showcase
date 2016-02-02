/*global window */
import BitFlux from './bitflux';

var seed = window.location.search.split('seed=')[1];
if (seed) {
    Math.seedrandom(seed);
}

BitFlux.app()
    .fetchCoinbaseProducts(true)
    .run('#app-container');
