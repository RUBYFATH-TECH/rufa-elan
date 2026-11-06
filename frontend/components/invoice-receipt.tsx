'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';

// Helper function to convert image URL to base64
const getBase64FromUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    return '';
  }
};

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  color?: string;
}

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface InvoiceProps {
  orderNumber: string;
  date: Date;
  items: InvoiceItem[];
  customer: CustomerInfo;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'shipped' | 'delivered';
  isPrinting?: boolean;
}

const InvoiceReceipt = React.forwardRef<HTMLDivElement, InvoiceProps>(
  (
    {
      orderNumber,
      date,
      items,
      customer,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      transactionId,
      status,
      isPrinting = false,
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const printRef = ref || contentRef;
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [base64Images, setBase64Images] = useState<Record<string, string>>({});

    // Convert all images to base64 when in printing mode
    useEffect(() => {
      if (isPrinting) {
        const loadImages = async () => {
          console.log('[Invoice] Starting image conversion to base64...');
          const imageMap: Record<string, string> = {};
          
          // Load logo
          console.log('[Invoice] Converting logo...');
          const logoBase64 = await getBase64FromUrl('/images/logo.png');
          if (logoBase64) {
            imageMap['logo'] = logoBase64;
            console.log('[Invoice] ✓ Logo converted successfully');
          }
          
          // Load all product images
          console.log('[Invoice] Converting', items.filter(i => i.image).length, 'product images...');
          for (const item of items) {
            if (item.image) {
              const base64 = await getBase64FromUrl(item.image);
              if (base64) {
                imageMap[item.id] = base64;
                console.log(`[Invoice] ✓ ${item.name} converted`);
              }
            }
          }
          
          console.log('[Invoice] Conversion complete. Total images:', Object.keys(imageMap).length);
          setBase64Images(imageMap);
          setImagesLoaded(true);
        };
        
        loadImages();
      } else {
        setImagesLoaded(true);
      }
    }, [isPrinting, items]);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // PDF-optimized inline styles
    const pdfStyles = isPrinting ? {
      container: {
        width: '190mm', // Reduced from 210mm to account for margins
        maxWidth: '190mm',
        minHeight: '277mm', // A4 height minus margins
        margin: '0 auto',
        padding: '8mm', // Reduced padding
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10px',
        lineHeight: '1.3',
        color: '#1f2937',
        boxSizing: 'border-box' as const
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '2px solid #d1d5db'
      },
      logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      },
      logo: {
        width: '40px',
        height: '40px',
        borderRadius: '5px',
        border: '2px solid #e5e7eb',
        objectFit: 'cover' as const,
        display: 'block'
      },
      invoiceBadge: {
        backgroundColor: '#14b8a6',
        color: '#ffffff',
        padding: '6px 12px',
        borderRadius: '4px',
        textAlign: 'center' as const,
        flexShrink: 0
      },
      sectionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '10px'
      },
      sectionTitle: {
        fontSize: '8px',
        fontWeight: 'bold' as const,
        textTransform: 'uppercase' as const,
        color: '#14b8a6',
        margin: '0 0 4px 0'
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: '10px',
        tableLayout: 'fixed' as const
      },
      tableHeader: {
        backgroundColor: '#14b8a6',
        color: '#ffffff',
        padding: '6px',
        textAlign: 'left' as const,
        fontSize: '9px',
        fontWeight: 'bold' as const
      },
      tableCell: {
        padding: '6px',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '9px',
        verticalAlign: 'top' as const,
        wordWrap: 'break-word' as const
      },
      productImage: {
        width: '40px',
        height: '40px',
        objectFit: 'cover' as const,
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        display: 'block'
      }
    } : {};

    return (
      <div style={{ width: '100%', overflow: 'visible' }}>
        <div
          ref={printRef as React.RefObject<HTMLDivElement>}
          data-invoice-print
          style={isPrinting ? pdfStyles.container : undefined}
          className={isPrinting ? '' : 'w-full bg-white p-4 sm:p-8'}
        >
          {/* HEADER */}
          <div style={isPrinting ? pdfStyles.header : undefined} className={isPrinting ? '' : 'flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b-2 border-gray-300'}>
            <div style={isPrinting ? pdfStyles.logoContainer : undefined} className={isPrinting ? '' : 'flex items-center gap-3'}>
              {isPrinting && base64Images['logo'] ? (
                <img src={base64Images['logo']} alt="RUFA ELAN" style={pdfStyles.logo} />
              ) : !isPrinting ? (
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200">
                  <Image src="/images/logo.png" alt="RUFA ELAN" width={64} height={64} className="w-full h-full object-cover" priority />
                </div>
              ) : null}
              <div>
                <h1 style={isPrinting ? { fontSize: '14px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' } : undefined} className={isPrinting ? '' : 'text-lg sm:text-2xl font-bold text-gray-800'}>
                  RUFA ELAN
                </h1>
                <p style={isPrinting ? { fontSize: '8px', margin: 0, color: '#6b7280' } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-600'}>
                  Premium Fashion &amp; Lifestyle
                </p>
              </div>
            </div>
            <div style={isPrinting ? pdfStyles.invoiceBadge : undefined} className={isPrinting ? '' : 'bg-teal-500 text-white px-4 py-2 rounded'}>
              <p style={isPrinting ? { fontSize: '7px', fontWeight: 'bold', margin: 0, marginBottom: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' } : undefined} className={isPrinting ? '' : 'text-xs font-bold uppercase'}>
                Invoice
              </p>
              <p style={isPrinting ? { fontSize: '11px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' } : undefined} className={isPrinting ? '' : 'text-xl font-bold'}>
                #{orderNumber}
              </p>
            </div>
          </div>

          {/* SUPPLIER / CLIENT */}
          <div style={isPrinting ? pdfStyles.sectionGrid : undefined} className={isPrinting ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6'}>
            <div>
              <p style={isPrinting ? pdfStyles.sectionTitle : undefined} className={isPrinting ? '' : 'text-xs font-bold text-teal-600 uppercase mb-2'}>
                Supplier:
              </p>
              <p style={isPrinting ? { fontSize: '11px', fontWeight: 'bold', color: '#14b8a6', margin: '0 0 2px 0' } : undefined} className={isPrinting ? '' : 'text-lg font-bold text-teal-600'}>
                RUFA ELAN STORE
              </p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>Premium Fashion Hub</p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>Accra, Ghana</p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>+233 501 234 567</p>
              <p style={isPrinting ? { fontSize: '7px', margin: 0, color: '#6b7280' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>hello@rufaelan.com</p>
              <p style={isPrinting ? { fontSize: '7px', margin: 0, color: '#6b7280' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>VAT No: GH-0000000000</p>
            </div>
            <div>
              <p style={isPrinting ? { ...pdfStyles.sectionTitle, color: '#374151' } : undefined} className={isPrinting ? '' : 'text-xs font-bold text-gray-700 uppercase mb-2'}>
                Client:
              </p>
              <p style={isPrinting ? { fontSize: '11px', fontWeight: 'bold', margin: '0 0 2px 0' } : undefined} className={isPrinting ? '' : 'text-lg font-bold text-gray-800'}>
                {customer.firstName} {customer.lastName}
              </p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>{customer.phone}</p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>{customer.address}</p>
              <p style={isPrinting ? { fontSize: '8px', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm text-gray-700'}>{customer.city}</p>
              <p style={isPrinting ? { fontSize: '7px', margin: 0, color: '#6b7280' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>{customer.email}</p>
              <p style={isPrinting ? { fontSize: '7px', margin: 0, color: '#6b7280' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>Ref: {customer.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* PAYMENT INFO */}
          <div style={isPrinting ? { display: 'flex', gap: '12px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #d1d5db', flexWrap: 'wrap' } : undefined} className={isPrinting ? '' : 'flex flex-wrap gap-6 mb-6 pb-5 border-b'}>
            <div>
              <p style={isPrinting ? { fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', margin: 0, marginBottom: '2px' } : undefined} className={isPrinting ? '' : 'text-xs font-bold text-gray-600 uppercase'}>
                Payment Method:
              </p>
              <p style={isPrinting ? { fontSize: '8px', fontWeight: '600', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                {paymentMethod || 'Paystack'}
              </p>
            </div>
            <div>
              <p style={isPrinting ? { fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', margin: 0, marginBottom: '2px' } : undefined} className={isPrinting ? '' : 'text-xs font-bold text-gray-600 uppercase'}>
                Order Number:
              </p>
              <p style={isPrinting ? { fontSize: '8px', fontWeight: '600', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                {orderNumber}
              </p>
            </div>
            <div>
              <p style={isPrinting ? { fontSize: '7px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', margin: 0, marginBottom: '2px' } : undefined} className={isPrinting ? '' : 'text-xs font-bold text-gray-600 uppercase'}>
                Issue Date:
              </p>
              <p style={isPrinting ? { fontSize: '8px', fontWeight: '600', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                {formattedDate}
              </p>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table style={isPrinting ? pdfStyles.table : undefined} className={isPrinting ? '' : 'w-full mb-6'}>
            <thead>
              <tr>
                <th style={isPrinting ? pdfStyles.tableHeader : undefined} className={isPrinting ? '' : 'bg-teal-500 text-white px-3 py-2 text-left text-sm font-bold'}>
                  ITEM DESCRIPTION
                </th>
                <th style={isPrinting ? { ...pdfStyles.tableHeader, textAlign: 'center', width: '60px' } : undefined} className={isPrinting ? '' : 'bg-teal-500 text-white px-2 py-2 text-center text-sm font-bold w-20'}>
                  PRICE
                </th>
                <th style={isPrinting ? { ...pdfStyles.tableHeader, textAlign: 'center', width: '40px' } : undefined} className={isPrinting ? '' : 'bg-teal-500 text-white px-2 py-2 text-center text-sm font-bold w-16'}>
                  QTY
                </th>
                <th style={isPrinting ? { ...pdfStyles.tableHeader, textAlign: 'right', width: '60px' } : undefined} className={isPrinting ? '' : 'bg-teal-500 text-white px-3 py-2 text-right text-sm font-bold w-20'}>
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} style={isPrinting ? { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' } : undefined} className={isPrinting ? '' : `${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td style={isPrinting ? pdfStyles.tableCell : undefined} className={isPrinting ? '' : 'px-3 py-3 border-b'}>
                    <div style={isPrinting ? { display: 'flex', gap: '8px', alignItems: 'flex-start' } : undefined} className={isPrinting ? '' : 'flex gap-3 items-start'}>
                      {item.image && (
                        <>
                          {isPrinting && base64Images[item.id] ? (
                            <img src={base64Images[item.id]} alt={item.name} style={pdfStyles.productImage} />
                          ) : !isPrinting ? (
                            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded border">
                              <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                            </div>
                          ) : null}
                        </>
                      )}
                      <div style={isPrinting ? { flex: 1, minWidth: 0 } : undefined}>
                        <p style={isPrinting ? { fontWeight: '600', margin: 0, fontSize: '9px', wordWrap: 'break-word' } : undefined} className={isPrinting ? '' : 'font-semibold text-sm'}>
                          {item.name}
                        </p>
                        {item.color && (
                          <p style={isPrinting ? { fontSize: '8px', color: '#6b7280', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs text-gray-500'}>
                            Color: {item.color}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={isPrinting ? { ...pdfStyles.tableCell, textAlign: 'center' } : undefined} className={isPrinting ? '' : 'px-2 py-3 text-center border-b'}>
                    <p style={isPrinting ? { fontWeight: '600', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                      GHS {item.price.toFixed(2)}
                    </p>
                  </td>
                  <td style={isPrinting ? { ...pdfStyles.tableCell, textAlign: 'center' } : undefined} className={isPrinting ? '' : 'px-2 py-3 text-center border-b'}>
                    <p style={isPrinting ? { fontWeight: '600', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                      {item.quantity}
                    </p>
                  </td>
                  <td style={isPrinting ? { ...pdfStyles.tableCell, textAlign: 'right' } : undefined} className={isPrinting ? '' : 'px-3 py-3 text-right border-b'}>
                    <p style={isPrinting ? { fontWeight: 'bold', margin: 0 } : undefined} className={isPrinting ? '' : 'text-sm font-bold'}>
                      GHS {item.total.toFixed(2)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* NOTES / TOTALS */}
          <div style={isPrinting ? pdfStyles.sectionGrid : undefined} className={isPrinting ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
            <div>
              <h4 style={isPrinting ? { fontWeight: 'bold', fontSize: '9px', margin: 0, marginBottom: '4px' } : undefined} className={isPrinting ? '' : 'font-bold text-sm mb-2'}>
                Notes:
              </h4>
              <p style={isPrinting ? { fontSize: '7px', lineHeight: '1.3', color: '#6b7280', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600 leading-relaxed'}>
                Thank you for your business! Your order will be carefully packaged and shipped soon. Returns accepted within 30 days of delivery in original condition. For inquiries, contact hello@rufaelan.com
              </p>
            </div>
            <div>
              <div style={isPrinting ? { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } : undefined} className={isPrinting ? '' : 'flex justify-between mb-2'}>
                <span style={isPrinting ? { fontSize: '8px' } : undefined} className={isPrinting ? '' : 'text-sm'}>Subtotal:</span>
                <span style={isPrinting ? { fontSize: '8px', fontWeight: '600' } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                  GHS {subtotal.toFixed(2)}
                </span>
              </div>
              <div style={isPrinting ? { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } : undefined} className={isPrinting ? '' : 'flex justify-between mb-2'}>
                <span style={isPrinting ? { fontSize: '8px' } : undefined} className={isPrinting ? '' : 'text-sm'}>Shipping fee:</span>
                <span style={isPrinting ? { fontSize: '8px', fontWeight: '600' } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                  GHS {shipping.toFixed(2)}
                </span>
              </div>
              <div style={isPrinting ? { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } : undefined} className={isPrinting ? '' : 'flex justify-between mb-2'}>
                <span style={isPrinting ? { fontSize: '8px' } : undefined} className={isPrinting ? '' : 'text-sm'}>Discount:</span>
                <span style={isPrinting ? { fontSize: '8px', fontWeight: '600' } : undefined} className={isPrinting ? '' : 'text-sm font-semibold'}>
                  GHS 0.00
                </span>
              </div>
              <div style={isPrinting ? { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db', paddingTop: '5px', paddingBottom: '5px', marginTop: '4px' } : undefined} className={isPrinting ? '' : 'flex justify-between border-t border-b py-2 mt-2'}>
                <span style={isPrinting ? { fontSize: '10px', fontWeight: 'bold' } : undefined} className={isPrinting ? '' : 'text-base font-bold'}>Total:</span>
                <span style={isPrinting ? { fontSize: '12px', fontWeight: 'bold' } : undefined} className={isPrinting ? '' : 'text-lg font-bold'}>
                  GHS {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={isPrinting ? { marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #d1d5db', textAlign: 'center', fontSize: '7px', color: '#6b7280' } : undefined} className={isPrinting ? '' : 'mt-6 pt-5 border-t text-center text-xs text-gray-600'}>
            <p style={isPrinting ? { margin: 0, marginBottom: '2px' } : undefined}>View this invoice online at https://www.rufaelan.com/</p>
            <p style={isPrinting ? { margin: 0 } : undefined}>📱 +233 501 234 567 • 📧 hello@rufaelan.com • 🌐 www.rufaelan.com</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceReceipt.displayName = 'InvoiceReceipt';

export default InvoiceReceipt;
