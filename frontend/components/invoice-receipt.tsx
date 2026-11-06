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
            console.log('[Invoice] ✓ Logo converted successfully (', logoBase64.length, 'characters)');
          } else {
            console.error('[Invoice] ✗ Logo conversion failed');
          }
          
          // Load all product images
          console.log('[Invoice] Converting', items.filter(i => i.image).length, 'product images...');
          for (const item of items) {
            if (item.image) {
              console.log(`[Invoice] Converting image for: ${item.name}`);
              const base64 = await getBase64FromUrl(item.image);
              if (base64) {
                imageMap[item.id] = base64;
                console.log(`[Invoice] ✓ ${item.name} converted (${base64.length} characters)`);
              } else {
                console.error(`[Invoice] ✗ ${item.name} conversion failed`);
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

    const handlePrint = useReactToPrint({
      contentRef: printRef as React.RefObject<HTMLDivElement>,
      documentTitle: `Invoice-${orderNumber}`,
    });

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="w-full overflow-x-hidden">
        <div
          ref={printRef as React.RefObject<HTMLDivElement>}
          data-invoice-print
          style={{ 
            width: isPrinting ? '210mm' : '100%',
            maxWidth: isPrinting ? '210mm' : '100%',
            padding: isPrinting ? '10mm' : undefined,
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, sans-serif'
          }}
          className={isPrinting ? '' : 'w-full bg-white p-4 sm:p-8'}
        >
          {/* ── HEADER ── */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: isPrinting ? '20px' : undefined,
              paddingBottom: isPrinting ? '15px' : undefined,
              borderBottom: '2px solid #d1d5db'
            }}
            className={isPrinting ? '' : 'flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b-2 border-gray-300'}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isPrinting ? '12px' : undefined
              }}
              className={isPrinting ? '' : 'flex items-center gap-3 min-w-0'}
            >
              <div 
                style={{
                  width: isPrinting ? '60px' : undefined,
                  height: isPrinting ? '60px' : undefined,
                  flexShrink: 0,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
                className={isPrinting ? '' : 'w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200'}
              >
                {isPrinting && base64Images['logo'] ? (
                  <img
                    src={base64Images['logo']}
                    alt="RUFA ELAN Logo"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Image
                    src="/images/logo.png"
                    alt="RUFA ELAN Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    priority
                  />
                )}
              </div>
              <div style={{ minWidth: 0 }} className={isPrinting ? '' : 'min-w-0'}>
                <h1 
                  style={{
                    fontSize: isPrinting ? '22px' : undefined,
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  className={isPrinting ? '' : 'text-lg sm:text-2xl font-bold text-gray-800 truncate'}
                >
                  RUFA ELAN
                </h1>
                <p 
                  style={{
                    fontSize: isPrinting ? '12px' : undefined,
                    color: '#4b5563',
                    margin: 0
                  }}
                  className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-600'}
                >
                  Premium Fashion &amp; Lifestyle
                </p>
              </div>
            </div>
            <div 
              style={{
                backgroundColor: '#14b8a6',
                color: '#ffffff',
                padding: isPrinting ? '10px 20px' : undefined,
                borderRadius: '6px',
                flexShrink: 0
              }}
              className={isPrinting ? '' : 'bg-teal-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded flex-shrink-0'}
            >
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold uppercase tracking-wider'}
              >
                Invoice
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '18px' : undefined,
                  fontWeight: 'bold',
                  margin: 0,
                  marginTop: '4px'
                }}
                className={isPrinting ? '' : 'text-base sm:text-xl font-bold'}
              >
                #{orderNumber}
              </p>
            </div>
          </div>

          {/* ── SUPPLIER / CLIENT ── */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isPrinting ? '1fr 1fr' : undefined,
              gap: isPrinting ? '20px' : undefined,
              marginBottom: isPrinting ? '20px' : undefined
            }}
            className={isPrinting ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6'}
          >
            <div>
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  color: '#14b8a6',
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: '8px'
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold text-teal-600 uppercase mb-2'}
              >
                Supplier:
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '16px' : undefined,
                  fontWeight: 'bold',
                  color: '#14b8a6',
                  margin: 0,
                  marginBottom: '4px'
                }}
                className={isPrinting ? '' : 'text-base sm:text-lg font-bold text-teal-600 mb-1'}
              >
                RUFA ELAN STORE
              </p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>Premium Fashion Hub</p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>Accra, Ghana</p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>+233 501 234 567</p>
              <p style={isPrinting ? { fontSize: '11px', color: '#4b5563', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>hello@rufaelan.com</p>
              <p style={isPrinting ? { fontSize: '11px', color: '#4b5563', margin: 0, marginTop: '4px' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600 mt-1'}>VAT No: GH-0000000000</p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  color: '#374151',
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: '8px'
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold text-gray-700 uppercase mb-2'}
              >
                Client:
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '16px' : undefined,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0,
                  marginBottom: '4px'
                }}
                className={isPrinting ? '' : 'text-base sm:text-lg font-bold text-gray-800 mb-1'}
              >
                {customer.firstName} {customer.lastName}
              </p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>{customer.address}</p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>
                {customer.city}{customer.state ? `, ${customer.state}` : ''}{customer.zipCode ? ` ${customer.zipCode}` : ''}
              </p>
              <p style={isPrinting ? { fontSize: '12px', color: '#374151', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs sm:text-sm text-gray-700'}>{customer.phone}</p>
              <p style={isPrinting ? { fontSize: '11px', color: '#4b5563', margin: 0 } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600'}>{customer.email}</p>
              <p style={isPrinting ? { fontSize: '11px', color: '#4b5563', margin: 0, marginTop: '4px' } : undefined} className={isPrinting ? '' : 'text-xs text-gray-600 mt-1'}>Ref: {customer.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* ── PAYMENT / DATE INFO ── */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: isPrinting ? '24px' : undefined,
              marginBottom: isPrinting ? '20px' : undefined,
              paddingBottom: isPrinting ? '15px' : undefined,
              borderBottom: '1px solid #d1d5db'
            }}
            className={isPrinting ? '' : 'flex flex-wrap gap-6 mb-6 pb-5 border-b border-gray-300'}
          >
            <div>
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: '4px'
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold text-gray-600 uppercase mb-1'}
              >
                Payment Method:
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '12px' : undefined,
                  fontWeight: '600',
                  color: '#1f2937',
                  textTransform: 'capitalize',
                  margin: 0
                }}
                className={isPrinting ? '' : 'text-xs sm:text-sm font-semibold text-gray-800 capitalize'}
              >
                {paymentMethod || 'Paystack'}
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: '4px'
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold text-gray-600 uppercase mb-1'}
              >
                Order Number:
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '12px' : undefined,
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}
                className={isPrinting ? '' : 'text-xs sm:text-sm font-semibold text-gray-800'}
              >
                {orderNumber}
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: isPrinting ? '10px' : undefined,
                  fontWeight: 'bold',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  margin: 0,
                  marginBottom: '4px'
                }}
                className={isPrinting ? '' : 'text-[10px] sm:text-xs font-bold text-gray-600 uppercase mb-1'}
              >
                Issue Date:
              </p>
              <p 
                style={{
                  fontSize: isPrinting ? '12px' : undefined,
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}
                className={isPrinting ? '' : 'text-xs sm:text-sm font-semibold text-gray-800'}
              >
                {formattedDate}
              </p>
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <div 
            style={{ 
              marginBottom: isPrinting ? '20px' : undefined,
              overflow: 'visible'
            }}
            className={isPrinting ? '' : 'mb-6 overflow-x-auto -mx-4 sm:mx-0'}
          >
            <div style={{ width: '100%' }} className={isPrinting ? '' : 'min-w-[480px] px-4 sm:px-0'}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#14b8a6', color: '#ffffff' }}>
                    <th 
                      style={{
                        textAlign: 'left',
                        padding: isPrinting ? '10px 12px' : '10px',
                        fontWeight: 'bold',
                        fontSize: isPrinting ? '12px' : '13px'
                      }}
                      className={isPrinting ? '' : 'text-left px-3 py-2.5 font-bold text-xs sm:text-sm'}
                    >
                      ITEM DESCRIPTION
                    </th>
                    <th 
                      style={{
                        textAlign: 'center',
                        padding: isPrinting ? '10px 8px' : '10px',
                        fontWeight: 'bold',
                        fontSize: isPrinting ? '12px' : '13px',
                        width: isPrinting ? '80px' : '80px'
                      }}
                      className={isPrinting ? '' : 'text-center px-2 py-2.5 font-bold text-xs sm:text-sm w-20'}
                    >
                      PRICE
                    </th>
                    <th 
                      style={{
                        textAlign: 'center',
                        padding: isPrinting ? '10px 8px' : '10px',
                        fontWeight: 'bold',
                        fontSize: isPrinting ? '12px' : '13px',
                        width: isPrinting ? '60px' : '64px'
                      }}
                      className={isPrinting ? '' : 'text-center px-2 py-2.5 font-bold text-xs sm:text-sm w-16'}
                    >
                      QTY
                    </th>
                    <th 
                      style={{
                        textAlign: 'right',
                        padding: isPrinting ? '10px 12px' : '10px',
                        fontWeight: 'bold',
                        fontSize: isPrinting ? '12px' : '13px',
                        width: isPrinting ? '80px' : '80px'
                      }}
                      className={isPrinting ? '' : 'text-right px-3 py-2.5 font-bold text-xs sm:text-sm w-20'}
                    >
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                      }}
                      className={isPrinting ? '' : `border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td style={{ padding: isPrinting ? '12px' : '12px' }} className={isPrinting ? '' : 'px-3 py-3'}>
                        <div 
                          style={{ 
                            display: 'flex', 
                            gap: isPrinting ? '12px' : '12px', 
                            alignItems: 'flex-start' 
                          }}
                          className={isPrinting ? '' : 'flex gap-3 items-start'}
                        >
                          {item.image && (
                            <div 
                              style={{
                                width: isPrinting ? '60px' : undefined,
                                height: isPrinting ? '60px' : undefined,
                                flexShrink: 0,
                                backgroundColor: '#f3f4f6',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb'
                              }}
                              className={isPrinting ? '' : 'w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200'}
                            >
                              {isPrinting && base64Images[item.id] ? (
                                <img
                                  src={base64Images[item.id]}
                                  alt={item.name}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                />
                              ) : (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                            </div>
                          )}
                          <div style={{ minWidth: 0, flex: 1 }} className={isPrinting ? '' : 'min-w-0'}>
                            <p 
                              style={{
                                fontWeight: '600',
                                color: '#1f2937',
                                fontSize: isPrinting ? '12px' : '13px',
                                lineHeight: '1.3',
                                margin: 0
                              }}
                              className={isPrinting ? '' : 'font-semibold text-gray-800 text-xs sm:text-sm leading-tight'}
                            >
                              {item.name}
                            </p>
                            {item.color && (
                              <p 
                                style={{
                                  fontSize: isPrinting ? '10px' : '11px',
                                  color: '#6b7280',
                                  margin: 0,
                                  marginTop: '2px'
                                }}
                                className={isPrinting ? '' : 'text-[10px] sm:text-xs text-gray-500'}
                              >
                                Color: {item.color}
                              </p>
                            )}
                            {item.description && (
                              <p 
                                style={{
                                  fontSize: isPrinting ? '10px' : '11px',
                                  color: '#6b7280',
                                  margin: 0,
                                  marginTop: '2px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                                className={isPrinting ? '' : 'text-[10px] sm:text-xs text-gray-500 line-clamp-2'}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: isPrinting ? '12px 8px' : '12px' }} className={isPrinting ? '' : 'text-center px-2 py-3'}>
                        <p 
                          style={{
                            fontSize: isPrinting ? '11px' : '12px',
                            fontWeight: '600',
                            color: '#1f2937',
                            whiteSpace: 'nowrap',
                            margin: 0
                          }}
                          className={isPrinting ? '' : 'text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap'}
                        >
                          GHS {item.price.toFixed(2)}
                        </p>
                      </td>
                      <td style={{ textAlign: 'center', padding: isPrinting ? '12px 8px' : '12px' }} className={isPrinting ? '' : 'text-center px-2 py-3'}>
                        <p 
                          style={{
                            fontSize: isPrinting ? '11px' : '12px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}
                          className={isPrinting ? '' : 'text-xs sm:text-sm font-semibold text-gray-800'}
                        >
                          {item.quantity}
                        </p>
                      </td>
                      <td style={{ textAlign: 'right', padding: isPrinting ? '12px' : '12px' }} className={isPrinting ? '' : 'text-right px-3 py-3'}>
                        <p 
                          style={{
                            fontSize: isPrinting ? '11px' : '12px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            whiteSpace: 'nowrap',
                            margin: 0
                          }}
                          className={isPrinting ? '' : 'text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap'}
                        >
                          GHS {item.total.toFixed(2)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── NOTES / TOTALS ── */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isPrinting ? '1fr 1fr' : undefined,
              gap: isPrinting ? '24px' : undefined
            }}
            className={isPrinting ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}
          >
            {/* Notes */}
            <div>
              <h4 
                style={{
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: isPrinting ? '8px' : undefined,
                  fontSize: isPrinting ? '13px' : undefined,
                  margin: 0,
                  marginBottom: '8px'
                }}
                className={isPrinting ? '' : 'font-bold text-gray-800 mb-2 text-sm'}
              >
                Notes:
              </h4>
              <p 
                style={{
                  fontSize: isPrinting ? '11px' : undefined,
                  color: '#4b5563',
                  lineHeight: '1.6',
                  margin: 0
                }}
                className={isPrinting ? '' : 'text-xs text-gray-600 leading-relaxed'}
              >
                Thank you for your business! Your order will be carefully packaged and shipped soon.
                Returns accepted within 30 days of delivery in original condition.
                For inquiries, contact hello@rufaelan.com
              </p>
            </div>

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isPrinting ? '8px' : '8px' }} className={isPrinting ? '' : 'space-y-2'}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: isPrinting ? '11px' : '12px'
                }}
                className={isPrinting ? '' : 'flex justify-between text-xs sm:text-sm'}
              >
                <span style={{ color: '#374151' }} className={isPrinting ? '' : 'text-gray-700'}>Subtotal:</span>
                <span 
                  style={{
                    fontWeight: '600',
                    color: '#1f2937'
                  }}
                  className={isPrinting ? '' : 'font-semibold text-gray-800'}
                >
                  GHS {subtotal.toFixed(2)}
                </span>
              </div>
              {tax > 0 && (
                <div 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: isPrinting ? '11px' : '12px'
                  }}
                  className={isPrinting ? '' : 'flex justify-between text-xs sm:text-sm'}
                >
                  <span style={{ color: '#374151' }} className={isPrinting ? '' : 'text-gray-700'}>Tax (15%):</span>
                  <span 
                    style={{
                      fontWeight: '600',
                      color: '#1f2937'
                    }}
                    className={isPrinting ? '' : 'font-semibold text-gray-800'}
                  >
                    GHS {tax.toFixed(2)}
                  </span>
                </div>
              )}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: isPrinting ? '11px' : '12px'
                }}
                className={isPrinting ? '' : 'flex justify-between text-xs sm:text-sm'}
              >
                <span style={{ color: '#374151' }} className={isPrinting ? '' : 'text-gray-700'}>Shipping fee:</span>
                <span 
                  style={{
                    fontWeight: '600',
                    color: '#1f2937'
                  }}
                  className={isPrinting ? '' : 'font-semibold text-gray-800'}
                >
                  GHS {shipping.toFixed(2)}
                </span>
              </div>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: isPrinting ? '11px' : '12px'
                }}
                className={isPrinting ? '' : 'flex justify-between text-xs sm:text-sm'}
              >
                <span style={{ color: '#374151' }} className={isPrinting ? '' : 'text-gray-700'}>Discount:</span>
                <span 
                  style={{
                    fontWeight: '600',
                    color: '#1f2937'
                  }}
                  className={isPrinting ? '' : 'font-semibold text-gray-800'}
                >
                  GHS 0.00
                </span>
              </div>
              <div 
                style={{
                  borderTop: '1px solid #d1d5db',
                  borderBottom: '1px solid #d1d5db',
                  padding: isPrinting ? '8px 0' : '8px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold'
                }}
                className={isPrinting ? '' : 'border-t border-b border-gray-300 py-2 flex justify-between font-bold'}
              >
                <span 
                  style={{
                    color: '#1f2937',
                    fontSize: isPrinting ? '13px' : '14px'
                  }}
                  className={isPrinting ? '' : 'text-gray-800 text-sm sm:text-base'}
                >
                  Total:
                </span>
                <span 
                  style={{
                    fontSize: isPrinting ? '16px' : '18px',
                    color: '#1f2937'
                  }}
                  className={isPrinting ? '' : 'text-base sm:text-lg text-gray-800'}
                >
                  GHS {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div 
            style={{
              marginTop: isPrinting ? '20px' : undefined,
              paddingTop: isPrinting ? '15px' : undefined,
              borderTop: '1px solid #d1d5db',
              textAlign: 'center',
              fontSize: isPrinting ? '10px' : '11px',
              color: '#4b5563'
            }}
            className={isPrinting ? '' : 'mt-6 pt-5 border-t border-gray-300 text-center text-[10px] sm:text-xs text-gray-600 space-y-1'}
          >
            <p style={{ margin: 0, marginBottom: '4px' }}>View this invoice online at https://www.rufaelan.com/</p>
            <p style={{ margin: 0 }}>📱 +233 501 234 567 • 📧 hello@rufaelan.com • 🌐 www.rufaelan.com</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoiceReceipt.displayName = 'InvoiceReceipt';

export default InvoiceReceipt;
