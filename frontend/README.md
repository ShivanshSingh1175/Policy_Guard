# PolicyGuard Frontend

Flutter web application for PolicyGuard compliance console.

## Tech Stack

- Flutter 3.x (web-first, mobile-friendly)
- Riverpod (state management)
- go_router (routing)
- Dio (HTTP client)
- Material 3 (dark theme)

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── app_theme.dart               # Material 3 dark theme
├── router.dart                  # go_router configuration
├── core/
│   ├── constants.dart           # App-wide constants
│   └── api_client.dart          # Dio HTTP client with mock data
├── features/
│   ├── common/
│   │   ├── presentation/
│   │   │   └── main_shell.dart  # App bar + sidebar navigation
│   │   └── widgets/
│   │       ├── sidebar_nav.dart
│   │       └── filter_bar.dart
│   ├── dashboard/
│   │   ├── presentation/
│   │   │   └── dashboard_screen.dart
│   │   └── widgets/
│   │       └── metric_card.dart
│   ├── policies/
│   │   ├── presentation/
│   │   │   └── policies_screen.dart
│   │   └── widgets/
│   │       ├── policy_list.dart
│   │       └── policy_upload_panel.dart
│   ├── scans/
│   │   └── presentation/
│   │       └── scan_screen.dart
│   ├── violations/
│   │   └── presentation/
│   │       ├── violations_screen.dart
│   │       └── violation_detail_panel.dart
│   └── analytics/
│       └── presentation/
│           └── analytics_screen.dart
└── pubspec.yaml
```

## Setup

1. **Install Flutter**
   - Follow instructions at https://flutter.dev/docs/get-started/install

2. **Install dependencies**
```bash
cd frontend
flutter pub get
```

3. **Run the app**
```bash
flutter run -d chrome
```

The app will open in Chrome at `http://localhost:PORT`

## Features

### Dashboard
- Metric cards showing key statistics
- Placeholder charts (line chart, pie chart)
- Recent violations table

### Policies & Rules
- Two-column layout: policy list + upload panel
- PDF upload functionality (stubbed)
- AI rule extraction (stubbed)
- Rules table

### Scans
- Scan configuration form
- Real-time scan logs
- Scan history table

### Violations
- Filter bar (severity, status, date range)
- Violations data table
- Detail panel for reviewing violations

### Analytics
- Placeholder charts
- Top rules by violations table

## API Integration

The `ApiClient` class in `lib/core/api_client.dart` currently returns mock data. To integrate with the real backend:

1. Update `apiBaseUrl` in `constants.dart` to point to your FastAPI backend
2. Uncomment the actual API calls in `api_client.dart`
3. Remove or comment out the mock data generators

## State Management

Using Riverpod providers:
- `apiClientProvider` - Singleton API client
- `dashboardProvider` - Dashboard summary data
- `policiesProvider` - List of policies
- `rulesProvider` - List of rules
- `scanRunsProvider` - Scan history
- `violationsProvider` - List of violations
- Various `StateProvider`s for UI state

## TODO

- [ ] Implement actual API integration (uncomment in api_client.dart)
- [ ] Add charting library (fl_chart or charts_flutter)
- [ ] Implement DataTable2 for large tables with pagination
- [ ] Add file picker for PDF upload
- [ ] Implement violation detail panel as drawer/modal
- [ ] Add date range picker for filters
- [ ] Implement real-time scan progress updates
- [ ] Add error handling and retry logic
- [ ] Implement authentication
- [ ] Add loading skeletons
- [ ] Responsive design improvements for mobile

## Building for Production

```bash
flutter build web --release
```

Output will be in `build/web/`

## Design Notes

This is a structural skeleton ready for Figma design refinement. The current styling is minimal but functional. After finalizing the design in Figma:

1. Update color palette in `app_theme.dart`
2. Adjust spacing, typography, and component styles
3. Replace placeholder charts with actual chart widgets
4. Refine responsive breakpoints
5. Add animations and transitions
