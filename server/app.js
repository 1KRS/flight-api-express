import axios from 'axios';
import express from 'express';
import { DateTime } from "luxon";

const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello Traveller!');
});

app.get('/api/flights', (req, res) => {
  axios
    .get(
      'https://raw.githubusercontent.com/saltstudy/pgp-test-flightFinder-json/main/data.json'
    )
    .then((response) => {
      const flights = response.data;
      console.log(flights);
      res.json(flights);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/api/flight', (req, res) => {

  const from = req.query.from ? req.query.from.toLowerCase() : null;
  const to = req.query.to ? req.query.to.toLowerCase() : null;
  const date = req.query.date ? DateTime.fromISO(req.query.date).toFormat('dd-LL-yyyy') : null;
  const adults = req.query.adults ? parseInt(req.query.adults) : 1;
  const children = req.query.children ? parseInt(req.query.children) : 0;
  const passengers = adults + children;
  const filterBy = req.query.filterBy ? req.query.filterBy.toLowerCase() : null;
  const departureAt = req.query.departureAt ? parseInt(req.query.departureAt) : null;
  const arrivalAt = req.query.arrivalAt ? parseInt(req.query.arrivalAt) : null;
  const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : null;
  const maxDuration = req.query.maxDuration ? parseInt(req.query.maxDuration) : null;
  const oneWay = req.query.oneWay ? req.query.oneWay : true;

  console.log('From:', from)
  console.log('To:', to)
  console.log('Date:', date)
  console.log('Passengers:', `${passengers} (${adults} adults + ${children} children)`)
  console.log('Filter by:', filterBy)
  console.log('Departure at:', departureAt)
  console.log('Arrive at:', arrivalAt)


  if (from === null && to === null) {
    res.send('You must specify departure and arrival locations');    
  } else if (from === null) {
    res.send('You must specify departure location also');
  } else if (to === null) {
    res.send('You must specify destination location also');
  } else if (departureAt && arrivalAt) {
    res.send('Cannot proceed. Both departure and arrival filter time has been chosen.');
  }

  const getFlights = async () => {   
    const response = await axios.get('https://raw.githubusercontent.com/saltstudy/pgp-test-flightFinder-json/main/data.json');
    return response
  }

  if (filterBy === 'price') {
    getFlights()
      .then( (response) => {
        const filteredFlights = response.data
          // All filtered flights based on departure and arrival locations
          .filter( flight => flight.departureDestination.toLowerCase() === from && flight.arrivalDestination.toLowerCase() === to )[0]
          // All itineraries serving this route
          .itineraries
          // Filtered flights based on departure / arrival date
          .filter( flight => date === null ? flight : departureAt ? DateTime.fromISO(flight.departureAt).toFormat('dd-LL-yyyy') === date : DateTime.fromISO(flight.arrivalAt).toFormat('dd-LL-yyyy') === date)
          // Filtered flights based on passengers
          .filter( flight => passengers === 1 ? flight.availableSeats > 0 : flight.availableSeats >= passengers )
          // Filtered flights based on price
          .filter( flight => maxPrice === null ? flight : (flight.prices.adult*adults + flight.prices.child*children) <= maxPrice )
          // Sorted flights base price
          .sort((a, b) => maxPrice ? (a.prices.adult*adults + a.prices.child*children) - (b.prices.adult*adults + b.prices.child*children) : (b.prices.adult*adults + b.prices.child*children) - (a.prices.adult*adults + a.prices.child*children))
          
          console.log('Flights:') 
          const fls = () => filteredFlights.map(flight => console.log(flight));
          fls()
          res.json(filteredFlights)
      })
  } else if (filterBy === 'duration') {
    // res.send('Not yet implemented')
    getFlights()
      .then( (response) => {
        const filteredFlights = response.data
          // All filtered flights based on departure and arrival locations
          .filter( flight => flight.departureDestination.toLowerCase() === from && flight.arrivalDestination.toLowerCase() === to )[0]
          // All itineraries serving this route
          .itineraries
          // Filtered flights based on departure / arrival date
          .filter( flight => date === null ? flight : departureAt ? DateTime.fromISO(flight.departureAt).toFormat('dd-LL-yyyy') === date : DateTime.fromISO(flight.arrivalAt).toFormat('dd-LL-yyyy') === date)
          // Filtered flights based on passengers
          .filter( flight => passengers === 1 ? flight.availableSeats > 0 : flight.availableSeats >= passengers )
          // Filtered flights based on duration
          .filter( flight => maxDuration === null ? flight : (DateTime.fromISO(flight.arrivalAt).diff(DateTime.fromISO(flight.departureAt), ["hours"])).values.hours <= maxDuration)
          // Sorted flights base on departure / arrival times
          .sort((a, b) => departureAt ? DateTime.fromISO(a.departureAt).hour - DateTime.fromISO(b.departureAt).hour : arrivalAt ? DateTime.fromISO(b.arrivalAt).hour - DateTime.fromISO(a.arrivalAt).hour : a === b)
        
          console.log('Flights:') 
          const fls = () => filteredFlights.map(flight => console.log(flight));
          fls()
          res.json(filteredFlights)
      })
      .catch((err) => {console.log(err)});
  } else if (filterBy === 'time') {
    getFlights()
      .then( (response) => {
        const filteredFlights = response.data
          // All filtered flights based on departure and arrival locations
          .filter( flight => flight.departureDestination.toLowerCase() === from && flight.arrivalDestination.toLowerCase() === to )[0]
          // All itineraries serving this route
          .itineraries
          // Filtered flights based on departure / arrival date
          .filter( flight => date === null ? flight : departureAt ? DateTime.fromISO(flight.departureAt).toFormat('dd-LL-yyyy') === date : DateTime.fromISO(flight.arrivalAt).toFormat('dd-LL-yyyy') === date)
          // Filtered flights based on passengers
          .filter( flight => passengers === 1 ? flight.availableSeats > 0 : flight.availableSeats >= passengers )
          // Filtered flights based on departure / arrival times
          .filter( flight => departureAt ? DateTime.fromISO(flight.departureAt).hour - 2 >= departureAt : arrivalAt ? DateTime.fromISO(flight.arrivalAt).hour - 2 <= arrivalAt : flight)
          // Sorted flights base on departure / arrival times
          .sort((a, b) => departureAt ? DateTime.fromISO(a.departureAt).hour - DateTime.fromISO(b.departureAt).hour : arrivalAt ? DateTime.fromISO(b.arrivalAt).hour - DateTime.fromISO(a.arrivalAt).hour : a === b)
          
        console.log('Flights:') 
        const fls = () => filteredFlights.map(flight => console.log(flight));
        fls()
        res.json(filteredFlights)
      })
      .catch((err) => {console.log(err)});
  }
});

app.get('/api/flight/:routeID/:flightID', (req, res) => {

  const flight = axios.get('https://raw.githubusercontent.com/saltstudy/pgp-test-flightFinder-json/main/data.json')
    .then( (response) => {
      const flight = response.data.filter( route => route.route_id === req.params.routeID )[0]
      .itineraries
      .filter( flight => flight.flight_id === req.params.flightID)[0]

      res.json(flight)
    })
    .catch((err) => {console.log(err)});
  })

app.listen(port, () => {
  console.log(`Ο διακομιστής ακούει στην πύλη ${port}`);
});
