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
A grouping of an Account's Cities by the nation they sit in, shown with its flag. Derived from Cities; never created directly.

**Memory**:
One photo attached to a City. A City has zero to five Memories; a Memory has no text of its own.
_Avoid_: Image, picture, snapshot, memory snapshot, upload

**Position**:
The latitude and longitude where a City sits on the map.
_Avoid_: Coordinates, location, lat/lng

## Map

**Map view** / **List view**:
On a phone the app shows one at a time: the map, or the sidebar content (Cities, Countries, City detail, Add City form). A bottom bar switches between them. On wider screens both are shown side by side.

**Search**:
The box on the map that finds a City the Account already saved, or any place on Earth by name, and flies the map there.
_Avoid_: Filter, lookup, geocoder (implementation detail)
