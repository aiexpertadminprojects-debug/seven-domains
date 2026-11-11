# Seven Domains — Phase 5: Independent Registrar Core

यह package मौजूदा website को बदले बिना तीन नई files जोड़ता है:

1. `migrations/0005_registrar_core.sql`
2. `functions/lib/registrar-core.js`
3. `functions/api/admin/registrar/operations.js`

## लागू करने का क्रम

1. पहले GitHub में तीनों files को ठीक इसी path पर जोड़ें।
2. Cloudflare D1 database `seven-domains-db` में `0005_registrar_core.sql` migration एक बार चलाएँ।
3. Cloudflare Pages deployment सफल होने दें।

## API

`POST /api/admin/registrar/operations`

यह admin-authenticated, same-origin endpoint है। JSON body का उदाहरण:

```json
{
  "domain": "example.com",
  "operation": "register",
  "termYears": 1
}
```

इस समय enabled TLD होने पर भी endpoint केवल `dry_run` operation plan save करता है। यह कोई registrar/registry request नहीं भेजता, domain reserve/register नहीं करता, और live availability का दावा नहीं करता।

## महत्वपूर्ण

- `.com` और `.in` की वास्तविक registry access/accreditation अलग प्रक्रियाएँ हैं।
- किसी TLD को enabled न करें जब तक वास्तविक अधिकृत registry connectivity और सही pricing प्रमाणित न हो।
- कोई API token या secret इस package में hard-code नहीं है।
