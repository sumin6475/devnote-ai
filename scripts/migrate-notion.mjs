// Notion → DevNote 마이그레이션 스크립트
// 33개 노트를 순차 처리 (1초 간격, Claude API rate limit 방지)

const BASE_URL = 'http://localhost:3000';

const NOTES = [
  { rawContent: "forEach\narray 안에 있는 것을 이용하기\n- forEach 메서드\n- 배열(array) 사용\n- JavaScript 코드 예시" },
  { rawContent: "Hidden\n- 난이도: ★\n- Created time: March 7, 2026 9:25 PM\n- Tag: DB\n- Title: Hidden\n- CSS code for hidden elements" },
  { rawContent: "순서 없는 목록\n- 순서 없는 목록\n- 난이도: ★\n- Created time: March 7, 2026 9:27 PM\n- Tag DB:\n- Title: 순서 없는 목록" },
  { rawContent: "form  & Input\n- Form and input elements\n- HTML code example\n- Required input field\n- Max length for input\n- Submit button" },
  { rawContent: ".stringify() & parse()\nJS 요소를 string 으로 바꾸기 & object으로 바꾸기\n- .stringify() & parse()\n- JSON.stringify()\n- JSON.parse()\n- JS 요소 변환" },
  { rawContent: "push() .filter()\narray에 요소 넣기 & 지우기\n- push() 메서드: 배열에 요소 추가\n- filter() 메서드: 배열에서 특정 요소 제거\n- 예시 코드: 배열에 요소 추가 및 제거 방법\n- React useState에서 filter() 사용법" },
  { rawContent: "localStorage\n- localStorage\n- 난이도: ★\n- Created time: March 7, 2026 9:31 PM\n- 코드 예시: localStorage.setitem()" },
  { rawContent: "JS로 HTML 추가하기\n- JS로 HTML 추가\n- 이미지 추가\n- document.createElement\n- document.body.appendChild\n- querySelector 사용법" },
  { rawContent: "Math()\nrandonless\n- Math module\n- Math.ceil()\n- Math.floor()\n- Math.round()\n- Math.random()\n- Random number generation (0-9)\n- Alternative method (Date.now())" },
  { rawContent: "문자열 포맷다루기\n- 문자열 포맷\n- padStart()\n- padEnd()\n- String()\n- parseInt()" },
  { rawContent: "setInterval(), setTimeout()\n- setInterval()\n- setTimeout()\n- JavaScript\n- Timing functions" },
  { rawContent: "submit 누르면 css hidden 되게 만들기\n클래스 넣기 빼기\n- CSS hidden 처리\n- 로그인 제출 이벤트\n- 사용자 이름 표시\n- 클래스 추가 및 제거" },
  { rawContent: "event" },
  { rawContent: "classList\n- classList\n- 난이도: ★\n- Created time: March 7, 2026 9:34 PM\n- elements.classList.contains\n- .remove\n- .toggle" },
  { rawContent: "…[]\narray 값\n- 난이도: ★\n- Created time: March 7, 2026 9:36 PM\n- array 값\n- 현재 array의 요소들 가져오기\n- setToDos 함수 사용" },
  { rawContent: "useEffect()\n- useEffect() function\n- React hook\n- Executes code based on conditions\n- Empty dependency array runs only on component mount" },
  { rawContent: "prop\n- 난이도: ★\n- Created time: March 7, 2026 9:37 PM\n- JSX code example\n- Button component (child)\n- App component (parent)" },
  { rawContent: "useState()\n- useState() 사용법\n- 기본 변수 생성\n- 안전한 업데이트 방법" },
  { rawContent: "{}\nJSX안에 JS 쓸 때\n- JSX에서 JavaScript 사용\n- 변수 사용 예시\n- 컴포넌트 구조\n- 카운터 표시" },
  { rawContent: "화살표 함수\n- 화살표 함수\n- onClick 이벤트\n- JSX 코드 예시" },
  { rawContent: "Summary : Props & Delete Button — What You Did\n- Delete button functionality\n- Props in React components\n- State management in parent component\n- Event handling and data flow" },
  { rawContent: "map()" },
  { rawContent: "\"Permission policy violation..\"\n- Permission policy violation\n- Created on March 9, 2026\n- Issue from browser extension\n- Solution: use \"incognito window\"" },
  { rawContent: "Extra Practice : make a \"Coin Converter\"\n- Coin Converter implementation\n- Fetching coin data from API\n- Handling coin selection\n- Displaying selected coin and dollar value\n- Using useState and useEffect\n- React component structure\n- Preventing form submission with button type\n- Best practices for state management" },
  { rawContent: "create-react-app\n- create-react-app 사용법\n- 프로젝트 생성: npx create-react-app [파일이름]\n- VSCode에서 열기: code [파일이름]\n- 노드 버전 확인: node -v\n- 종료: npx //exit" },
  { rawContent: "async-await\n- async 함수\n- await 사용\n- 비동기 작업\n- state 준비\n- useEffect에서 실행\n- API 요청 (fetch)\n- JSON 변환\n- Promise" },
  { rawContent: "react-router-dom\n페이지 바꾸기, Link, useParams()\n- react-router-dom 설치\n- Router, Route, Switch 사용법\n- Link 컴포넌트\n- URL 파라미터 사용\n- useParams() 훅" },
  { rawContent: "h1에 링크 걸기\n- h1 태그에 링크 추가\n- HTML 코드 예시\n- 생성 시간: 2026년 3월 10일" },
  { rawContent: "Tutorial's project cheat sheet [Learn Express JS In 35 Minutes ]\n- Sending Data, Rendering HTML\n- Router, Advanced Routing\n- Middleware\n- Parsing Form/Json Data\n- Query" },
  { rawContent: "fetch await\n- fetch 함수: 요청 보내기\n- await: 응답 대기\n- HTTP 요청: OpenAI 서버\n- JSON 처리\n- API 키 사용\n- POST 메서드" },
  { rawContent: "try-catch-finally\n- try-catch-finally 구조\n- 에러 처리\n- 코드 실행 보장" },
  { rawContent: "...(previousResponseId && { previous_response_id: previousResponseId })" },
  { rawContent: "Vercel 배포\n- Vercel 배포\n- API 호출 문제\n- VITE_API_BASE 설정 필요\n- 로컬호스트 요청 문제\n- Vite 환경 변수 사용\n- 재빌드 및 재배포 필요" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function migrate() {
  console.log(`Starting migration: ${NOTES.length} notes\n`);
  let success = 0;
  let aiSuccess = 0;
  let aiFailed = 0;

  for (let i = 0; i < NOTES.length; i++) {
    const { rawContent } = NOTES[i];
    const title = rawContent.split('\n')[0].slice(0, 50);
    process.stdout.write(`[${i + 1}/${NOTES.length}] "${title}" ... `);

    try {
      // 1. 노트 저장
      const noteRes = await fetch(`${BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteType: 'quick',
          rawContent,
          projectId: null,
          skillTags: [],
          topicTags: [],
          category: '',
          relatedConcepts: [],
        }),
      });
      const noteData = await noteRes.json();
      if (!noteData.success) throw new Error(noteData.error);
      const noteId = noteData.data.id;
      success++;
      process.stdout.write('saved → ');

      // 2. AI 분석
      try {
        const aiRes = await fetch(`${BASE_URL}/api/ai/analyze-quick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent }),
        });
        const aiData = await aiRes.json();
        if (!aiData.success) throw new Error(aiData.error);

        // 3. AI 결과로 업데이트
        const updateRes = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problem: aiData.data.problem,
            solution: aiData.data.solution,
            understanding: aiData.data.understanding,
            whatIBuilt: aiData.data.whatIBuilt,
            learnings: aiData.data.learnings,
            skillTags: aiData.data.skillTags,
            topicTags: aiData.data.topicTags,
            category: aiData.data.category,
            relatedConcepts: aiData.data.relatedConcepts,
          }),
        });
        const updateData = await updateRes.json();
        if (!updateData.success) throw new Error(updateData.error);

        aiSuccess++;
        console.log('AI done ✓');
      } catch (aiErr) {
        aiFailed++;
        console.log(`AI failed: ${aiErr.message}`);
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }

    // rate limit 방지 대기
    if (i < NOTES.length - 1) await sleep(1500);
  }

  console.log(`\n--- Migration complete ---`);
  console.log(`Notes saved: ${success}/${NOTES.length}`);
  console.log(`AI analyzed: ${aiSuccess}, AI failed: ${aiFailed}`);
}

migrate();
