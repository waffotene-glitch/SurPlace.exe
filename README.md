# SurPlace — Verified Food Review App

SurPlace is a mobile app where users review restaurants and plates using live photo/video capture, with location verification support. Managers can manage restaurants, plates, images, and customer feedback.

## Tech Stack

- Mobile: React Native / Expo
- Backend: Node.js / Express
- Database: MongoDB
- Media: Cloudinary
- Auth: JWT

## Project Structure

- `apps/api` = backend
- `apps/mobile` = mobile app
- `docs` = documentation

## Requirements

- Node.js
- npm
- MongoDB Community Server
- Expo Go
- Git

## Install Dependencies

From the project root:

```powershell
npm install
```

If PowerShell blocks `npm`, use:

```powershell
npm.cmd install
```

## Create Environment Files

Backend file:

`apps/api/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/verified-food-review
JWT_SECRET=local-demo-secret
JWT_EXPIRES_IN=7d
REVIEW_VERIFICATION_RADIUS_METERS=200
ENFORCE_LOCATION_VERIFICATION=false
```

Mobile file:

`apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dqol2c4rp
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=verified_food_upload
EXPO_PUBLIC_ENFORCE_LOCATION_VERIFICATION=false
```

To find your computer IP on Windows:

```powershell
ipconfig
```

Use your IPv4 address.

Important:

- Your phone and computer must be on the same Wi-Fi network.
- Do not use `localhost` or `127.0.0.1` in `apps/mobile/.env`.

## Start MongoDB

Windows:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

## Seed Demo Data

From the project root:

```powershell
npm.cmd --workspace apps/api run seed
```

## Start Backend

From the project root:

```powershell
npm.cmd --workspace apps/api run dev
```

Expected output:

```text
MongoDB connected
API listening on port 5000
```

## Start Mobile

Open a second terminal from the project root:

```powershell
npm.cmd --workspace apps/mobile run start:clear
```

Then scan the QR code with Expo Go.

## Demo Accounts

Manager:

- Email: `manager@verifiedfood.demo`
- Password: `Password123!`

User:

- Email: `alice@verifiedfood.demo`
- Password: `Password123!`

## Important Notes

- User reviews require one live photo or video.
- Gallery is blocked for user reviews.
- Managers can use camera or gallery for restaurant and plate images.
- Location verification exists but is disabled for demo.

To enable strict location checking later:

In `apps/api/.env`:

```env
ENFORCE_LOCATION_VERIFICATION=true
```

In `apps/mobile/.env`:

```env
EXPO_PUBLIC_ENFORCE_LOCATION_VERIFICATION=true
```

## Common Errors

MongoDB connection refused:

- Start the MongoDB service.

Mobile cannot connect:

- Check your IP address.
- Make sure phone and computer are on the same Wi-Fi.
- Make sure the backend is running.
- Check if firewall is blocking port `5000`.

Cloudinary upload fails:

- Check `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Check `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Expo cache issue:

```powershell
npm.cmd --workspace apps/mobile run start:clear
```
