export const metadata = {
  title: 'RecruitPro API',
  description: 'Backend Auth — Next.js + TypeScript',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
