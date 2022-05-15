import { Component, OnInit, HostListener } from '@angular/core';
import * as L from 'leaflet';
import import_countries from './../../assets/countries.json';


// TODO:
// 1: TURN ON: Reload page - alert



// Kazakhstan: baikonur cosmodrome

// Style buttons - chrome/firefox

// Delete TEMP country in JSON

// Afghanistan circle country???

// Only english letters in input??


// Style ocean colour with bec

// style stats

// Give up button confirmation


// Show hints AFTER confirmation clicks
// button to toggle names for guessed/unguessed after give_up?
// Perhaps better way to toggle icons instead of create/delete every time???

// Add to GitHub

// Use ViewChild instead of HTML get-element-by-ider

// 3. Look into debounce to optimising type delay checking

// 6. Look into map zooming levels / speed - may be causing weird delays and visuals

// 10. Why divIcon style needs to be in global css? stackoverflow.com/questions/55133973/


@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit
{
    // Map
    public map!: L.Map;
    public map_layer!: any;
    public centroid: L.LatLngExpression = [11, 12];
    public default_zoom: number = 2.85;
    // Countries and guessed countries
    public curr_country: string = "";
    public countries: any = import_countries;
    public num_countries_guessed: number = 0;
    public markers_on: boolean = false;
    public names_on: boolean = true;
    public given_up: boolean = false;

    constructor() { }

    initMap()
    {
        this.map = L.map("map", {
            center: this.centroid,
            zoom: this.default_zoom,
            maxZoom: 9,
            minZoom: 2,
            // Zoom speed / amount
            zoomSnap: 0.1,
            zoomDelta: 0.25,
            wheelPxPerZoomLevel: 100,
            // Can't scroll past [North-east, South-west]
            maxBounds: [[85, 180], [-85, -180]],
            attributionControl: false
        });

        // If map zoomed '+' or '-': re-focus on input box
        this.map.on('zoom', function()
        {
            (<HTMLInputElement>document.getElementById("entry-box")).focus();
        });

        ////////////////////////////////////////////////////////////////////////////
        // Map Tiles - for testing /////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////
        var tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '',
            noWrap: true,
            maxZoom: 8,
            minZoom: 2,
        });
        var toners = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png', {
            attribution: '',
            noWrap: true,
            maxZoom: 8,
            minZoom: 2,
        });
        tiles.addTo(this.map);
        toners.addTo(this.map);
        ////////////////////////////////////////////////////////////////////////////
        // Map Tiles - for testing /////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////

        // add all countries
        this.map_layer = L.geoJSON(this.countries, {
            style: this.country_style_init,
            onEachFeature: this.country_clicked_init
        }).addTo(this.map);
    }

    ngOnInit(): void
    {
        this.initMap();
    }

    // Initial style for all countries
    country_style_init(feature: any)
    {
        return {
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            // Outline / border
            color: '#000000',
            opacity: 1,
            weight: 1
        };
    }
    // New style for a correctly guessed country
    country_style_guessed()
    {
        return {
            fillColor: '#FF6666',
            fillOpacity: 0.7,
            // Outline / border
            color: '#FF0000',
            opacity: 1,
            weight: 2
        };
    }
    // Final style for all remaining un-guessed countries upon give_up
    country_style_final()
    {
        return {
            fillColor: '#8A8A8A',
            fillOpacity: 0.7,
            // Outline / border
            color: '#FFFFFF',
            opacity: 1,
            weight: 1
        };
    }

    // when an unguessed country is clicked, show hints in popup
    country_clicked_init = (country: any, layer: any) =>
    {
        const first_letter = "<i>First letter</i>: " + "<b>"+country.properties.ADMIN[0]+"</b>";
        const capital_city = "<i>Capital city</i>: " + "<b>"+country.properties.capital_city+"</b>";

        layer.bindPopup(first_letter + "<br>" + capital_city);
    }

    // when a guessed country is clicked, show name and capital city in popup
    country_clicked_final = (country: any, layer: any) =>
    {        
        const country_name = "<b>"+country.properties.ADMIN+"</b>";
        const capital_city = "<i>Capital city</i>: " + "<b>"+country.properties.capital_city+"</b>";

        layer.bindPopup(country_name + "<br>" + capital_city);
    }

    // mark country on map by adding new layer and removing old layer.
    // new layer needed so we can bind the popup to allow name popup
    style_country(country: any, style: number): void
    {
        const country_name = country.properties.ADMIN;
        const center_coords = country.properties.center_coords;
        const ISO_A3 = country.properties.ISO_A3;

        var map = this.map;
        var country_style: any;
        // style - 0: country guessed style
        // style - 1: give up style
        if(style == 0)
        {
            country_style = () => this.country_style_guessed();
        }
        else if(style == 1)
        {
            country_style = () => this.country_style_final();
        }

        // Add country name to map
        if(this.names_on)
        {
            this.add_name(country);
        }

        // add new map layer
        L.geoJSON(country, {
            style: country_style,
            onEachFeature: this.country_clicked_final
        }).addTo(this.map);

        // Find initial country layer and remove
        this.map_layer.eachLayer(function (layer: any)
        {
            if(layer.feature.properties.ISO_A3 == ISO_A3)
            {
                map.removeLayer(layer);

                return;
            }
        });
    }

    check_country(): void
    {
        // remove white space from start/end of entered text
        this.curr_country = this.curr_country.trim();
        // convert entered word to lowercase for comparisons
        var curr_country: string = this.curr_country.toLowerCase();

        // for each country
        for (let i = 0; i < this.countries.length; i++)
        {
            // for each name of country
            for (let j = 0; j < this.countries[i].properties.names.length; j++)
            {
                // if country[i] not yet guessed AND
                // curr_country == any of the names in country[i]
                if( (this.countries[i].properties.guessed == false) &&
                    (curr_country == this.countries[i].properties.names[j].toLowerCase()) )
                {
                    this.num_countries_guessed++;
                    this.countries[i].properties.guessed = true;
                    // reset input text box
                    this.curr_country = "";

                    // If newly guessed country had marker on, remove marker
                    if(this.countries[i].properties.marker != null)
                    {
                        this.remove_marker(this.countries[i]);
                    }

                    // Mark country on map - param: 0 for "guessed style"
                    this.style_country(this.countries[i], 0);
                }
            }
        }
    }

    add_name(country: any): void
    {
        var name_icon = L.divIcon({
            className: "country-name",
            html: country.properties.ADMIN,
            iconSize: [200, 0],
        });
        country.properties.name_icon = L.marker(country.properties.center_coords, {icon: name_icon}).addTo(this.map);
    }
    
    remove_name(country: any): void
    {
        this.map.removeLayer(country.properties.name_icon);
    }

    // Toggle country names on/off for guessed countries and re-focus on input box
    toggle_names(): void
    {
        for(let i = 0; i < this.countries.length; i++)
        {
            // given_up needed for being able to switch unguessed country names on/off
            if(this.countries[i].properties.guessed || this.given_up)
            {
                // if names_on: remove names and turn off
                // if names_off: add names and turn on
                this.names_on ? this.remove_name(this.countries[i]) : this.add_name(this.countries[i]);
            }
        }

        this.names_on = !this.names_on;

        (<HTMLInputElement>document.getElementById("entry-box")).focus();
    }
    
    add_marker(country: any): void
    {
        var icon = L.icon({
            iconUrl: './../../assets/marker.png',
            iconSize: [28, 45],
            iconAnchor: [10, 37]
        });
        country.properties.marker = L.marker(country.properties.center_coords, {icon: icon}).addTo(this.map);
    }
    
    remove_marker(country: any): void
    {
        this.map.removeLayer(country.properties.marker);
    }

    // Toggle markers on/off for remaining countries and re-focus on input box
    toggle_markers(): void
    {
        // add markers
        if(this.markers_on == false)
        {
            for(let i = 0; i < this.countries.length; i++)
            {
                if(this.countries[i].properties.guessed == false)
                {
                    this.add_marker(this.countries[i]);
                }
            }
        }

        // else remove markers
        else // this.markers_on == true
        {
            for(let i = 0; i < this.countries.length; i++)
            {
                if(this.countries[i].properties.marker != null)
                {
                    this.remove_marker(this.countries[i]);
                }
            }
        }

        this.markers_on = !this.markers_on;

        (<HTMLInputElement>document.getElementById("entry-box")).focus();
    }

    open_give_up_dialog(): void
    {
        this.give_up();
        
        // if(confirm("Give up - Are you sure?"))
        // {
        //     this.give_up();
        // }
    }

    // Give up: show remaining un-guessed countries and disable user elements
    give_up(): void
    {
        this.given_up = true;
        this.markers_on = true;

        for(let i = 0; i < this.countries.length; i++)
        {
            if(this.countries[i].properties.guessed == false)
            {
                // Add marker to map
                this.add_marker(this.countries[i]);

                // Style country on map - param: 1 for "give-up" style
                this.style_country(this.countries[i], 1);
            }
        }

        (<HTMLInputElement>document.getElementById("entry-box")).disabled = true;
        (<HTMLInputElement>document.getElementById("give-up-button")).disabled = true;
    }

    // Reset map zoom and re-focus on input box
    reset_map_zoom(): void
    {
        this.map.setView(this.centroid, this.default_zoom);

        (<HTMLInputElement>document.getElementById("entry-box")).focus();
    }

    // Re-focus on input box if map clicked
    map_clicked(): void
    {
        (<HTMLInputElement>document.getElementById("entry-box")).focus();
    }

    // Confirmation before user refreshes
    // @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event): void
    // {
    //     let result = confirm("Progress will not be saved.");
    //     if(result)
    //     {
    //         // User chooses to leave page...
    //     }
    //     // Stay on page
    //     event.returnValue = false;
    // }

}
