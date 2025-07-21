# **App Name**: BloodConnect

## Core Features:

- Registration Panel: User registration form with fields for name, mobile number, blood group, state, district, nearby hospital, role (donor/recipient), and terms & conditions.
- Dynamic Location Dropdowns: Dynamically populated dropdowns for state, district, and hospital using a local JSON dataset or fetched from an external API.
- Nearby Users Listing: Display a list of nearby donors or recipients based on selected district and matching/compatible blood group on the 'Nearby Users' page.
- Mobile Number Login: Mocked OTP-based login to verify the phone number.
- Blood Compatibility Analyzer: Blood compatibility logic implemented. 'O-' donors are identified as universal donors, with indication for compatible blood group recipients. Consider this as a tool to correctly match patients with donors.

## Style Guidelines:

- Primary color: Crimson (#DC143C) to represent blood and urgency.
- Background color: Light gray (#F0F0F0) for a clean and calming interface.
- Accent color: Teal (#008080) to highlight key actions and information.
- Body font: 'PT Sans', a humanist sans-serif font that is modern and also friendly.
- Headline font: 'Space Grotesk', a proportional sans-serif font with a scientific and modern vibe.
- Use simple, clear icons from a library like FontAwesome or Material Icons to represent blood types, locations, and user roles.
- Use subtle transition effects to indicate compatibility matching when user select desired blood type during the registration. Animation should focus on positive reinforcement when the donor match has high rate of acceptance