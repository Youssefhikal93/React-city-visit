# WorldVisit

A personal travel journal: a signed-in account pins the cities it has visited on a world map and attaches notes and photos to each one.

## Language

**Account**:
One sign-in identity, named by a unique username and protected by a 4-digit PIN. Owns a set of Cities.
_Avoid_: User, profile, login

**City**:
One visited place an Account has pinned: a name, a Country, a visit date, optional notes, and up to five Memories.
_Avoid_: Pin, marker, place, location, visit

**Country**:
A nation, shown with its flag. A **visited** Country is derived from an Account's Cities and never created directly. Separately, an Account keeps two private lists of any number of Countries:
- **Lived in**: Countries it called home. They count toward the Countries it has been to, with or without a City there, and a lived-in Country with Cities appears as both lived in and visited.
- **Planned**: Countries it wants to visit. They don't count as been to. A planned Country leaves the list automatically when the Account adds a City in it.

On the map a Country is coloured once, with lived in taking precedence over planned, and planned over visited.
_Avoid_: Home Country, destination (for the lists)

**Memory**:
One photo attached to a City. A City has zero to five Memories; a Memory has no text of its own.
_Avoid_: Image, picture, snapshot, memory snapshot, upload

**Position**:
The latitude and longitude where a City sits on the map.
_Avoid_: Coordinates, location, lat/lng

## Map

**Home**:
The signed-in Account's dashboard and where it lands after signing in: its totals (Cities, Countries been to, visits, planned Countries), next destinations, and most recent Cities.
_Avoid_: Landing page (that is the signed-out hero page)

**Map view** / **List view**:
On a phone the app shows one at a time: the map, or the sidebar content (Home, Cities, Countries, City detail, Add City form). A bottom bar switches between Home, Map, Cities, and Countries. On wider screens both are shown side by side.

**Search**:
The box on the map that finds a City the Account already saved, or any place on Earth by name, and flies the map there.
_Avoid_: Filter, lookup, geocoder (implementation detail)
