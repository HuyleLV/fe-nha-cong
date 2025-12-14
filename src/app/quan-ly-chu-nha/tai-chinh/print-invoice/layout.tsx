export const metadata = {
  title: 'In hóa đơn',
};

export default function PrintInvoiceLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout: do not include header/sidebar so the page shows only the invoice content.
  return (
    <html>
      <body style={{ margin: 0, background: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
