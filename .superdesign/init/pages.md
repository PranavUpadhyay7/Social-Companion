# Page Dependency Trees

## `/` — Landing Page

Entry: `app/page.js`

- `components/home/Front.js`
- `components/home/CrazyEvents.js`
  - `components/home/EventProps.js`
  - `data/homeEvents.js`
- `components/effects/SideRays.js`

## `/events` — Events Page

Entry: `app/events/page.js`

- `components/events/EventNavbar.js`
- `components/events/FeaturedEvent.js`
- `components/events/CategoryNav.js`
- `components/events/EventGrid.js`
  - `components/events/EventCard.js`
- `components/events/FilterDrawer.js`
- `components/effects/SideRays.js`
- `data/events.js`

## `/clubbers` — Clubbers Page

Entry: `app/clubbers/page.js`

- `components/clubbers/FirstDiv.js`

## `/settingsu` — Settings Page

Entry: `app/settingsu/page.js`

- `components/settings/EditProfile.js`

