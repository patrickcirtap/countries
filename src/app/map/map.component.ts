import { Component, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import {MatDialog} from '@angular/material/dialog';
import {GiveupDialogComponent} from './../giveup-dialog/giveup-dialog.component';

import import_countries from './../../assets/countries.json';


// TODO:
// 1: TURN ON: Reload page - alert
// Remove big_ and test_ JSON files


// Re-clicking hint shows console error?

// Default zoom based on current screen size?

// Style popup colour with bec with proper ocean background
// Style give up confirmation dialog with bec



@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit
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
    // markers for unguessed countries
    public toggle_color = "accent";
    public label_position: "before" | "after" = "before";
    public markers_on: boolean = false;
    public names_on: boolean = true;
    public given_up: boolean = false;
    // Debounce delay before checking user input (milliseconds)
    debounce_delay: number = 250;
    // For accessing the HTML buttons
    @ViewChild("entryboxRef") entryboxRef!: ElementRef;
    @ViewChild("giveupRef") giveupRef!: ElementRef;

    constructor(public giveup_dialog: MatDialog) {}

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
            attributionControl: true
        });

        // If map zoomed '+' or '-': re-focus on input box
        var entryboxRef = this.entryboxRef.nativeElement;
        this.map.on('zoom', function()
        {
            entryboxRef.focus();
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

    ngAfterViewInit(): void
    {
        // Focus on input box on load
        this.entryboxRef.nativeElement.focus();

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

    // Convert a country name to a "hint version", where
    // First letter of each word in the name is revealed. Eg:
    // Saint Kitts and Nevis becomes
    // S---- K---- a-- N----
    calc_hint_name(orig_name: string): string
    {
        var hint_name = orig_name[0];

        for(let i = 1; i < orig_name.length; i++)
        {
            // first letter of current word in name
            if(orig_name[i-1] == ' ')
            {
                hint_name = hint_name.concat(orig_name[i]);
            }
            // space in name
            else if(orig_name[i] == ' ')
            {
                hint_name = hint_name.concat(" ");
            }
            // non-first-word letter
            else
            {
                hint_name = hint_name.concat(" - ");
            }
        }

        return hint_name;
    }

    // Determine how wide to make a country's popup,
    // based on the length of it's name or capital city.
    // This is an approximation based on current font size.
    // Could be refined, however, different names with the same length
    // could use slightly different amounts of space due to letter widths; (Eg: i vs. w)
    calc_popup_width(len: number): number
    {
        switch(len)
        {
            case 1: return 130;
            case 2: return 130;
            case 3: return 130;
            case 4: return 130;
            case 5: return 140;
            case 6: return 150;
            case 7: return 150;
            case 8: return 160;
            case 9: return 170;
            case 10: return 180;
            case 11: return 190;
            case 12: return 200;
            case 13: return 210;
            case 14: return 220;
            case 15: return 230;
            case 16: return 230;
            case 17: return 240;
            case 18: return 250;
            case 19: return 260;
            case 20: return 260;
            case 21: return 270;
            case 22: return 280;
            case 23: return 290;
            case 24: return 300;
            case 25: return 310;
            case 26: return 320;
            case 27: return 330;
            case 28: return 330;
            case 29: return 340;
            case 30: return 350;
            case 31: return 350;
            case 32: return 360;
            case 33: return 360;
            case 34: return 370;
            case 35: return 380;
        }

        return 400;
    }

    // when an unguessed country is clicked, show hints in popup
    country_clicked_init = (country: any, layer: any) =>
    {
        // Find which is longer: country name or capital city name
        const max_length = Math.max(country.properties.ADMIN.length, country.properties.capital_city.length);
        // Calculate how wide the popup will be based on the name length
        const popup_width = this.calc_popup_width(max_length);

        // get hint name for country
        const get_hint_name = this.calc_hint_name(country.properties.ADMIN);

        // create final hint templates for the 2 hints
        // note the use of BOTH types of quotes: double ( " ) and single ( ' )
        // to create a string within a string
        const hint_name = "'<i>First letter</i>: <b>" + get_hint_name + "</b>'";
        // Need to remove single quote marks( ' ) from capital city because
        // they mess up the HTML-string template and end the string too early.
        // Country name is fine because countries don't start with ( ' )
        const capital_city = "'<i>Capital city</i>: <b>" + country.properties.capital_city.replace(/'/g, "") + "</b>'";

        // Combine both hint templates to form the full popup HTML template
        const popup_template = '<p>Click for hints:</p>' +
                               '<p onclick="this.innerHTML=' + hint_name    + '"><i>First letter</i>: <b>???</b></p>' +
                               '<p onclick="this.innerHTML=' + capital_city + '"><i>Capital city</i>: <b>???</b></p>';

        layer.bindPopup(popup_template, {
            minWidth: popup_width
        });
    }

    // when a guessed country is clicked, show name and capital city in popup
    country_clicked_final = (country: any, layer: any) =>
    {        
        const country_name = "<p><b>"+country.properties.ADMIN+"</b></p>";
        const capital_city = "<p><i>Capital city</i>: " + "<b>"+country.properties.capital_city+"</b></p>";

        const template = country_name + capital_city;

        layer.bindPopup(template);
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

    // input_received calls the debounce function which won't run check_country()
    // unless the "debounce_delay" amount of time has passed
    input_received = this.debounce(() => this.check_country());

    debounce(fn_to_run: Function): Function
    {
        let timeout: any;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => { fn_to_run.apply(this); }, this.debounce_delay);
        };
    }

    check_country(): void
    {
        // convert entered word to lowercase for comparisons,
        // and remove white space from start/end of entered text
        const curr_country: string = this.curr_country.toLowerCase().trim();

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

                    return;
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

        this.entryboxRef.nativeElement.focus();
    }
    
    add_marker(country: any): void
    {
        var icon = L.icon({
            iconUrl: './../../assets/marker.png',
            iconSize: [28, 45],
            iconAnchor: [13, 40]
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

        this.entryboxRef.nativeElement.focus();
    }

    // Create popup dialog of GiveupDialog component
    open_giveup_dialog(): void
    {
        // Only 1 dialog can be open at a time
        if(this.giveup_dialog.openDialogs.length == 0)
        {
            let giveup_dialog_ref = this.giveup_dialog.open(GiveupDialogComponent, {
                width: "430px",
                height: "200px"
            });

            giveup_dialog_ref.afterClosed().subscribe(
                (result: boolean) => {
                    if(result == true)
                    {
                        this.give_up();
                    }
                    else
                    {
                        this.entryboxRef.nativeElement.focus();
                    }
                }
            );
        }
    }

    // Give up: show remaining un-guessed countries and disable user elements
    give_up(): void
    {
        this.given_up = true;
        this.markers_on = true;

        // add remaining (unguessed) countries
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

        // re-add guessed countries so their borders are above unguessed countries
        for(let i = 0; i < this.countries.length; i++)
        {
            if(this.countries[i].properties.guessed)
            {
                // Style country on map - param: 0 for "guessed-up" style
                this.style_country(this.countries[i], 0);
            }
        }

        this.entryboxRef.nativeElement.disabled = true;
        this.giveupRef.nativeElement.disabled = true;
    }

    // Reset map zoom and re-focus on input box
    reset_zoom(): void
    {
        this.map.setView(this.centroid, this.default_zoom);

        this.entryboxRef.nativeElement.focus();
    }

    // Re-focus on input box if map clicked
    map_clicked(): void
    {
        this.entryboxRef.nativeElement.focus();
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
