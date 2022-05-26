
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

Due to the large size of `countries.json`, the following command needs to be run to allocate more memory (3GB) to Angular for building:
```
$ export NODE_OPTIONS="--max-old-space-size=3072"
```

## TODO / Look into:

1. Have 2 "Toggle Names" buttons:
- One for toggling completed names on/off while guessing
  - (already implemented)
- One for toggling guessed/unguessed names after give up
  - After giving up, user may only want to see remaining names, not all names

2. Is there a better way to toggle name/marker icons instead of creating/deleting the icon every time it is toggled on/off?
  - The add name/marker funtion **creates and adds** the icon to the map each time
  - The remove name/marker funtion **removes** the icon from the map each time
    - Couldn't assign the icon object as an attribute of the countries JSON array
