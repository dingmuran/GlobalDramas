/** Google Pay TEST only. Payment tokens are neither stored nor sent to a server. */
type PaymentRequest = Record<string, unknown>;
type Client = { loadPaymentData(request: PaymentRequest): Promise<unknown> };
type GooglePayWindow = Window & { google?: { payments: { api: { PaymentsClient: new (options: { environment: 'TEST' }) => Client } } } };
let client: Client | undefined;
let loading: Promise<void> | undefined;
export function prepareGooglePay(): Promise<void> {
  if (client) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const initialize = () => {
      const api = (window as GooglePayWindow).google?.payments.api;
      if (!api) { loading = undefined; reject(new Error('Google Pay unavailable')); return; }
      client = new api.PaymentsClient({ environment: 'TEST' });
      resolve();
    };
    if ((window as GooglePayWindow).google?.payments.api) { initialize(); return; }
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = initialize;
    script.onerror = () => { loading = undefined; script.remove(); reject(new Error('Google Pay unavailable')); };
    document.head.appendChild(script);
  });
  return loading;
}
export function openGooglePay(price: number, english: boolean): Promise<unknown> {
  if (!client) return Promise.reject(new Error('Google Pay not ready'));
  // Keep this synchronous up to loadPaymentData to preserve the click activation.
  try { return client.loadPaymentData({
    apiVersion: 2, apiVersionMinor: 0,
    allowedPaymentMethods: [{ type: 'CARD', parameters: { allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'], allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'] }, tokenizationSpecification: { type: 'PAYMENT_GATEWAY', parameters: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' } } }],
    merchantInfo: { merchantName: 'Gload Dramas' },
    transactionInfo: { totalPriceStatus: 'FINAL', totalPrice: price.toFixed(2), currencyCode: english ? 'USD' : 'CNY', countryCode: 'HK' },
  }); } catch (error) { return Promise.reject(error); }
}
