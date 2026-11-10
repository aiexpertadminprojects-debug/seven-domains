# Seven Domains — Registrar Foundation (Phase 4)

यह package registrar integration की सुरक्षित foundation है। यह अभी किसी वास्तविक
registrar से जुड़ा नहीं है। Provider चुने और उसकी official API mapping तैयार किए
बिना live availability, कीमत या registration संभव नहीं है।

## Files
- `functions/lib/registrar.js` — provider-neutral adapter
- `functions/api/domains/search.js` — GET `/api/domains/search?domain=example.com`

## GitHub में जोड़ना
ZIP की directory structure के अनुसार files `main` branch में जोड़ें।
यदि `functions/api/domains/search.js` पहले से है, तो पहले उसकी copy रखें और फिर
इस package वाली file से replace करें। `functions/lib/registrar.js` नया file है।

## सुरक्षित व्यवहार
- Domain validation और D1 catalogue lookup।
- TLD `enabled=1` और `registrar_provider` configured न हो तो `NOT_CONFIGURED`।
- Provider failure/invalid response पर `available:null`, कभी fake availability नहीं।
- Provider endpoint HTTPS होना जरूरी।
- Prices केवल integer paise और INR में स्वीकार।

## Cloudflare configuration — provider mapping के बाद ही
- Secret: `REGISTRAR_API_TOKEN`
- Variable: `REGISTRAR_API_BASE_URL` (HTTPS)
- Variable: `REGISTRAR_SEARCH_PATH` (provider-specific path)

**चेतावनी:** हर registrar का API अलग होता है। यह adapter केवल normalized
contract समझता है। Registrar की official API documentation के अनुसार
`registrar.js` में request/response mapping किए बिना token configure न करें।
अनजान URL पर API token न भेजें।

## Normalized contract
POST `{REGISTRAR_API_BASE_URL}{REGISTRAR_SEARCH_PATH}`
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
Body: `{"domain":"example.com"}`

Expected response example (केवल schema example, वास्तविक price नहीं):
```json
{
  "available": true,
  "currency": "INR",
  "registrationPricePaise": 99900,
  "renewalPricePaise": 119900
}
```

## Test
Deploy के बाद `/api/domains/search?domain=example.com` खोलें।
Provider/TLD enable न होने पर `NOT_CONFIGURED` expected है।

## अभी शामिल नहीं
Registrar-specific API mapping, actual registration/renewal/transfer, payment capture,
refunds, DNS updates और registrar accreditation. इन सबके लिए provider selection,
official API docs, test credentials और अलग tested order/payment flow चाहिए।
