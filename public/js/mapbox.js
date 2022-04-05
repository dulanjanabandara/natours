/* eslint-disable */



export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZHVsYW5qYW5hYiIsImEiOiJjbDFqM2M0dGwwdHk2M2puMnZ3NHJkY3VzIn0.-vd5HsdrDzPd3O7nRcYHgQ';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dulanjanab/cl1j4f69h007f15mq51k0uyyg',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend the map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
