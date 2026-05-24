import './globals.css';

export const metadata = {
  title: 'astro — lab notebook',
  description: 'Personal astrology lab notebook. Pattern-tracking heritage, not energy mysticism.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
