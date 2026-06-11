QuillCompass v33 ENV DEBUG

이 버전은 API 키를 index.html에 넣지 않고 Vercel Environment Variables에서 읽습니다.
추가로 API 연결 진단용 엔드포인트가 들어 있습니다.

환경변수 이름:
GEMINI_API_KEY
ECOS_API_KEY
FASTFOREX_API_KEY
FINNHUB_API_KEY
MASSIVE_API_KEY

대체 이름도 일부 지원:
GEMINI_KEY / GOOGLE_API_KEY
ECOS_KEY / BOK_API_KEY
FASTFOREX_KEY
FINNHUB_KEY
MASSIVE_KEY / POLYGON_API_KEY

배포 후 먼저 확인:
https://내사이트.vercel.app/api/env-check
https://내사이트.vercel.app/api/quick-test

env-check에서 false가 나오면 환경변수 이름/환경 선택/재배포 문제입니다.
quick-test에서 404가 나오면 api 폴더가 루트에 없거나 Vercel Root Directory가 잘못된 것입니다.
