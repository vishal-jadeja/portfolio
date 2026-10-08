# Movies & series

The `/movies` page uses `src/data/movies.json`. The home page Personal section and site search link to it.

## Import notes

Imported the user's Movie/Series List Notion export on 2026-10-08: 164 database rows, of which 162 were title entries. The blank row and the “My Watchlist” row (which contained only a Google search link) were omitted. Repeated series seasons/episodes were consolidated into 156 distinct titles. Five titles supplied in the conversation were added, making 161 cards: 158 collection titles and three anticipated films.

The numeric ratings and private review text are deliberately absent from the repository and public data. Labels were derived locally:

- 9 through 10, inclusive: Masterpiece
- 7 through 8.5, inclusive: Go for it
- 6 up to, but excluding, 7: Timepass
- Below 6: Skip
- No rating: null (shown as Not yet rated, or All-time favorite for explicitly supplied favorites)

The user explicitly assigned all eight Harry Potter films to **Go for it**, overriding their originally unrated entries. Exactly 7 belongs to **Go for it** where the requested ranges overlap.

For consolidated series, the latest numbered entry supplies the verdict and ordering. `loggedEntries` records how many original entries the card represents. `order` is the original journal sequence, not a rating. Curated favorites and anticipated titles are supplied by the user, not inferred from external release schedules.

Corrected obvious spelling and expanded franchise shorthand. Ambiguous choices follow the journal context: It (2017), Evil Dead (2013), Drishyam 2 (2022 Hindi), Watchmen (2009), The Karate Kid (1984), Leo (2023 Tamil), Daredevil (2015 series), The Punisher (2017 series). “Avengers Endgame: Encore” is represented by the original Avengers: Endgame title and poster.

## Posters

Posters and title metadata were retrieved from IMDb after explicit user approval. Each record stores its IMDb ID and original poster URL for provenance. The UI links title cards to their IMDb detail pages. Images are stored locally as 480px-wide WebP files under `public/posters/`, so viewing the collection does not make requests to IMDb. Artwork belongs to its respective rights holders.

To add a title, add a unique ID, title, type, optional release year, local poster path, IMDb ID, verdict (or null), journal order, and logged-entry count. Set `favorite`, `current`, or `anticipated` as appropriate. Add all-time favorites to the ordered list in `src/data/movies.ts` as well.
