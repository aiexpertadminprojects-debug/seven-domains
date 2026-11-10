# Seven Domains — Domain Reseller Phase 1 Add-on

यह add-on मौजूदा वेबसाइट को overwrite नहीं करता। इसमें केवल नई files हैं।

## इस चरण में तैयार
- Provider-neutral registrar adapter: `functions/lib/registrar.js`
- API contract: `GET /api/domains/search?domain=example.com`
- D1 migration `0002_domain_reseller.sql`: domain_quotes, domain_orders, domain_order_events
- Fail-closed response: registrar configure न होने पर `503 NOT_CONFIGURED`, `available: null`। कोई नकली availability या कीमत नहीं दिखाई जाएगी।

## अभी live नहीं
वास्तविक availability, registration, renewal, transfer, live prices और payment gateway अभी connected नहीं हैं। इनके लिए authorised registrar/reseller account, official API documentation, credentials और production approval चाहिए।

## Upload
ZIP extract करके repository root में नई files merge करें। Existing files overwrite न करें:
- `functions/lib/registrar.js`
- `functions/api/domains/search.js`
- `migrations/0002_domain_reseller.sql`
- यह README

## D1 migration
Cloudflare Dashboard → Workers & Pages → D1 → `seven-domains-db` → Console में `migrations/0002_domain_reseller.sql` का पूरा SQL run करें। `0001_initial.sql` दोबारा न चलाएँ।

## Safe test
Deploy के बाद खोलें:
`https://seven-domains.pages.dev/api/domains/search?domain=example.com`

जब तक registrar adapter configured नहीं है, expected response:
- HTTP 503
- `status: NOT_CONFIGURED`
- `available: null`
- `live: false`

यह expected है; API झूठा दावा नहीं करती।

## Credentials
अभी कोई registrar secret न जोड़ें। Vendor चुनने और official API contract verify करने के बाद ही secret names तय होंगे। API keys GitHub या browser JavaScript में न रखें।

## Production order safety
1. Fresh registrar quote लें और expiry जाँचें।
2. Payment gateway webhook/signature server-side verify करें।
3. Idempotency key से duplicate orders रोकें।
4. Registrar registration request भेजें।
5. Registrar confirmation के बाद ही domain को `registered` दिखाएँ।
6. Registration failure पर refund workflow शुरू करें।

Browser redirect payment proof नहीं है। Payment confirmation और domain registration अलग घटनाएँ हैं।

## Accreditation
Reseller API और accredited registrar अलग चीजें हैं। gTLD (जैसे .com) के लिए ICANN accreditation तथा registry agreements; `.in` के लिए .IN Registry/NIXI की current accreditation requirements, technical operations, abuse handling, compliance और funding आवश्यक हैं। यह add-on accreditation नहीं देता। Accreditation मिलने से पहले “ICANN-accredited” या “NIXI-accredited registrar” न लिखें।
