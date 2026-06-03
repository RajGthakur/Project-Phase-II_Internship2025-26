fetch('https://photon.komoot.io/api/?q=Mumbai&limit=5')
  .then(res => res.json())
  .then(data => {
    const suggestions = data.features.map(f => {
        const p = f.properties;
        const parts = [];
        if (p.name) parts.push(p.name);
        if (p.city && p.city !== p.name) parts.push(p.city);
        if (p.state) parts.push(p.state);
        if (p.country) parts.push(p.country);
        const name = parts.join(', ');
        return { display_name: name, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
    });
    console.log(suggestions);
  });
