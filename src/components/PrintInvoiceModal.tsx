import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { OrderDocument } from '../types/order';
import { numberToWordsINR } from '../utils/numberToWords';
import './PrintInvoice.css';

export interface PrintInvoiceModalProps {
  order: OrderDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Add marker class to body so @media print selectively hides #root
    document.body.classList.add('has-print-invoice-modal');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('has-print-invoice-modal');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-IN');
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalItemsCount = order.products?.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  ) || 0;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="print-invoice-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="print-invoice-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* On-Screen Action Bar (Hidden during print) */}
        <div className="print-action-bar no-print">
          <div className="print-action-info">
            <span className="print-action-title">
              Invoice &amp; Parcel Slip — #{order._id.slice(-6).toUpperCase()}
            </span>
            <span className="print-action-subtitle">
              Ready for A4 printing and parcel attachment
            </span>
          </div>

          <div className="print-action-buttons">
            <button
              type="button"
              className="btn-print-action btn-print-primary"
              onClick={handlePrint}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect width="12" height="8" x="6" y="14" />
              </svg>
              <span>Print Invoice / Parcel Slip</span>
            </button>
            <button
              type="button"
              className="btn-print-action btn-print-secondary"
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            PRINTABLE INVOICE & PARCEL PACKING SLIP (A4 Printable Body)
            ------------------------------------------------------------- */}
        <div id="printable-invoice" className="printable-invoice-container">
          {/* 1. Brand & Header Block */}
          <header className="invoice-header">
            <div className="invoice-brand-block">
              <img
                src="/logo.png"
                alt="Appu Sarees Logo"
                className="invoice-brand-logo-img"
              />
              <div className="invoice-brand-text">
                <div className="invoice-brand-logo">
                  <span className="invoice-brand-name">APPU SAREES</span>
                  <span className="invoice-brand-tagline">
                    Ethnic Handlooms &amp; Pure Silk Boutique
                  </span>
                </div>
                <p className="invoice-brand-address">
                  124, Handloom Weavers Hub, Silk Market, Bengaluru, Karnataka - 560002<br />
                  Helpline: +91 98765 43210 &bull; support@appusarees.com &bull; www.appusarees.com
                </p>
              </div>
            </div>

            <div className="invoice-meta-block">
              <h1 className="invoice-document-title">TAX INVOICE / DISPATCH SLIP</h1>
              <div className="invoice-meta-row">
                <span className="meta-label">Invoice No:</span>
                <span className="meta-val font-mono">INV-APP-{order._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="meta-label">Order Ref:</span>
                <span className="meta-val font-mono">#{order._id}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="meta-label">Date &amp; Time:</span>
                <span className="meta-val">{formatDate(order.createdAt)}</span>
              </div>
              <div className="invoice-meta-row">
                <span className="meta-label">Payment Status:</span>
                <span className={`meta-val-badge ${order.payment ? 'badge-paid' : 'badge-unpaid'}`}>
                  {order.payment ? 'PAID / VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          </header>

          <div className="invoice-divider" />

          {/* 2. PARCEL SHIPPING LABEL (✂ CUT AND ATTACH TO PARCEL COURIER BAG) */}
          <section className="parcel-cutout-box">
            <div className="parcel-cutout-banner">
              <span className="scissors-icon">✂</span>
              <span>PARCEL DISPATCH &amp; SHIPPING LABEL &bull; ATTACH TO COURIER BAG</span>
            </div>

            <div className="parcel-parties-grid">
              {/* SHIP TO (RECIPIENT) */}
              <div className="parcel-party-card ship-to-card">
                <span className="parcel-card-badge">DELIVER TO (RECIPIENT)</span>
                <h3 className="recipient-name">{order.name}</h3>
                <p className="recipient-address">{order.address}</p>
                
                <div className="recipient-meta-list">
                  <div className="recipient-meta-row">
                    <span className="meta-label">Pin code:</span>
                    <span className="meta-value font-semibold">{order.pinCode}</span>
                  </div>
                  <div className="recipient-meta-row">
                    <span className="meta-label">Phone:</span>
                    <span className="meta-value font-semibold">{order.phone}</span>
                  </div>
                  {order.email && (
                    <div className="recipient-meta-row">
                      <span className="meta-label">Email:</span>
                      <span className="meta-value">{order.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SHIP FROM (BOUTIQUE SENDER) */}
              <div className="parcel-party-card ship-from-card">
                <span className="parcel-card-badge">DISPATCHED FROM (SHIPPER)</span>
                <h4 className="shipper-name">Appu Sarees Dispatch Hub</h4>
                <p className="shipper-address">
                  Weavers Quarter, Silk Market<br />
                  Bengaluru, Karnataka - 560002
                </p>

                <div className="recipient-meta-list">
                  <div className="recipient-meta-row">
                    <span className="meta-label">Helpline:</span>
                    <span className="meta-value font-semibold">+91 98765 43210</span>
                  </div>
                  <div className="recipient-meta-row">
                    <span className="meta-label">Contents:</span>
                    <span className="meta-value">{totalItemsCount} Saree(s) / Textile</span>
                  </div>
                  <div className="recipient-meta-row">
                    <span className="meta-label">Payment:</span>
                    <span className={`meta-value font-semibold ${order.payment ? 'text-success' : 'text-danger'}`}>
                      {order.payment ? 'PREPAID (DO NOT COLLECT CASH)' : 'COLLECT CASH ON DELIVERY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. FULL ITEM LIST TABLE */}
          <section className="invoice-items-section">
            <h2 className="section-title">FULL LIST OF ORDERED ITEMS</h2>
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>Item Description &amp; Fabric Specifications</th>
                  <th style={{ width: '110px' }}>Category</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>HSN</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.products?.map((item, index) => {
                  const prod = item.product;
                  const unitPrice =
                    prod?.offer && prod?.newPrice ? prod.newPrice : prod?.price || 0;
                  const lineTotal = unitPrice * (item.quantity || 1);

                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <div className="table-item-desc">
                          <span className="item-title">{prod?.title || 'Handcrafted Saree'}</span>
                          {prod?.description && (
                            <span className="item-sub">
                              {prod.description.slice(0, 75)}
                              {prod.description.length > 75 ? '...' : ''}
                            </span>
                          )}
                          <span className="item-sku">SKU: {prod?._id?.slice(-6).toUpperCase() || 'ETHNIC'}</span>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {prod?.dressType?.replace('-', ' ') || 'Saree'}
                      </td>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>5007</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>
                        ₹{unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* 4. TOTALS & FINANCIAL SUMMARY */}
          <section className="invoice-summary-grid">
            {/* Left: Words and Payment Audit */}
            <div className="summary-left-pane">
              <div className="amount-words-card">
                <span className="words-label">Total Amount in Words:</span>
                <span className="words-text">
                  {numberToWordsINR(order.totalAmount || 0)}
                </span>
              </div>

              <div className="payment-audit-card">
                <span className="audit-title">Payment &amp; Gateway Verification</span>
                <div className="audit-row">
                  <span>Payment Gateway:</span>
                  <strong style={{ textTransform: 'uppercase' }}>
                    {order.phonepeOrderId || order.paymentGateway === 'phonepe'
                      ? 'PhonePe Payment Gateway'
                      : 'Razorpay Payment Gateway'}
                  </strong>
                </div>
                {order.phonepeTransactionId && (
                  <div className="audit-row font-mono">
                    <span>PhonePe Txn ID:</span>
                    <span>{order.phonepeTransactionId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="audit-row font-mono">
                    <span>Razorpay Payment ID:</span>
                    <span>{order.razorpayPaymentId}</span>
                  </div>
                )}
                {order.phonepeOrderId && (
                  <div className="audit-row font-mono">
                    <span>PhonePe Order ID:</span>
                    <span>{order.phonepeOrderId}</span>
                  </div>
                )}
              </div>

              <div className="terms-card">
                <strong>Boutique Handling Instructions:</strong>
                <ul>
                  <li>Authentic handloom silks. Dry cleaning recommended.</li>
                  <li>Inspected &amp; packaged by Appu Sarees Quality Assurance Team.</li>
                  <li>Customer inquiries: support@appusarees.com or +91 98765 43210.</li>
                </ul>
              </div>
            </div>

            {/* Right: Price Breakdown and Grand Total */}
            <div className="summary-right-pane">
              <div className="totals-table">
                <div className="total-row">
                  <span>Total Ordered Sarees:</span>
                  <strong>{totalItemsCount} pieces</strong>
                </div>
                <div className="total-row">
                  <span>Subtotal (Items Total):</span>
                  <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Shipping &amp; Courier Packaging:</span>
                  <span className="text-success" style={{ fontWeight: 700 }}>
                    FREE (Included)
                  </span>
                </div>
                <div className="total-row">
                  <span>GST / Handloom Textile Taxes:</span>
                  <span>Included</span>
                </div>

                <div className="total-divider" />

                <div className="grand-total-row">
                  <div className="grand-total-label">
                    <span>FINAL INVOICE TOTAL:</span>
                    <small>(Inclusive of all taxes &amp; packaging)</small>
                  </div>
                  <div className="grand-total-amount">
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Signatory Box */}
              <div className="signatory-box">
                <div className="sign-line" />
                <span className="sign-title">For APPU SAREES</span>
                <span className="sign-sub">Authorized Signatory</span>
              </div>
            </div>
          </section>

          {/* 5. Document Footer */}
          <footer className="invoice-footer">
            <p>
              Thank you for choosing handcrafted heritage from <strong>Appu Sarees</strong>! This is a computer-generated tax invoice &amp; parcel dispatch slip.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PrintInvoiceModal;
