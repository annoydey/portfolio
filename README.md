V23

Responsive HUD redesign:
- moved floating HUD boxes out of the image-scaled coordinate layer
- UAV-2 and UAV-3 cards dynamically choose a side around the drone and avoid covering it
- Spectrum (Live) now uses viewport/screen-space responsive sizing instead of image scaling
- cards avoid the navbar and screen edges
- desktop, laptop, tablet and mobile rules included
- RF links and blinking lights remain tied to the background image

V22

Added responsive HUD collision-avoidance in JavaScript so Spectrum, UAV-2, UAV-3, Wireless Link, and other floating boxes stay aligned, avoid the header, and remain inside the hero area across screen sizes.

V21

Responsive hero-coordinate system: all RF links, HUD cards, drone blinking lights, mountain tower lights, and ground-station lights now scale/crop with the 1672x941 background image.

V20

Adjusted blinking drone-light positions to sit on the visible drone body / propeller lights.

V19

Moved Spectrum more to the right, moved Wireless Link lower, added blinking drone lights, mountain tower lights, and ground-station lights.

V18

Made Spectrum (Live) box smaller so it does not hide the drone.

V17

Removed black laptop screen overlay/mask.

V16

V15

# Annoy Dey Ph.D. Portfolio — V10

V10 removes the code RF packet overlay and uses a cleaned hero background with the old dashed RF paths visually removed.

The laptop UI is intentionally simplified to four large, sharp panels:
- Spectrum (Live)
- Live Telemetry
- Wireless Link
- Topology

All laptop labels are HTML text and the two graphs are live Canvas animations.

Replace `index.html`, `css/css-style.css`, `js/js-script.js`, and copy `images/hero-command-center-clean-v14.png`.
