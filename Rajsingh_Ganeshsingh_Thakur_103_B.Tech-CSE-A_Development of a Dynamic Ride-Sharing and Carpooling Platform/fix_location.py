import re

with open('/Users/rajthakur/Desktop/InfoProject 2/frontend/src/components/LocationInput.jsx', 'r') as f:
    content = f.read()

new_fetch = """    const fetchSuggestions = async (query) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            return;
        }
        
        const finalQuery = restrictedCity ? `${query}, ${restrictedCity}` : query;
        
        if (cache.current[finalQuery]) {
            setSuggestions(cache.current[finalQuery]);
            setShowSuggestions(true);
            return;
        }

        try {
            // Using Photon by Komoot for blazing fast autocomplete
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(finalQuery)}&limit=5`);
            const data = await res.json();
            
            const formattedSuggestions = data.features.map(f => {
                const p = f.properties;
                const parts = [];
                if (p.name) parts.push(p.name);
                if (p.city && p.city !== p.name) parts.push(p.city);
                if (p.state) parts.push(p.state);
                if (p.country) parts.push(p.country);
                
                // Deduplicate parts (sometimes city and name are identical but spelled slightly differently)
                const uniqueParts = [...new Set(parts)];
                
                return {
                    display_name: uniqueParts.join(', '),
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0]
                };
            }).filter(s => s.display_name); // remove any empty ones
            
            cache.current[finalQuery] = formattedSuggestions; // store in cache
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Error fetching locations:", err);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val); // Notify parent component of text change

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => fetchSuggestions(val), 200); // reduced to 200ms because Photon is very fast
    };"""

updated_content = re.sub(r'    const fetchSuggestions = async \(query\) => \{.*    \};', new_fetch, content, flags=re.DOTALL)

with open('/Users/rajthakur/Desktop/InfoProject 2/frontend/src/components/LocationInput.jsx', 'w') as f:
    f.write(updated_content)

print("success")
