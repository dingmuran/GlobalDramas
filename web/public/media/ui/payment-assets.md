# Payment marks

- Apple Pay: paths from Apple official acceptance mark, with outer acceptance plaque omitted for the compact payment button. Source: https://developer.apple.com/apple-pay/marketing/Apple-Pay-Mark.zip . Monochrome logo uses CSS inversion on dark backgrounds.
- Google Pay: official dark-background button wordmark https://www.gstatic.com/instantbuy/svg/dark_gpay.svg . Original multicolor G and white Pay retained.
- PayPal symbol: official blue double-P mark https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-mark-color.svg . Original SVG retained alongside the white wordmark.
- PayPal: official white wordmark https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-monotone.svg . Original SVG retained.

Marks identify demonstration payment options. Their display does not mean merchant approval or live payment processing.

Current buttons use standalone symbols plus shared UI text for consistent typography. `apple-mark.svg` contains the complete Apple symbol paths with padding; `google-mark.svg` contains the multicolor G paths from the sources above. PayPal uses the existing blue symbol. Full wordmark assets remain as source assets but are no longer rendered in payment controls.
