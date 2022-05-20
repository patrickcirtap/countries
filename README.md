
# Countries of The World Quiz

Type in country names to populate an empty world map.

See how many you can name!

## Development server

The map was build using [Leaflet](https://leafletjs.com/) and GeoJSON.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.2.1.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Dependencies:

```
$ npm install leaflet
$ npm install -D @types/leaflet

$ ng add @angular/material

???
$ npm install --save @angular/material
```

## TODO / Look into:

1. Change hint popup from showing `hint_name` and `capital_city` immediately,\
   to showing "*Click for hint*" message and then displaying individual hints on click.

  - Haven't been able to get this to work because it seems that Leaflet popups are built initially when the map is made, and are then toggled on/off, always displaying the original popup.
  - Even dynamic CSS (on hover) doesn't change the appearance.


2. Have 2 "Toggle Names" buttons:

  - One for toggling completed names on/off while guessing
    - (already implemented)
  - One for toggling guessed/unguessed names after give up
    - After giving up, user may only want to see remaining names, not all names

3. Is there a better way to toggle name/marker icons instead of creating/deleting the icon every time it is toggled on/off?

  - The add name/marker funtion **creates and adds** the icon to the map each time
  - The remove name/marker funtion **removes** the icon from the map each time
    - Couldn't assign the icon object as an attribute of the countries JSON array
