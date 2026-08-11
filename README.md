# Lego Library

A React Native mobile app for managing your personal LEGO collection. Track your boards, sets, and missing/broken parts, discover other collectors, and connect with friends.

---

## Features

### Collection Management
- Organize sets into **boards** (custom collections, nestable)
- Add sets by LEGO set number — set info, parts, and minifigs are fetched automatically
- Track **missing**, **broken**, and **discoloured** parts per set
- Rate sets with a personal 5-star rating
- Upload your own photos per set
- Export missing parts to **CSV** or **Excel** (Excel includes part images embedded in the file)
- Search boards and sets by title or ID
- Move boards between parents
- Share boards with friends (full edit access — they can add/edit sets, mark parts, and manage the board)
- **Paginated lists** — boards and board contents load 10 items per page as you scroll, so large collections stay fast

### Discovery
- Browse public boards and sets from other users on the home feed
- Search the feed by title
- Three view modes: **card**, **list**, and **grid** on all list screens

### Social
- View other users' public profiles and their boards
- Send, accept, and decline friend requests
- Manage your friends list
- **Share boards** with friends (full edit access — shared users can edit board details, move/delete boards, and edit sets like the owner)
- Search friends by name

### Profile
- Custom profile picture (camera or photo library)
- Bio, display name, gender
- Notification preferences (push + email) per event type
- Dark mode toggle
- Change or delete your account

### Authentication
- Email + password registration with email verification (4-digit code)
- JWT-based auth with automatic token refresh
- Forgot / reset password flow

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | Expo ~54 · React Native 0.81 · React 19 |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| UI | Expo Vector Icons · React Native Vector Icons |
| Animation | React Native Reanimated 4 · Lottie |
| Images | Expo Image Picker · Expo Image Manipulator |
| Gestures | React Native Gesture Handler |
| File / Share | Expo File System · Expo Sharing |
| Storage | AsyncStorage |
| Auth | JWT Decode |
| Notifications | Expo Notifications |

---

## Project Structure

```
lego-library/
├── App.js                      # Root navigation (stacks + bottom tabs)
├── styles.js                   # Global StyleSheet
├── config/
│   └── config.js               # API base URL, app metadata
├── screens/
│   ├── auth/                   # Login, registration, password reset, logout
│   ├── activation/             # Email verification
│   ├── home/                   # Public feed (HomeScreen)
│   ├── lego/
│   │   ├── boards/             # BordenScreen, BordScreen, PublicBordScreen
│   │   └── set/                # SetDetailScreen, PublicSetDetailScreen
│   ├── profile/                # ProfileScreen, ProfileEditScreen,
│   │                           # ProfileConfigScreen, ProfilePictureScreen,
│   │                           # PublicProfileScreen
│   └── social/                 # FriendsScreen
├── components/
│   ├── Apicalls.js             # API call helpers
│   ├── BoardImage.js           # Board cover image (auto-compose)
│   ├── Functions.js            # Shared utilities
│   ├── form/                   # FloatingLabelInput
│   ├── modals/                 # AddModal, ShareModal, MoveModal
│   ├── rating/                 # RatingStars
│   └── ui/                     # LoadingSpinner
├── services/
│   └── profileService.js       # Delete confirmation dialog
├── theme/
│   └── ThemeContext.js         # Light/dark theme with persistence
├── utils/
│   ├── authUtils.js            # Token validation & redirect
│   ├── imageUtils.js           # Image selection, resize, upload
│   ├── notificationUtils.js    # Push notification setup
│   ├── passwordUtils.js        # Password validation & generation
│   └── formUtils.js            # OTP input helpers
└── plugins/
    └── withNetworkSecurityConfig.js  # Android cleartext traffic
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio or Xcode (for running on a simulator/device)
- The [Lego Library API](https://github.com/verzeilberg/lego-library-api) running and accessible

### Installation

```bash
git clone <repo-url>
cd lego-library
npm install
```

### Configuration

Edit `config/config.js` and set `API_BASE_URL` to the address of your running API server:

```js
const Config = {
    API_BASE_URL: 'https://<your-api-host>',
};
```

The app connects to the backend at this URL for all data — authentication, sets, boards, profiles, and images.

### Running

```bash
# Start the Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## Backend

The app requires the **Lego Library API** backend. The API handles:
- User accounts and JWT authentication with automatic token refresh
- LEGO set data (synced from Rebrickable)
- Board and set management with nesting and sharing
- Part tracking (missing/broken/discoloured)
- Friend relationships, requests, and notifications
- Profile pictures and set images

Backend source: `/var/www/lego-library-api`

---

## Export

On the **Parts** tab of any set detail screen, tap the download icon to export missing parts:

- **CSV** — plain text file with columns: Part Number, Name, Color, Quantity, Missing, Broken, Discoloured
- **Excel** — `.xls` file with the same columns plus an embedded image of each part (images are downloaded and stored as base64 in the file so it is self-contained)

---

## Suggested Improvements & Future Features

### UX & Navigation

- **Pull-to-refresh** — FriendsScreen already has `RefreshControl`. BordenScreen and BordScreen should too; the current focus-reload is not visible to the user.
- **Better empty states** — most screens show plain "No data available" text. An icon + action button per empty state would feel more polished.
- **Breadcrumb / depth indicator** — show how deep you are in nested boards (e.g. a breadcrumb "Borden › Stad › Huizen" in the header, or a "level 3" badge on board cards) so you don't lose your place when drilling down.

### Collection

- **Set completion progress bar** — show `(total parts − missing) / total parts` as a small bar on each board card. High impact, low effort; the data already exists.
- **Dashboard / stats screen** — total boards, total sets, total parts, total missing, missing percentage. All numbers are already returned by the API.
- **Wishlist / wanted sets** — a board type or flag marking sets as "want to buy". Reuses all existing board/set infrastructure.
- **Set notes** — a free-text personal notes field per set, separate from the Rebrickable description.
- **BrickLink shopping list export** — generate a BrickLink XML/CSV from missing parts that can be imported directly into a BrickLink wanted list. More actionable than the current CSV export for the LEGO community.
- **Barcode / QR scanner** — scan the barcode on a LEGO box to auto-fill the set number when adding to a board (`expo-camera` supports this).

### Social

- **User search / discovery** — there is currently no way to find users to friend unless you already know their profile ID. A search-by-username screen would make the friend system usable.
- **Activity feed** — recent activity from friends (added a board, added a set, completed a set). The data is server-side; it needs an API endpoint and a feed component.
- **Comments on boards** — let users leave comments on a public board. PublicBordScreen already navigates to boards; a comment section below would be a natural fit.

### Parts Tracking

- **Missing parts history** — log when a part was marked missing or broken with a timestamp, to track whether a set is degrading over time.
- **Discolouration note** — when marking a part as discoloured, allow the user to note what colour it has turned (e.g. yellowing).

### Technical & Performance

- **Image caching** — set and part images are fetched fresh every render. Replacing React Native's `Image` with `expo-image` (which has built-in disk caching) would speed up all list screens noticeably.
- **Session expiry feedback** — `tokenService.js` silently fails on token refresh. A redirect to the login screen with a "session expired" message would be more user-friendly than a silent API error.
- **Offline indicator** — a banner (similar to the existing `ErrorBanner`) when the device has no network, replacing confusing "Unknown error" messages.

### Profile

- **Account stats on profile** — a summary row under the profile picture: `12 boards · 87 sets · 3 friends`. Derivable from existing API data.
- **Profile visibility setting** — opt-in public profile instead of fully public by default.

### New Features

- **Set comparison tool** — compare parts lists across two sets to find common or unique pieces.
- **Collection value estimator** — calculate estimated value of your collection based on set part-out prices or Bricklink 6-month average.
- **Set building progress** — mark a set as "in progress" or "completed" with a date, and track how long it took to build.
- **Duplicate detection** — flag when the same LEGO set number appears in multiple boards.
- **Private notes per board** — free-text notes attached to a board (e.g. "gift from grandma", "sold at flea market").
- **Batch add sets** — paste a list of LEGO set numbers at once instead of adding one by one.
- **Part color substitution** — when marking a part as missing, suggest an alternate color you own from another incomplete set.
- **Collection import/export** — export your entire collection (boards + sets) as JSON, and import it on another device.
- **Set instructions PDF link** — store a link to the official LEGO instructions PDF per set.
- **Minifigure collection view** — aggregate all minifigures across all sets into a single browsable list.
- **Theme-based auto-categorization** — automatically group sets by LEGO theme (City, Technic, Star Wars, etc.) using the Rebrickable theme data already returned by the API.
- **Localization / i18n** — Dutch and English locale support; all user-facing strings are currently hardcoded in Dutch. A translation layer would make the app accessible to a wider audience.
- **Widget (Android/iOS)** — home screen widget showing a random set from your collection, or quick-add bar for scanning a barcode.

---

## Build

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) (Expo Application Services).

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

EAS project ID: `9b233da7-d95f-446e-a1fc-211fe39935bb`  
Owner: `vicestar`
