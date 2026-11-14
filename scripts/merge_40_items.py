import json

questions_40 = [
  {
    "id": "GONGIBOB_01",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "인터페이스 구현 검증",
    "ncs_module": "M4",
    "subtopic_id": "4-2",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "인터페이스 구현 검증 도구 중 다음 제시문에 해당하는 것은?\n\n[제시문]\n- 다양한 브라우저 및 개발 언어를 지원하는 웹 애플리케이션 테스트 프레임워크\n- 테스트 스크립트 언어를 학습할 필요 없이 기능 테스트를 만들기 위한 도구를 제공",
    "choices": [
      { "number": 1, "text": "xUnit", "is_correct": False },
      { "number": 2, "text": "STAF", "is_correct": False },
      { "number": 3, "text": "FitNesse", "is_correct": False },
      { "number": 4, "text": "Selenium", "is_correct": True },
      { "number": 5, "text": "watir", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\n④ Selenium: 다양한 브라우저 및 개발 언어를 지원하는 웹 애플리케이션 테스트 프레임워크로 테스트 스크립트 언어를 학습할 필요 없이 기능 테스트를 만들기 위한 도구를 제공합니다.\n\n<인터페이스 구현 검증 도구>\n(1) xUnit: 다양한 언어를 지원하는 단위 테스트 프레임워크\n(2) STAF: 데몬을 사용하여 분산 환경 통합 자동화 검증 도구\n(3) FitNesse: 웹 기반 테스트 케이스 테이블 작성 실행 프레임워크\n(4) Selenium: 다양한 브라우저/언어 지원 웹 앱 테스트 도구\n(5) watir: 루비 기반 웹 애플리케이션 테스트 프레임워크"
  },
  {
    "id": "GONGIBOB_02",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "순환 복잡도 계산",
    "ncs_module": "M4",
    "subtopic_id": "4-1",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "어떤 프로그램의 제어흐름그래프(Control Flow Graph)가 주어졌을 때 McCabe식의 Cyclomatic Complexity를 구하시오.\n(간선 Edge E = 6, 노드 Node N = 5)",
    "choices": [
      { "number": 1, "text": "2", "is_correct": False },
      { "number": 2, "text": "3", "is_correct": True },
      { "number": 3, "text": "4", "is_correct": False },
      { "number": 4, "text": "5", "is_correct": False },
      { "number": 5, "text": "6", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n· Cyclomatic Complexity(CC) = Edge(E) – Node(N) + 2P (단일 컴포넌트 P=1)\n· Edge(E) 화살표 수 = 6개\n· Node(N) 노드 수 = 5개\n∴ V(G) = 6 - 5 + 2 = 3"
  },
  {
    "id": "GONGIBOB_03",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "페어와이즈 테스팅",
    "ncs_module": "M4",
    "subtopic_id": "4-2",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "페어와이즈(pairwise) 테스팅에 대한 설명으로 옳지 않은 것은?",
    "choices": [
      { "number": 1, "text": "페어와이즈 테스트 스위트는 두 요소(한 쌍)의 모든 조합을 커버하도록 생성되며, 그 수가 완전 테스트 스위트보다 훨씬 작아 효과적이지 않다.", "is_correct": True },
      { "number": 2, "text": "프로세싱이 패러미터 간 상호작용과 관련 있을 때 페어와이즈 테스팅이 효과적이다.", "is_correct": False },
      { "number": 3, "text": "all-pairs 테스팅, 2-way 조합 테스팅, 2-wise 테스팅으로도 알려져 있다.", "is_correct": False },
      { "number": 4, "text": "대부분의 결함이 많아야 두 개 요소의 상호작용에 의해 야기된다는 관찰에 기반하고 있는 테스트 케이스 생성 기법이다.", "is_correct": False },
      { "number": 5, "text": "페어와이즈 테스팅은 의존성이 없는 서로 독립적인 옵션들을 테스팅하는데 주로 사용되며, 그 대표적인 예가 구성 테스팅(Configuration testing)이다.", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\n페어와이즈 테스트 스위트는 두 요소의 모든 조합을 커버하며, 완전 테스트 스위트보다 훨씬 적은 수의 테스트 케이스로도 결함 발견율이 매우 높아 매우 효과적인 기법입니다."
  },
  {
    "id": "GONGIBOB_04",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "형상관리 (Git vs GitHub)",
    "ncs_module": "M8",
    "subtopic_id": "8-1",
    "ncs_title": "NCS M8 형상관리 & 유지보수",
    "question": "Git과 GitHub에 대한 설명으로 옳지 않은 것은?",
    "choices": [
      { "number": 1, "text": "개인 컴퓨터에서 사용하는 Git을 Local git이라고 하며, Github와 같이 클라우드에 저장하는 Git을 Remote git이라고 한다.", "is_correct": False },
      { "number": 2, "text": "Git은 기본적으로 터미널을 사용하므로, UI 요소가 지원되지 않으나, Github는 터미널로 이용할 수 있는 방식뿐만 아니라, 웹사이트를 통해 UI 요소가 지원될 수 있도록 한다.", "is_correct": False },
      { "number": 3, "text": "Git은 기본적으로 PR(Pull Request) 기능이 없으며, PR 기능은 코드 리뷰를 돕기 위해, Github에서 만들어낸 기능이다.", "is_correct": False },
      { "number": 4, "text": "Github는 Git에서 CI/CD를 강화하기 위해 Git Action과 같은 자동 빌드 및 배포 기능과 프로젝트 매니징을 위한 칸반 보드 기능을 넣었다.", "is_correct": False },
      { "number": 5, "text": "Git과 Github는 개인 계정을 등록해야 하고, 인터넷을 연결해야 사용할 수 있다.", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\nGit은 로컬 분산 버전관리 시스템이므로 개인 계정 등록이나 인터넷 연결 없이도 로컬에서 커밋, 브랜칭 등 모든 버전 관리가 가능합니다. 반면 GitHub는 원격 클라우드 호스팅 서비스로 인터넷과 계정이 필수적입니다."
  },
  {
    "id": "GONGIBOB_05",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "소프트웨어 라이선스 (CCL)",
    "ncs_module": "M8",
    "subtopic_id": "8-1",
    "ncs_title": "NCS M8 형상관리 & 유지보수",
    "question": "CCL 라이선스의 허용범위를 나타낸 설명 중 옳지 않은 것은?",
    "choices": [
      { "number": 1, "text": "CC0: 퍼블릭 도메인으로 모든 권리를 포기함", "is_correct": False },
      { "number": 2, "text": "CC BY-ND: 저작자 표시 조건 하에 변경 금지", "is_correct": False },
      { "number": 3, "text": "CC BY-NC: 저작자 표시 조건 하에 비영리만 허용", "is_correct": False },
      { "number": 4, "text": "CC BY-NC-SA: 저작자 표시, 비영리, 동일조건 변경허락", "is_correct": False },
      { "number": 5, "text": "CC BY-NC-ND: 저작자 표시, 비영리 조건이며 2차 저작물 작성 및 라이선스 변경이 자유롭다", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\nCC BY-NC-ND는 저작자표시(BY), 비영리(NC), 변경금지(ND)이므로 2차적 저작물 작성(변경 및 가공)과 라이선스 변경이 절대 금지됩니다."
  },
  {
    "id": "GONGIBOB_06",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "화이트박스 커버리지",
    "ncs_module": "M4",
    "subtopic_id": "4-1",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "다음 결정 커버리지(Decision / Branch Coverage)에 대한 설명으로 옳은 것을 모두 고르면?\n\n[제시문]\nⒶ Branch Coverage라고도 불린다.\nⒷ 결정 포인트 내의 전체 조건식이 최소한 참 한 번, 거짓 한 번을 갖는지 측정하는 것이다.\nⒸ 개별 조건식의 개수와 상관없이 테스트 케이스의 최소 개수는 2개이다.\nⒹ 조건, 조건/결정 커버리지에 비해 약하다.",
    "choices": [
      { "number": 1, "text": "Ⓐ, Ⓑ, Ⓒ", "is_correct": False },
      { "number": 2, "text": "Ⓐ, Ⓑ, Ⓓ", "is_correct": False },
      { "number": 3, "text": "Ⓐ, Ⓒ, Ⓓ", "is_correct": False },
      { "number": 4, "text": "Ⓑ, Ⓒ, Ⓓ", "is_correct": False },
      { "number": 5, "text": "Ⓐ, Ⓑ, Ⓒ, Ⓓ", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번 (Ⓐ, Ⓑ, Ⓒ, Ⓓ 모두 참)\n결정 커버리지(분기 커버리지)는 전체 조건식이 참 1회, 거짓 1회를 수행하도록 하므로 개별 조건식 개수와 무관하게 최소 2개의 테스트 케이스로 달성 가능하며, 개별 조건식을 세밀하게 따지는 조건 커버리지나 조건/결정 커버리지보다 상대적으로 보장 강도가 약합니다."
  },
  {
    "id": "GONGIBOB_07",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "자료구조 (AVL 트리)",
    "ncs_module": "M3",
    "subtopic_id": "3-2",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "AVL 트리에서 Balance Factor(BF)에 대한 설명으로 옳은 것은?",
    "choices": [
      { "number": 1, "text": "BF가 1이면, 왼쪽 서브트리가 오른쪽 서브트리보다 높이가 한 단계 낮다는 것을 의미한다.", "is_correct": False },
      { "number": 2, "text": "BF가 1이면, 왼쪽 서브트리와 오른쪽 서브트리의 높이가 같다는 것을 의미한다.", "is_correct": False },
      { "number": 3, "text": "BF가 0이면, 왼쪽 서브트리가 오른쪽 서브트리보다 높이가 한 단계 높다는 것을 의미한다.", "is_correct": False },
      { "number": 4, "text": "BF가 –1이면, 왼쪽 서브트리가 오른쪽 서브트리보다 높이가 한 단계 낮다는 것을 의미한다.", "is_correct": True },
      { "number": 5, "text": "BF가 –1이면, 왼쪽 서브트리가 오른쪽 서브트리보다 높이가 한 단계 높다는 것을 의미한다.", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\nBalance Factor(BF) = (왼쪽 서브트리 높이) - (오른쪽 서브트리 높이)\n· BF = 1: 왼쪽이 오른쪽보다 높이 1 높음\n· BF = 0: 양쪽 높이 동일\n· BF = -1: 왼쪽이 오른쪽보다 높이 1 낮음 (오른쪽이 1 높음)"
  },
  {
    "id": "GONGIBOB_08",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "알고리즘 공간 복잡도",
    "ncs_module": "M3",
    "subtopic_id": "3-2",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "다음 중 정렬 알고리즘의 공간 복잡도(최악)가 동일한 것만 나열한 것은?",
    "choices": [
      { "number": 1, "text": "퀵 정렬, 선택 정렬", "is_correct": False },
      { "number": 2, "text": "퀵 정렬, 병합 정렬", "is_correct": True },
      { "number": 3, "text": "퀵 정렬, 힙 정렬", "is_correct": False },
      { "number": 4, "text": "병합 정렬, 삽입 정렬", "is_correct": False },
      { "number": 5, "text": "병합 정렬, 선택 정렬", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n최악 공간 복잡도:\n· 병합 정렬: O(n) (추가 배열 필요)\n· 퀵 정렬: 최악 시 재귀 스택 O(n)\n· 힙 정렬, 선택 정렬, 삽입 정렬: 제자리 정렬(In-place)로 O(1)"
  },
  {
    "id": "GONGIBOB_09",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "미들웨어 아키텍처",
    "ncs_module": "M3",
    "subtopic_id": "3-1",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "응용 프로그램의 프로시저를 사용하여 원격 프로시저를 마치 로컬 프로시저처럼 호출하는 방식의 미들웨어는?",
    "choices": [
      { "number": 1, "text": "ORB", "is_correct": False },
      { "number": 2, "text": "WAS", "is_correct": False },
      { "number": 3, "text": "TP-Monitor", "is_correct": False },
      { "number": 4, "text": "MOM", "is_correct": False },
      { "number": 5, "text": "RPC", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\n⑤ RPC (Remote Procedure Call): 원격 프로시저를 마치 로컬 프로시저처럼 투명하게 호출하는 방식의 미들웨어입니다.\n① ORB: CORBA 표준 객체 지향 미들웨어\n② WAS: 동적 웹 콘텐츠 처리 미들웨어\n③ TP-Monitor: 온라인 트랜잭션 감시/처리 미들웨어\n④ MOM: 메시지 큐 기반 비동기 미들웨어"
  },
  {
    "id": "GONGIBOB_10",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "웹 서비스 아키텍처 (SOA)",
    "ncs_module": "M3",
    "subtopic_id": "3-1",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "웹 서비스 환경의 3대 개체 모델에서 서비스 등록·탐색을 중개하는 (가), 서비스를 발행하는 (나), 서비스를 바인딩하여 사용하는 (다)의 연결로 옳은 것은?",
    "choices": [
      { "number": 1, "text": "(가) Service Provider, (나) Service Requester, (다) Service Broker", "is_correct": False },
      { "number": 2, "text": "(가) Service Broker, (나) Service Requester, (다) Service Provider", "is_correct": False },
      { "number": 3, "text": "(가) Service Broker, (나) Service Provider, (다) Service Requester", "is_correct": True },
      { "number": 4, "text": "(가) Service Provider, (나) Service Broker, (다) Service Requester", "is_correct": False },
      { "number": 5, "text": "(가) Service Requester, (나) Service Broker, (다) Service Provider", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\n웹 서비스(SOA) 3대 개체:\n· Service Broker (서비스 중개자, UDDI): 서비스 등록 및 검색 제공\n· Service Provider (서비스 제공자): WSDL을 작성하고 서비스를 발행/제공\n· Service Requester (서비스 요청자): 브로커를 통해 서비스를 탐색하고 SOAP으로 바인딩하여 호출"
  },
  {
    "id": "GONGIBOB_11",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "GoF 디자인 패턴",
    "ncs_module": "M3",
    "subtopic_id": "3-3",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "접근이 어려운 객체와 여기에 연결하려는 객체 사이에서 인터페이스 역할을 수행하는 패턴으로 네트워크 연결, 메모리의 대용량 객체로의 접근 등에 주로 이용하는 디자인 패턴은?",
    "choices": [
      { "number": 1, "text": "책임 연쇄(Chain of Responsibility) 패턴", "is_correct": False },
      { "number": 2, "text": "추상 팩토리(Abstract Factory) 패턴", "is_correct": False },
      { "number": 3, "text": "팩토리 메소드(Factory Method) 패턴", "is_correct": False },
      { "number": 4, "text": "템플릿 메소드(Template Method) 패턴", "is_correct": False },
      { "number": 5, "text": "프록시(Proxy) 패턴", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\n프록시(Proxy) 패턴: 대리자 객체를 두어 실제 객체에 대한 접근을 제어하고 대리 처리(가상 프록시, 원격 프록시, 보호 프록시 등)를 수행하는 구조 패턴입니다."
  },
  {
    "id": "GONGIBOB_12",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "모듈 응집도",
    "ncs_module": "M3",
    "subtopic_id": "3-1",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "모듈이 다수의 관련 기능을 가질 때 모듈 안의 구성 요소들이 그 기능을 순차적으로 수행할 경우의 응집도는?",
    "choices": [
      { "number": 1, "text": "시간적 응집도(Temporal Cohesion)", "is_correct": False },
      { "number": 2, "text": "절차적 응집도(Procedural Cohesion)", "is_correct": True },
      { "number": 3, "text": "통신적 응집도(Communication Cohesion)", "is_correct": False },
      { "number": 4, "text": "순차적 응집도(Sequential Cohesion)", "is_correct": False },
      { "number": 5, "text": "기능적 응집도(Functional Cohesion)", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n· 절차적 응집도: 모듈 내부 요소들이 지정된 순서에 따라 순차적으로 수행됨 (단, 이전 결과가 다음 입력으로 쓰이지는 않음)\n· 순차적 응집도: 한 활동의 출력이 다음 활동의 입력으로 연결됨\n· 기능적 응집도: 단일 목표를 위해 완벽히 결합된 최고 등급의 응집도"
  },
  {
    "id": "GONGIBOB_13",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "코드 리팩토링",
    "ncs_module": "M3",
    "subtopic_id": "3-2",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "임시 변수에 수식을 대입하여 사용하던 것을 제거하고, 변수 참조 자리에 표현식 자체를 직접 치환하는 리팩토링 기법은?",
    "choices": [
      { "number": 1, "text": "Replace Temp with Query", "is_correct": False },
      { "number": 2, "text": "Introduce Local Extension", "is_correct": False },
      { "number": 3, "text": "Decompose Conditional", "is_correct": False },
      { "number": 4, "text": "Inline Temp", "is_correct": True },
      { "number": 5, "text": "Remove Control Flag", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\nInline Temp: 임시 변수에 수식을 저장하는 대신, 변수에 대한 모든 참조를 표현식 자체로 직접 치환하여 불필요한 임시 변수를 제거하는 리팩토링 기법입니다."
  },
  {
    "id": "GONGIBOB_14",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "UI/UX 설계 도구",
    "ncs_module": "M2",
    "subtopic_id": "2-1",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "다음 설명에 해당하는 UI 설계 도구는 무엇인가?\n\n[제시문]\n· 제작할 때는 각 페이지의 영역 구분, 콘텐츠, 텍스트 배치 등을 화면 단위로 설계한다.\n· 개발자나 디자이너 등이 레이아웃을 협의하거나 현재 진행 상태 등을 공유하기 위해 이를 사용한다.\n· 대표적인 예로 파워포인트, 키노트, 스케치, 일러스트, 포토샵 등이 있다.",
    "choices": [
      { "number": 1, "text": "와이어프레임(Wireframe)", "is_correct": True },
      { "number": 2, "text": "소프트 목업(Soft Mockup)", "is_correct": False },
      { "number": 3, "text": "프로토타입(Prototype)", "is_correct": False },
      { "number": 4, "text": "스토리 보드(Story Board)", "is_correct": False },
      { "number": 5, "text": "유스 케이스(Use Case)", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\n와이어프레임(Wireframe): 기획 초기에 페이지의 뼈대, 개략적인 레이아웃, UI 요소 배치를 화면 단위로 설계하는 정적 도구입니다."
  },
  {
    "id": "GONGIBOB_15",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "애자일 스크럼 (Scrum)",
    "ncs_module": "M1",
    "subtopic_id": "1-2",
    "ncs_title": "NCS M1 개발 프로세스 & 방법론",
    "question": "스크럼(Scrum)에 대한 설명이다. Ⓐ, Ⓑ에 들어갈 용어로 알맞은 것은?\n\n[제시문]\n· Ⓐ는 실제 개발 작업을 진행하는 과정으로, 보통 2~4주 정도의 기간 내에서 진행한다.\n· Ⓑ는 해당 스프린트에서 수행할 작업의 진행 상황을 확인할 수 있도록 시간의 경과에 따라 남은 작업 시간을 그래프로 표현한 것이다.",
    "choices": [
      { "number": 1, "text": "Ⓐ : 스프린트(Sprint), Ⓑ : 소멸 차트(Burn-down Chart)", "is_correct": True },
      { "number": 2, "text": "Ⓐ : 소멸 차트(Burn-down Chart), Ⓑ : 스프린트(Sprint)", "is_correct": False },
      { "number": 3, "text": "Ⓐ : 제품 백로그(Product Backlog), Ⓑ : 스프린트(Sprint)", "is_correct": False },
      { "number": 4, "text": "Ⓐ : 소멸 차트(Burn-down Chart), Ⓑ : 제품 백로그(Product Backlog)", "is_correct": False },
      { "number": 5, "text": "Ⓐ : 제품 백로그(Product Backlog), Ⓑ : 소멸 차트(Burn-down Chart)", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\nⒶ: 스프린트(Sprint) - 2~4주 주기의 실제 반복 개발 기간\nⒷ: 번다운 차트(Burn-down Chart) - 남은 작업 시간의 추이를 시각화한 차트"
  },
  {
    "id": "GONGIBOB_16",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "유한상태기계 (FSM)",
    "ncs_module": "M2",
    "subtopic_id": "2-2",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "유한상태변환기(FSM)의 무어(Moore) 모델과 밀리(Mealy) 모델 중 밀리 모델에 대한 설명으로 옳은 것을 모두 고르면?\n\n[제시문]\nㄱ. 출력값은 오직 현재 상태에 따라서만 결정된다.\nㄴ. 일반적으로 상태의 수를 줄이는데 사용한다.\nㄷ. 수학적으로 6-튜플 (S, S0, Σ, Λ, T, G)로 정의됨으로써 무어 모델과 튜플 구성이 동일하다.",
    "choices": [
      { "number": 1, "text": "ㄱ", "is_correct": False },
      { "number": 2, "text": "ㄱ, ㄴ", "is_correct": False },
      { "number": 3, "text": "ㄱ, ㄷ", "is_correct": False },
      { "number": 4, "text": "ㄴ, ㄷ", "is_correct": True },
      { "number": 5, "text": "ㄱ, ㄴ, ㄷ", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번 (ㄴ, ㄷ)\nㄱ은 무어(Moore) 모델에 대한 설명입니다. 무어 모델은 출력이 '오직 현재 상태'에 의존하지만, 밀리(Mealy) 모델은 출력이 '현재 상태와 입력값 모두'에 의존합니다. 밀리 모델은 전이(Transition) 자체에 출력을 바인딩하므로 상태의 수를 줄일 수 있습니다."
  },
  {
    "id": "GONGIBOB_17",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "UI 아키텍처 (OUI)",
    "ncs_module": "M2",
    "subtopic_id": "2-1",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "다음 보기의 UI(User Interface) 설계 방식으로 옳은 것은?\n\n[제시문]\n모든 자연상태에서 발견할 수 있는 다양한 형태, 변형, 유연, 진화 등의 특성을 반영한 사용자 인터페이스를 의미한다. 즉, 입력장치가 곧 출력장치가 되고, 현실에 존재하는 모든 사물이 입출력장치로 변화할 수 있으며, 인터페이스의 상태나 모양을 자유롭게 변형할 수 있다.",
    "choices": [
      { "number": 1, "text": "CLI", "is_correct": False },
      { "number": 2, "text": "TUI", "is_correct": False },
      { "number": 3, "text": "VUI", "is_correct": False },
      { "number": 4, "text": "OUI", "is_correct": True },
      { "number": 5, "text": "GUI", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\nOUI (Organic User Interface): 자연물이나 유기체처럼 형태가 휘어지거나 자유롭게 변형되며, 사물 자체가 입출력 인터페이스가 되는 차세대 UI 개념입니다."
  },
  {
    "id": "GONGIBOB_18",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "블랙박스 테스팅 기법",
    "ncs_module": "M4",
    "subtopic_id": "4-2",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "다음 중 블랙박스(Black-box) 테스트 검증기준으로 사용하는 것에 해당하는 것은 모두 몇 개인가?\n\n[제시문]\n동등분할, 경곗값 분석, 결정테이블, 페어와이즈 조합",
    "choices": [
      { "number": 1, "text": "0개", "is_correct": False },
      { "number": 2, "text": "1개", "is_correct": False },
      { "number": 3, "text": "2개", "is_correct": False },
      { "number": 4, "text": "3개", "is_correct": False },
      { "number": 5, "text": "4개", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번 (4개 모두 해당)\n동등분할(Equivalence Partitioning), 경곗값 분석(BVA), 결정테이블(Decision Table), 페어와이즈 조합(Pairwise Testing) 등은 모두 소스코드 내부 구조를 보지 않고 명세에 기반하는 블랙박스 테스트 기법입니다."
  },
  {
    "id": "GONGIBOB_19",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "소프트웨어 유지보수",
    "ncs_module": "M8",
    "subtopic_id": "8-1",
    "ncs_title": "NCS M8 형상관리 & 유지보수",
    "question": "다음 유지보수 활동 가운데 적응유지보수(Adaptive Maintenance)와 관련된 것으로 가장 올바른 것은?",
    "choices": [
      { "number": 1, "text": "소프트웨어에 새로운 기능을 추가하여 버전을 업그레이드한다.", "is_correct": False },
      { "number": 2, "text": "소스코드를 분석하여 설계문서를 제작한다.", "is_correct": False },
      { "number": 3, "text": "사용 중에 발생된 오류를 수정한다.", "is_correct": False },
      { "number": 4, "text": "하드웨어의 변경으로 인하여 소프트웨어를 수정한다.", "is_correct": True },
      { "number": 5, "text": "코드의 기능 변경 없이 복잡하게 작성된 코드를 가독성 높게 수정하였다.", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\n적응유지보수: 운영체제, 하드웨어, 컴파일러 등 환경 변화에 소프트웨어를 적응시키기 위한 수정 활동입니다.\n① 완전유지보수 (기능 추가/성능 개선)\n②, ⑤ 예방유지보수 (가독성 향상, 역공학)\n③ 수정유지보수 (잠재 결함/에러 수정)"
  },
  {
    "id": "GONGIBOB_20",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "모듈 결합도",
    "ncs_module": "M3",
    "subtopic_id": "3-1",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "다음 보기에서 (ㄱ)과 (ㄴ)에 들어갈 결합도로 알맞은 것은?\n\n[제시문]\n(ㄱ): 모듈들이 간단한 변수를 매개변수로 교환\n(ㄴ): 모듈들이 제어용 플래그를 교환",
    "choices": [
      { "number": 1, "text": "(ㄱ): 스탬프 결합도, (ㄴ): 데이터 결합도", "is_correct": False },
      { "number": 2, "text": "(ㄱ): 데이터 결합도, (ㄴ): 제어 결합도", "is_correct": True },
      { "number": 3, "text": "(ㄱ): 제어 결합도, (ㄴ): 내용 결합도", "is_correct": False },
      { "number": 4, "text": "(ㄱ): 스탬프 결합도, (ㄴ): 제어 결합도", "is_correct": False },
      { "number": 5, "text": "(ㄱ): 데이터 결합도, (ㄴ): 내용 결합도", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n· 데이터 결합도(Data): 단순 스칼라 변수값만 매개변수로 주고받음 (가장 약함, 최선)\n· 제어 결합도(Control): 제어 플래그나 스위치 신호를 전달하여 다른 모듈의 내부 흐름을 제어함"
  },
  {
    "id": "GONGIBOB_21",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "프로젝트 일정관리 (PERT)",
    "ncs_module": "M5",
    "subtopic_id": "5-1",
    "ncs_title": "NCS M5 프로젝트 관리",
    "question": "다음 중 PERT 기법에 대한 설명으로 옳은 것은 총 몇 개인가?\n\n[제시문]\nㄱ. PERT는 프로젝트에 필요한 전체 작업의 상호 관계를 표시하는 네트워크로 각 작업별로 낙관적인 경우, 가능성이 있는 경우, 비관적인 경우로 나누어 각 단계별 종료 시기를 결정하는 방법이다.\nㄴ. 노드와 간선으로 구성되며 원 노드에는 낙관치, 기대치, 비관치를, 간선에는 작업을 표시한다.\nㄷ. 소요 기간 예측이 용이한 소프트웨어에서 사용한다.\nㄹ. 결정 경로, 작업에 대한 경계 시간, 작업 간의 상호 관련성 등을 알 수 있다.",
    "choices": [
      { "number": 1, "text": "0개", "is_correct": False },
      { "number": 2, "text": "1개", "is_correct": False },
      { "number": 3, "text": "2개", "is_correct": True },
      { "number": 4, "text": "3개", "is_correct": False },
      { "number": 5, "text": "4개", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번 (ㄱ, ㄹ만 옳음)\nㄴ: 노드(원)에는 사건/작업 완료 이벤트를 표시하고, 화살표(간선)에 작업 및 소요 기간(3점 추정치)을 표기합니다.\nㄷ: 소요 기간 예측이 불확실하고 과거 경험이 없는 신규 프로젝트에 적합합니다."
  },
  {
    "id": "GONGIBOB_22",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "신뢰성과 가용성",
    "ncs_module": "M9",
    "subtopic_id": "9-1",
    "ncs_title": "NCS M9 소프트웨어 품질",
    "question": "신뢰성과 가용성에 대한 설명으로 옳은 것을 모두 고르면?\n\n[제시문]\nㄱ. 간단한 소프트웨어 신뢰성 측정을 위해서는 MTBF(Mean Time Between Failure)를 이용한다.\nㄴ. MTBF(Mean Time Between Failure)는 MTTF(Mean Time To Failure)와 MTTR(Mean Time To Repair)의 차이로 측정할 수 있다.\nㄷ. MTTF(Mean Time To Failure)는 고장 평균 시간을 의미하고, MTTR(Mean Time To Repair)은 평균 수리 시간을 의미한다.\nㄹ. 가용성은 시스템의 총 운용시간 중 정상적으로 가동된 시간의 비율을 의미한다.",
    "choices": [
      { "number": 1, "text": "ㄱ, ㄴ, ㄷ", "is_correct": False },
      { "number": 2, "text": "ㄱ, ㄴ, ㄹ", "is_correct": False },
      { "number": 3, "text": "ㄱ, ㄷ, ㄹ", "is_correct": True },
      { "number": 4, "text": "ㄴ, ㄷ, ㄹ", "is_correct": False },
      { "number": 5, "text": "ㄱ, ㄴ, ㄷ, ㄹ", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번 (ㄱ, ㄷ, ㄹ)\nㄴ: MTBF는 차이가 아니라 합입니다. 즉, MTBF = MTTF + MTTR 입니다. 가용성 Availability = MTTF / (MTTF + MTTR) = MTTF / MTBF 입니다."
  },
  {
    "id": "GONGIBOB_23",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "GoF 디자인 패턴",
    "ncs_module": "M3",
    "subtopic_id": "3-3",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "구현부에서 추상층을 분리하여 각자 독립적으로 변형할 수 있게 하는 패턴으로, 기능의 계층과 구현의 계층을 각각 별도의 클래스로 구현하는 디자인 패턴의 명칭은?",
    "choices": [
      { "number": 1, "text": "브릿지(Bridge) 패턴", "is_correct": True },
      { "number": 2, "text": "컴포지트(Composite) 패턴", "is_correct": False },
      { "number": 3, "text": "데코레이터(Decorator) 패턴", "is_correct": False },
      { "number": 4, "text": "옵서버(Observer) 패턴", "is_correct": False },
      { "number": 5, "text": "어댑터(Adapter) 패턴", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\n브릿지(Bridge) 패턴: '추상부(기능 계층)'와 '구현부(플랫폼 계층)'를 분리하여 브릿지 인터페이스로 연결함으로써 양쪽이 독립적으로 확장/변형될 수 있게 하는 구조 패턴입니다."
  },
  {
    "id": "GONGIBOB_24",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "소프트웨어 품질관리",
    "ncs_module": "M9",
    "subtopic_id": "9-1",
    "ncs_title": "NCS M9 소프트웨어 품질",
    "question": "결함을 조기에 발견하여 차후 공정에 문제가 발생하지 않도록 프로젝트 산출물과 프로젝트 진행상태가 계획과 부합하는지를 규명하는 활동으로 옳은 것은?",
    "choices": [
      { "number": 1, "text": "착수 점검회의", "is_correct": False },
      { "number": 2, "text": "사내감리", "is_correct": False },
      { "number": 3, "text": "워크스루", "is_correct": True },
      { "number": 4, "text": "테스트", "is_correct": False },
      { "number": 5, "text": "고객검토", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\n워크스루(Walkthrough): 개발자가 주도하여 동료들과 함께 산출물을 단계별로 훑어가며(walk-through) 조기에 결함을 발견하고 프로젝트가 계획에 부합하는지 비공식적으로 검토하는 활동입니다."
  },
  {
    "id": "GONGIBOB_25",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "소프트웨어 품질 특성",
    "ncs_module": "M9",
    "subtopic_id": "9-1",
    "ncs_title": "NCS M9 소프트웨어 품질",
    "question": "다음 사례들은 소프트웨어의 품질 중 어느 것과 관련이 있는가?\n\n[제시문]\n- 공장의 생산 라인에 사람 손이나 물체가 인식되면 절단 작업이 중단되어야 한다.\n- 전동차 출발 시 문에 가방 같은 물체가 끼면 출발을 멈춰야 한다.",
    "choices": [
      { "number": 1, "text": "신뢰성", "is_correct": False },
      { "number": 2, "text": "성능", "is_correct": False },
      { "number": 3, "text": "안전성", "is_correct": True },
      { "number": 4, "text": "보안성", "is_correct": False },
      { "number": 5, "text": "사용성", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\n안전성(Safety): 시스템 오류나 오작동으로 인해 인명 피해, 상해, 환경 파괴 등 치명적인 재해가 발생하지 않도록 방어하는 소프트웨어 품질 특성입니다."
  },
  {
    "id": "GONGIBOB_26",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "V-모델 테스팅 레벨",
    "ncs_module": "M4",
    "subtopic_id": "4-2",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "소프트웨어 개발 단계에 따른 테스트 중 '인터페이스를 검증하는 테스트'와 '요구분석을 검증하는 테스트'를 순서대로 나열한 것은?",
    "choices": [
      { "number": 1, "text": "단위 테스트, 통합 테스트", "is_correct": False },
      { "number": 2, "text": "통합 테스트, 시스템 테스트", "is_correct": True },
      { "number": 3, "text": "시스템 테스트, 인수 테스트", "is_correct": False },
      { "number": 4, "text": "통합 테스트, 인수 테스트", "is_correct": False },
      { "number": 5, "text": "단위 테스트, 인수 테스트", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\nV-모델의 대응 관계:\n· 단위 테스트 ↔ 상세 설계 (모듈 내부 알고리즘 검증)\n· 통합 테스트 ↔ 기본 설계/아키텍처 (모듈 간 인터페이스 검증)\n· 시스템 테스트 ↔ 요구사항 분석 (전체 시스템 기능/비기능 검증)\n· 인수 테스트 ↔ 사용자 요구사항 (실제 비즈니스 인수 기준 충족 검증)"
  },
  {
    "id": "GONGIBOB_27",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "소프트웨어 비용 산정 (Man-Month)",
    "ncs_module": "M5",
    "subtopic_id": "5-2",
    "ncs_title": "NCS M5 프로젝트 관리",
    "question": "어떤 소프트웨어의 총 개발 기간은 6개월이며, 2명의 개발 인력이 처음에 투입되었다. a개월이 지난 후 추가로 1명이 투입되고, 다시 1개월 후 1명이 더 투입되어 개발이 완료되었을 때, 투입된 총 인－월(Man-Month)은 19이다. a의 값은 얼마인가?",
    "choices": [
      { "number": 1, "text": "1", "is_correct": False },
      { "number": 2, "text": "2", "is_correct": True },
      { "number": 3, "text": "3", "is_correct": False },
      { "number": 4, "text": "4", "is_correct": False },
      { "number": 5, "text": "5", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n· 초기 2명: 6개월 전 기간 투입 = 2 * 6 = 12 M/M\n· a개월 후 추가 투입된 1명: (6 - a)개월 투입 = 1 * (6 - a)\n· 다시 1개월 후(a+1개월 후) 추가 투입된 1명: (6 - (a + 1)) = (5 - a)개월 투입 = 1 * (5 - a)\n· 총 M/M = 12 + (6 - a) + (5 - a) = 23 - 2a = 19\n∴ 2a = 4 ⇒ a = 2"
  },
  {
    "id": "GONGIBOB_28",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "프로젝트 관리 일정 계획",
    "ncs_module": "M5",
    "subtopic_id": "5-1",
    "ncs_title": "NCS M5 프로젝트 관리",
    "question": "다음 프로젝트 관리 방법 중 일정 계획 방법론에 해당하는 것은 총 몇 개인가?\n\n[제시문]\nPERT, CPM, WBS, PSL/PSA, DFD, Putnam, COCOMO",
    "choices": [
      { "number": 1, "text": "1개", "is_correct": False },
      { "number": 2, "text": "2개", "is_correct": False },
      { "number": 3, "text": "3개", "is_correct": True },
      { "number": 4, "text": "4개", "is_correct": False },
      { "number": 5, "text": "5개", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번 (PERT, CPM, WBS)\n· 일정 계획: PERT, CPM, WBS, 간트 차트 (3개)\n· 요구사항 분석: PSL/PSA, DFD\n· 비용 산정: Putnam, COCOMO"
  },
  {
    "id": "GONGIBOB_29",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "정적 테스트 기법",
    "ncs_module": "M4",
    "subtopic_id": "4-2",
    "ncs_title": "NCS M4 테스팅 & 검증",
    "question": "소프트웨어 테스트 기법 중 원시코드 뿐만 아니라 각 단계 산출물의 문서 등을 포함하여 분석하고 품질을 평가하는 것을 무엇이라고 하는가?",
    "choices": [
      { "number": 1, "text": "검토 회의", "is_correct": False },
      { "number": 2, "text": "소프트웨어 검사(Inspection)", "is_correct": True },
      { "number": 3, "text": "동료 검토", "is_correct": False },
      { "number": 4, "text": "명세 기반 테스트", "is_correct": False },
      { "number": 5, "text": "개별 검토", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n소프트웨어 검사 (인스펙션, Inspection): 작성자를 제외한 훈련된 전문가 검사 팀이 체크리스트를 기반으로 코드 및 모든 단계의 산출물 문서를 정밀하게 분석하여 결함을 식별하는 공식 검토 기법입니다."
  },
  {
    "id": "GONGIBOB_30",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "코드 리팩토링",
    "ncs_module": "M3",
    "subtopic_id": "3-2",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "파라미터 값에 따라 분기하여 다른 동작을 수행하던 메소드를 각각의 파라미터 값에 대응하는 명시적인 개별 메소드(setHeight, setWidth)로 분리하는 리팩토링과 가장 관련이 깊은 것은?",
    "choices": [
      { "number": 1, "text": "Replace Parameter with Explicit Methods", "is_correct": True },
      { "number": 2, "text": "Replace Type Code with Class", "is_correct": False },
      { "number": 3, "text": "Replace Method with Method Object", "is_correct": False },
      { "number": 4, "text": "Replace Nested Conditional with Guard Clauses", "is_correct": False },
      { "number": 5, "text": "Replace Record with Data Class", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\nReplace Parameter with Explicit Methods (매개변수를 명시적 메소드로 전환): 조건 분기의 기준이 되는 매개변수를 없애고, 각 동작별로 명확한 이름을 가진 개별 메소드를 제공하여 가독성과 타입 안정성을 높이는 리팩토링 기법입니다."
  },
  {
    "id": "GONGIBOB_31",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "애자일 방법론",
    "ncs_module": "M1",
    "subtopic_id": "1-2",
    "ncs_title": "NCS M1 개발 프로세스 & 방법론",
    "question": "30일마다 동작 가능한 제품을 제공하는 스프린트(Sprint)를 중심으로 하고 있으며, 매일 정해진 시간에 정해진 장소에서 짧은 미팅을 진행하는 프로젝트 관리 중심의 애자일 방법론은?",
    "choices": [
      { "number": 1, "text": "Extreme Programming (XP)", "is_correct": False },
      { "number": 2, "text": "Crystal Family", "is_correct": False },
      { "number": 3, "text": "Feature-Driven Development (FDD)", "is_correct": False },
      { "number": 4, "text": "Adaptive Software Development (ASD)", "is_correct": False },
      { "number": 5, "text": "Scrum", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\n스크럼(Scrum): 정기적인 스프린트 주기와 데일리 스크럼(일일 미팅)을 중심으로 백로그를 점진적으로 소진해 나가는 대표적인 프로젝트 관리 프레임워크입니다."
  },
  {
    "id": "GONGIBOB_32",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "GoF 디자인 패턴",
    "ncs_module": "M3",
    "subtopic_id": "3-3",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "소프트웨어 디자인 패턴 중 (ㄱ)과 (ㄴ)에 들어갈 용어로 알맞은 것은?\n\n[제시문]\n·(ㄱ) : 상위에 통합 인터페이스를 구성하여 복잡한 서브시스템 클래스들의 기능을 리모컨처럼 편리하게 다룰 수 있는 Wrapper 객체 제공\n·(ㄴ) : 다수의 유사 객체를 생성할 때 인스턴스를 공유하여 메모리 부담을 획기적으로 절약하는 패턴",
    "choices": [
      { "number": 1, "text": "(ㄱ): Abstract Factory 패턴, (ㄴ): Facade 패턴", "is_correct": False },
      { "number": 2, "text": "(ㄱ): Facade 패턴, (ㄴ): Flyweight 패턴", "is_correct": True },
      { "number": 3, "text": "(ㄱ): Abstract Factory 패턴, (ㄴ): Flyweight 패턴", "is_correct": False },
      { "number": 4, "text": "(ㄱ): Facade 패턴, (ㄴ): Abstract Factory 패턴", "is_correct": False },
      { "number": 5, "text": "(ㄱ): Flyweight 패턴, (ㄴ): Facade 패턴", "is_correct": False }
    ],
    "answer": 2,
    "explain": "정답 2번\n(ㄱ) 퍼사드(Facade) 패턴: 복잡한 내부 서브시스템의 통합 인터페이스를 제공하는 창구 역할\n(ㄴ) 플라이웨이트(Flyweight) 패턴: 공통 상태를 공유 풀(Pool)에서 공유하여 객체 생성 비용 및 메모리 절감"
  },
  {
    "id": "GONGIBOB_33",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "SDLC 생명주기",
    "ncs_module": "M1",
    "subtopic_id": "1-1",
    "ncs_title": "NCS M1 개발 프로세스 & 방법론",
    "question": "SDLC (Software Development Life Cycle) 모형을 아래의 5단계로 나열할 때, 세 번째 단계에 해당하는 것은?\n(a. 설계, b. 유지보수, c. 구현, d. 요구분석, e. 테스트)",
    "choices": [
      { "number": 1, "text": "a. 설계", "is_correct": False },
      { "number": 2, "text": "b. 유지보수", "is_correct": False },
      { "number": 3, "text": "c. 구현", "is_correct": True },
      { "number": 4, "text": "d. 요구분석", "is_correct": False },
      { "number": 5, "text": "e. 테스트", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\n표준 SDLC 5단계 순서: 요구분석(1단계) → 설계(2단계) → 구현(3단계) → 테스트(4단계) → 유지보수(5단계)"
  },
  {
    "id": "GONGIBOB_34",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "품질보증 및 감리",
    "ncs_module": "M9",
    "subtopic_id": "9-1",
    "ncs_title": "NCS M9 소프트웨어 품질",
    "question": "품질 조직에 의한 프로젝트의 객관적 평가를 통해 위험을 조기에 파악하고 종합적인 문제 해결을 실현하고자 하는 활동은?",
    "choices": [
      { "number": 1, "text": "테스트", "is_correct": False },
      { "number": 2, "text": "착수 점검회의", "is_correct": False },
      { "number": 3, "text": "사내감리", "is_correct": True },
      { "number": 4, "text": "워크스루", "is_correct": False },
      { "number": 5, "text": "고객검토", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\n사내감리: 독립된 내부 품질/감리 조직이 프로젝트의 프로세스와 산출물을 객관적으로 점검하여 위험을 사전에 식별하고 종합적인 품질 보증을 도모하는 활동입니다."
  },
  {
    "id": "GONGIBOB_35",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "구조적 분석 모델링",
    "ncs_module": "M2",
    "subtopic_id": "2-2",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "구조적 분석의 세부 작업 순서를 5단계로 분류할 때, 네 번째 단계에 해당하는 것은?\n(자료 사전 작성, 소단위 명세서 작성, 상위 자료 흐름도 작성, 하위 자료 흐름도 작성, 배경도 작성)",
    "choices": [
      { "number": 1, "text": "자료 사전 작성", "is_correct": True },
      { "number": 2, "text": "소단위 명세서 작성", "is_correct": False },
      { "number": 3, "text": "상위 자료 흐름도 작성", "is_correct": False },
      { "number": 4, "text": "하위 자료 흐름도 작성", "is_correct": False },
      { "number": 5, "text": "배경도 작성", "is_correct": False }
    ],
    "answer": 1,
    "explain": "정답 1번\n구조적 분석의 5단계 순서:\n1단계: 배경도(Context Diagram) 작성\n2단계: 상위 자료흐름도(DFD) 작성\n3단계: 하위 자료흐름도(DFD) 상세화\n4단계: 자료 사전(Data Dictionary) 작성\n5단계: 소단위 명세서(Mini-Spec) 작성"
  },
  {
    "id": "GONGIBOB_36",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "자료흐름도 (DFD) 원칙",
    "ncs_module": "M2",
    "subtopic_id": "2-2",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "자료흐름도(DFD) 작성 원칙 중 '일반적으로 입력 자료흐름에 편집, 계산 등을 수행하여 출력 자료흐름을 산출하는 원칙'은?",
    "choices": [
      { "number": 1, "text": "자료 보존의 원칙", "is_correct": False },
      { "number": 2, "text": "지속성의 원칙", "is_correct": False },
      { "number": 3, "text": "독립성의 원칙", "is_correct": False },
      { "number": 4, "text": "자료 변환의 원칙", "is_correct": True },
      { "number": 5, "text": "순차 처리의 원칙", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\n· 자료 변환의 원칙: 프로세스는 들어온 입력 자료를 변환(편집, 계산)하여 새로운 출력 자료를 생성해야 합니다.\n· 자료 보존의 원칙: 출력 자료는 반드시 들어온 입력을 바탕으로 생성되어야 함 (마법 같은 생성 금지)"
  },
  {
    "id": "GONGIBOB_37",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "형상관리 조직 및 역할",
    "ncs_module": "M8",
    "subtopic_id": "8-1",
    "ncs_title": "NCS M8 형상관리 & 유지보수",
    "question": "다음 중 형상 관리 담당자(Configuration Management Staff)의 역할로 옳은 것은?",
    "choices": [
      { "number": 1, "text": "베이스라인 승인", "is_correct": False },
      { "number": 2, "text": "형상 관리 활동에 대해 프로젝트 관리자와 팀원에게 보고 및 공지", "is_correct": False },
      { "number": 3, "text": "형상 관리 계획서를 승인하고 형상 관리가 적절히 수행될 수 있도록 지원/감독", "is_correct": False },
      { "number": 4, "text": "형상 관리 계획에 따라 백업 수행", "is_correct": False },
      { "number": 5, "text": "형상 관리 책임자와 협조하여 형상 관리 계획에 따라 형상 관리 활동 수행", "is_correct": True }
    ],
    "answer": 5,
    "explain": "정답 5번\n· 형상관리위원회(CCB): 베이스라인 공식 승인\n· 형상관리책임자: 형상관리 계획 수립, 보고 및 공지\n· 프로젝트관리자: 계획서 승인 및 총괄 감독\n· 라이브러리담당자: 라이브러리 접근 통제 및 정기 백업 수행\n· 형상관리담당자: 책임자와 협조하여 실제 형상 관리 실무 활동 수행"
  },
  {
    "id": "GONGIBOB_38",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "테스트 주도 개발 (TDD)",
    "ncs_module": "M1",
    "subtopic_id": "1-2",
    "ncs_title": "NCS M1 개발 프로세스 & 방법론",
    "question": "테스트 주도 개발(TDD)의 특징 중 단점으로 가장 옳지 않은 것은?",
    "choices": [
      { "number": 1, "text": "객체 지향적인 코드 개발 유도", "is_correct": False },
      { "number": 2, "text": "설계 수정 시간의 단축", "is_correct": False },
      { "number": 3, "text": "거의 없는 사전준비 기간", "is_correct": True },
      { "number": 4, "text": "리팩토링의 용이성 제공", "is_correct": False },
      { "number": 5, "text": "테스트 코드의 문서화 대체", "is_correct": False }
    ],
    "answer": 3,
    "explain": "정답 3번\nTDD의 대표적인 단점은 '사전 준비 기간과 러닝 커브'입니다. 개발자가 TDD를 숙달하기 위해 최소 수 주에서 수개월의 교육과 훈련이 필요하며 초기 생산성이 저하될 수 있으므로 '사전준비 기간이 거의 없다'는 것은 명백한 거짓입니다."
  },
  {
    "id": "GONGIBOB_39",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "객체지향 설계 원리",
    "ncs_module": "M3",
    "subtopic_id": "3-2",
    "ncs_title": "NCS M3 아키텍처 & 설계",
    "question": "객체지향 프로그래밍만의 특징 중 부모 클래스에서 물려받은 가상 함수를 자식 클래스 내에서 오버라이딩하여 실행 시점에 다른 동작을 수행하도록 하는 것은?",
    "choices": [
      { "number": 1, "text": "캡슐화", "is_correct": False },
      { "number": 2, "text": "추상화", "is_correct": False },
      { "number": 3, "text": "상속", "is_correct": False },
      { "number": 4, "text": "다형성(Polymorphism)", "is_correct": True },
      { "number": 5, "text": "익명함수", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\n다형성(Polymorphism): 동일한 인터페이스나 메소드 호출에 대해 각 서브클래스가 오버라이딩을 통해 저마다의 고유한 방식으로 응답할 수 있게 하는 객체지향의 핵심 특징입니다."
  },
  {
    "id": "GONGIBOB_40",
    "source": "공무원·공기업 전공기출",
    "exam_title": "소프트웨어공학 핵심 기출 40제",
    "chapter": "자료사전 (DD) 기호",
    "ncs_module": "M2",
    "subtopic_id": "2-2",
    "ncs_title": "NCS M2 요구사항 분석",
    "question": "자료사전(Data Dictionary)의 기호 중 '( )'의 의미는 무엇인가?",
    "choices": [
      { "number": 1, "text": "연결", "is_correct": False },
      { "number": 2, "text": "반복", "is_correct": False },
      { "number": 3, "text": "주석", "is_correct": False },
      { "number": 4, "text": "생략 (Optional)", "is_correct": True },
      { "number": 5, "text": "정의", "is_correct": False }
    ],
    "answer": 4,
    "explain": "정답 4번\n자료사전(DD) 표준 기호:\n· = : 자료의 정의 (~로 구성된다)\n· + : 자료의 연결 (AND)\n· ( ) : 자료의 생략 가능 (Optional)\n· { } : 자료의 반복 (Iteration)\n· [ | ] : 자료의 선택 (OR)\n· * * : 주석 및 설명"
  }
]

with open('data/private/ncs_questions.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

existing_ids = {q['id'] for q in existing}
added = 0
for q in questions_40:
    if q['id'] not in existing_ids:
        existing.append(q)
        added += 1

with open('data/private/ncs_questions.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print(f"Added {added} questions to private storage. Total count: {len(existing)}")
