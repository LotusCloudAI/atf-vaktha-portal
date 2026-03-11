export const metadata = {
  title: "ATF Vaktha Portal",
  description: "Leadership • Communication • Confidence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}