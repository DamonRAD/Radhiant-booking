# Radhiant Diagnostic Imaging - Mobile Health Van Booking System

A modern, responsive booking system for mobile health van appointments across South Africa. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-step booking process** with location, service, date/time, and patient details
- **South African provinces and towns** data with van availability
- **Comprehensive medical aid integration** supporting major SA schemes
- **Mobile-responsive design** optimized for all devices
- **Real-time availability** checking and slot booking
- **Professional UI/UX** with clean, accessible design

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **date-fns** for date manipulation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/radhiant-booking.git
cd radhiant-booking
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

### Environment Variables

For production deployment, you may need to set up environment variables for:
- Database connections
- Email services
- SMS notifications
- Payment processing

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── booking-page.tsx    # Main booking component
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
├── public/
│   └── images/             # Static assets
└── lib/
    └── utils.ts            # Utility functions
\`\`\`

## Features Overview

### Step 1: Location & Service Selection
- Province and town selection
- Van availability checking
- Service type selection (Mammogram, etc.)

### Step 2: Date & Time Selection
- Calendar with available dates
- Time slot selection in 15-minute increments
- Real-time availability updates

### Step 3: Special Requirements
- Accessibility options
- Medical requirements
- Referring doctor information

### Step 4: Patient Details
- Personal information
- Emergency contact
- Medical aid information
- Gap cover details

## Customization

### Adding New Services
Update the `serviceTypes` array in `booking-page.tsx`:

\`\`\`typescript
const serviceTypes = [
  {
    id: "mammogram",
    name: "Mammogram",
    duration: 15,
    description: "Specialized breast X-ray screening"
  },
  // Add new services here
]
\`\`\`

### Adding New Locations
Update the `mockVanSchedules` object with new van locations and schedules.

### Styling
The project uses Tailwind CSS with a custom color palette. Modify `tailwind.config.ts` to customize the design system.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact [your-email@domain.com](mailto:your-email@domain.com).
