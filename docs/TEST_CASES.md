# SurPlace Defensive Edge-Case Test Cases

Status legend:
- Passed by inspection: Code path was inspected and already handles the case.
- Fixed: A crash or invalid-data risk was found and patched in this pass.
- Static check passed: Covered by `node --check` or TypeScript compilation.
- Manual test required: Requires device permissions, real network state, Cloudinary, MongoDB outage, or seeded runtime data.

| Module | Scenario | Input/action | Expected result | Status |
| --- | --- | --- | --- | --- |
| Auth validation | Empty full name | Register with blank full name | 400 or inline validation error, no account created | Passed by inspection |
| Auth validation | Full name only numbers | `12345` | 400 or inline validation error | Passed by inspection |
| Auth validation | Full name one character | `A` | 400 or inline validation error | Passed by inspection |
| Auth validation | Empty email | Register/login with blank email | 400 or inline validation error | Passed by inspection |
| Auth validation | Invalid email | `test`, `test@`, `@gmail.com` | 400 or inline validation error | Passed by inspection |
| Auth validation | Duplicate email registration | Register same normalized email twice | 409 with duplicate-account message | Passed by inspection |
| Auth validation | Empty password | Register/login with blank password | 400 or inline validation error | Passed by inspection |
| Auth validation | Password below 4 characters | `a1b` | 400 or inline validation error | Passed by inspection |
| Auth validation | Password with no number | `abcd` | 400 or inline validation error | Passed by inspection |
| Auth validation | Password with no letter | `1234` | 400 or inline validation error | Passed by inspection |
| Auth validation | Wrong login password | Existing email with wrong password | 401 invalid credentials | Passed by inspection |
| Auth validation | Login with non-existing email | Unknown normalized email | 401 invalid credentials | Passed by inspection |
| Auth validation | Email with uppercase letters/spaces | ` User@Email.com ` | Trimmed and lowercased before lookup/create | Passed by inspection |
| Review creation | Submit without media | Press submit before camera capture | Inline error, no upload or API call | Passed by inspection |
| Review creation | Submit without comment | Media, rating, blank comment | Review can submit with empty comment | Passed by inspection |
| Review creation | Submit with comment only spaces | Media, rating, whitespace comment | Review can submit; comment remains harmless text | Passed by inspection |
| Review creation | Rating missing | API body missing rating | 400 `rating must be between 1 and 5` | Passed by inspection |
| Review creation | Invalid rating 0 | API body rating `0` | 400 | Passed by inspection |
| Review creation | Invalid rating 6 | API body rating `6` | 400 | Passed by inspection |
| Review creation | Invalid negative rating | API body rating `-1` | 400 | Passed by inspection |
| Review creation | Submit image review | Capture image, upload, submit | Cloudinary upload then 201 review | Manual test required |
| Review creation | Submit video review | Capture video, upload, submit | Cloudinary upload then 201 review | Manual test required |
| Review creation | Cancel camera | Open camera then cancel/back | Draft remains safe, no submit | Manual test required |
| Review creation | Deny camera permission | Deny camera access | Permission error, no crash | Manual test required |
| Review creation | Deny microphone permission for video | Deny microphone during video capture | Permission error, no crash | Manual test required |
| Review creation | Deny location permission | Deny location prompt | Demo mode can continue; strict mode backend blocks missing location | Manual test required |
| Review creation | Location unavailable | Location request times out/fails | Submit continues without coordinates unless strict backend blocks | Manual test required |
| Review creation | Cloudinary upload timeout/failure | Invalid network or delayed upload | User-facing upload error, no API review created | Manual test required |
| Review creation | Backend unavailable during submit | Stop API before submit | User-facing request error, no crash | Manual test required |
| Review creation | Submit twice quickly | Press submit repeatedly | Button disabled while submitting | Passed by inspection |
| Review creation | Navigate back during upload | Back during media upload | Should not crash; needs device verification | Manual test required |
| Review creation | Malformed media payload | API `media` is not an array | 400 instead of server crash | Fixed |
| Location verification | Demo mode allows review | `ENFORCE_LOCATION_VERIFICATION=false` and no coordinates | Review can be created when media/rating valid | Passed by inspection |
| Location verification | Strict mode blocks missing location | `ENFORCE_LOCATION_VERIFICATION=true` and no coordinates | 403 location required | Passed by inspection |
| Location verification | Strict mode blocks far-away user | Coordinates outside radius | 403 near-restaurant required | Passed by inspection |
| Location verification | Strict mode allows near restaurant | Coordinates within radius | 201 review | Manual test required |
| Location verification | Restaurant has no coordinates | Review submitted with malformed legacy restaurant location | 400 instead of crash | Fixed |
| Location verification | Plate review uses parent restaurant coordinates | Plate review with restaurant coordinates | Distance checked against parent restaurant | Passed by inspection |
| Feed and details | Empty feed | No reviews in DB | Empty state | Passed by inspection |
| Feed and details | Review with missing media | Review has empty media array | Fallback media text, no crash | Passed by inspection |
| Feed and details | Review with broken media URL | Invalid image/video URL | Media fallback after load error | Passed by inspection |
| Feed and details | Review with image media | Feed item image media | Image preview renders | Manual test required |
| Feed and details | Review with video media | Feed item video media | Video preview renders | Manual test required |
| Feed and details | Like review once | Tap like once | 201 and updated likes count | Passed by inspection |
| Feed and details | Tap like multiple times quickly | Rapid repeated taps | Duplicate request prevented client-side; backend duplicate remains 409 | Fixed |
| Feed and details | Open restaurant details from feed | Tap restaurant details | Navigates when restaurant reference exists | Passed by inspection |
| Feed and details | Open plate details from feed | Tap plate details | Navigates when plate and restaurant references exist | Passed by inspection |
| Feed and details | Deleted plate referenced by old review | Populated plate is null | Feed hides plate link and remains safe | Passed by inspection |
| Feed and details | Deleted restaurant referenced by old review | Populated restaurant is null | Feed disables details navigation and remains safe | Passed by inspection |
| Feed and details | Deleted restaurant for plate details | Plate exists but parent restaurant is deleted | 404 instead of server crash | Fixed |
| Manager dashboard | Manager with restaurant | Manager has managed restaurant | Dashboard metrics, reviews, plates load | Passed by inspection |
| Manager dashboard | Manager without restaurant | Manager has no restaurant | Empty dashboard data instead of crash | Passed by inspection |
| Manager dashboard | No plates | Managed restaurant has zero plates | Empty plates count/list | Passed by inspection |
| Manager dashboard | No reviews | Managed restaurant has zero reviews | Empty review list and 0 average | Passed by inspection |
| Manager dashboard | Filter all/restaurant/plate | Change dashboard filter | Client-side filtered list | Passed by inspection |
| Manager dashboard | Sort newest/highest/lowest | Change sort option | Client-side sorted list | Passed by inspection |
| Manager dashboard | Very long restaurant name | Seed long name | Text should wrap/truncate without crash | Manual test required |
| Manager dashboard | Very long review comment | Seed long comment | Text should render without crash | Manual test required |
| Manager restaurant | Empty restaurant name | Save blank name | 400 `name is required` | Passed by inspection |
| Manager restaurant | Empty address | Save blank or spaces-only address | 400 instead of invalid restaurant | Fixed |
| Manager restaurant | Invalid image URL | Save non-URL cover string | Preview fallback if render fails; API currently accepts string | Manual test required |
| Manager restaurant | Choose gallery image | Pick image from library | Upload and preview | Manual test required |
| Manager restaurant | Take camera image | Capture cover image | Upload and preview | Manual test required |
| Manager restaurant | Deny camera permission | Deny camera | Alert, no crash | Manual test required |
| Manager restaurant | Deny gallery permission | Deny media library | Alert, no crash | Manual test required |
| Manager restaurant | Location permission denied | Deny location | Message shown, save still requires coordinates | Manual test required |
| Manager restaurant | Location permission granted | Grant location | Coordinates stored and address may fill | Manual test required |
| Manager restaurant | Reverse geocode fails | Location works, reverse geocode throws | Coordinates still selected, no crash | Passed by inspection |
| Manager restaurant | Backend unavailable during save | Stop API then save | Request error, no crash | Manual test required |
| Manager plates | Add plate with empty name | Save blank name | 400 `name is required` | Passed by inspection |
| Manager plates | Add plate with empty description | Save blank description | Allowed as empty description | Passed by inspection |
| Manager plates | Add plate with negative price | `-1` | 400 non-negative price | Fixed |
| Manager plates | Add plate with non-numeric price | `abc` in mobile field | Client blocks before submit; backend also rejects non-number/non-finite values | Fixed |
| Manager plates | Add plate with huge price | Very large finite number | Accepted if non-negative and finite | Manual test required |
| Manager plates | Add plate without image | Blank image URL | Allowed, fallback preview | Passed by inspection |
| Manager plates | Edit plate | Load plate, update fields | Updated plate returned | Passed by inspection |
| Manager plates | Delete plate | Delete owned plate | Success response and local removal | Passed by inspection |
| Manager plates | Delete plate then reload | Delete then refetch list | Deleted plate absent | Manual test required |
| Manager plates | Delete plate with existing reviews | Delete plate referenced by reviews | Old reviews remain; feed/detail guard prevents crashes | Manual test required |
| Manager plates | Deny image permissions | Deny camera/gallery | Alert, no crash | Manual test required |
| API/backend robustness | Invalid MongoDB ObjectId | Bad route/query id | 400 instead of CastError/500 | Fixed |
| API/backend robustness | Missing JWT | Protected route without bearer token | 401 authentication required | Passed by inspection |
| API/backend robustness | Invalid JWT | Protected route with malformed token | 401 invalid token instead of 500 | Fixed |
| API/backend robustness | Expired JWT if supported | Expired signed token | 401 token expired | Fixed |
| API/backend robustness | User accessing manager endpoints | User token on `/manager/*` | 403 access denied | Passed by inspection |
| API/backend robustness | Manager deleting another manager's plate | Delete plate id outside managed restaurant | 404 for this manager | Passed by inspection |
| API/backend robustness | Duplicate likes | Same user likes same review twice | 409 duplicate like | Passed by inspection |
| API/backend robustness | Malformed JSON body | Invalid JSON request body | 400 malformed JSON instead of 500 | Fixed |
| API/backend robustness | Missing required fields | Omit required API fields | 400 validation errors | Passed by inspection |
| API/backend robustness | Very long strings | Overlong comments/names/descriptions | Review comment capped by schema; broader string limits need product decision | Manual test required |
| API/backend robustness | Negative price | Manager plate price `-1` | 400 | Fixed |
| API/backend robustness | Invalid rating | Rating outside 1-5 | 400 | Passed by inspection |
| API/backend robustness | Missing restaurant/plate id | Missing review restaurant or bad plate id | 400 or 404 | Fixed |
| API/backend robustness | Database unavailable | Stop MongoDB during request | Should return error response, needs runtime test | Manual test required |
| Network and runtime | Backend offline | Mobile app with API stopped | User-facing request error, no crash | Manual test required |
| Network and runtime | Phone not on same Wi-Fi | Device cannot reach API host | Request timeout/error, no crash | Manual test required |
| Network and runtime | Wrong `EXPO_PUBLIC_API_URL` | Point mobile at bad host | Request timeout/error, no crash | Manual test required |
| Network and runtime | Slow network | Throttle API or uploads | Request/upload timeout messages | Manual test required |
| Network and runtime | Cloudinary invalid preset | Bad upload preset | Upload failure message | Manual test required |
| Network and runtime | Cloudinary invalid cloud name | Bad cloud name | Upload failure message | Manual test required |
| Network and runtime | Expo permissions denied | Deny camera/gallery/location/mic | Permission messages, no crash | Manual test required |
| Static checks | API JavaScript syntax | `node --check` over `apps/api/src/**/*.js` equivalent | No syntax errors | Static check passed |
| Static checks | Mobile TypeScript | `npm.cmd --workspace apps/mobile run typecheck` | No type errors | Static check passed |
