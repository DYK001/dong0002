QuillCompass v32 ENV SAFE

이 버전은 GitHub Secret Scanning에 걸리지 않도록 API 키를 index.html에서 제거했습니다.
실제 API 키는 Vercel Project Settings > Environment Variables에 아래 이름으로 넣으세요.

필수/권장 환경변수:
GEMINI_API_KEY
ECOS_API_KEY
FASTFOREX_API_KEY
FINNHUB_API_KEY
MASSIVE_API_KEY

파일 구조:
index.html
api/gemini.js
api/fastforex.js
api/massive.js
api/finnhub.js
api/ecos.js

GitHub에는 이 폴더 안의 파일을 저장소 루트에 그대로 업로드하세요.
