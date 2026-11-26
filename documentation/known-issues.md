# Known Issues and Incomplete Features

1. Data lives only in one browser's localStorage (about 5 MB). There is no sharing, backup or security.
2. With two tabs open, the last save wins. Stock rules are rechecked at every save, but the other tab's screens do not refresh until reloaded.
3. The Dashboard and reports calculate when opened; they do not update live while already open.
4. Testing was manual (see test-cases.md). There are no automated tests.
5. A wrong transaction cannot be edited or deleted (by design); it is corrected with a new adjustment.
6. The Categories and Suppliers lists have no pagination or search (small lists).
7. The app is designed for desktop and tablet widths, not small phone screens.
8. The Dashboard chart shows stock by category only.
9. The production bundle is about 1 MB (one JavaScript file) because MUI and Recharts are bundled together; code splitting was not implemented, and Vite shows a size warning during build.
10. There is no React error boundary, so an unexpected rendering error would show a blank page. Expected problems (corrupted data, missing records) are handled with messages.
11. Sample data dates are generated relative to the first run, so "Today's Transactions" includes one sample adjustment on the day the sample data was loaded.

(Add any real defects found during testing here, with steps to reproduce.)